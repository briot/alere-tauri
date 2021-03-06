use chrono::{NaiveDateTime, TimeZone};
use chrono_tz::UTC;
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use diesel::sql_types::{Nullable, Text, Timestamp};
use diesel::sqlite::{Sqlite, SqliteConnection};
use diesel::{sql_query, QueryResult, RunQueryDsl};
use memoize::memoize;
use regex::Regex;
use rrule::{RRule, RRuleError, RRuleSet, Unvalidated};
use tauri::api::path::document_dir;
use lazy_static::lazy_static;
use log::{debug, log_enabled, Level::Debug};

diesel_migrations::embed_migrations!(); //  creates embedded_migrations

sql_function!(
    fn alr_next_event(
        rule: Text,
        timestamp: Timestamp,  //  reference timestamp
        previous: Nullable<Timestamp>) -> Nullable<Timestamp>
);

#[memoize(Capacity: 120)] // thread-local
fn parse_ruleset(start: NaiveDateTime, rule: String) -> Result<RRuleSet, RRuleError> {
    let s = UTC.timestamp(start.timestamp(), 0);
    let raw: RRule<Unvalidated> = rule.parse()?;
    let r = raw.build(s)?;
    Ok(r)
}

fn next_event(
    rule: String,
    timestamp: NaiveDateTime,
    previous: Option<NaiveDateTime>,
) -> Option<NaiveDateTime> {
    if rule.is_empty() {
        // only occurs once, no recurring
        match previous {
            Some(_) => None,
            None => Some(timestamp),
        }
    } else {
        let rs = match parse_ruleset(timestamp, rule) {
            Ok(r) => r,
            Err(e) => {
                print!("Error parsing rrule {:?}", e);
                return None;
            }
        };
        let prev = UTC.timestamp(previous.map(|p| p.timestamp()).unwrap_or(0), 0);
        let next = rs.just_after(
            UTC.timestamp(prev.timestamp(), 0),
            false, // inclusive
        );
        next.ok()?.map(|dt| dt.naive_utc())
    }
}

fn add_functions(connection: &SqliteConnection) {
    alr_next_event::register_impl(connection, next_event)
        .expect("Could not register alr_next_event");
}

type SqlitePool = Pool<ConnectionManager<SqliteConnection>>;

fn create_pool() -> SqlitePool {
    let db = match document_dir() {
        Some(mut doc) => {
            doc.push("alere");

            // Create the directory if needed
            _ = std::fs::create_dir(doc.as_path());

            doc.push("alere_db.sqlite3");
            String::from(doc.to_str().unwrap())
        }
        None => String::from("/tmp/alere_db.sqlite3"),
    };
    println!("Database is {:?}", &db);
    let pool = SqlitePool::builder()
        .max_size(8)
        .build(ConnectionManager::new(db))
        .expect("Failed to create connection pool");

    let connection = pool.get().unwrap();

    let migrated = embedded_migrations::run_with_output(
        &connection, &mut std::io::stdout());
    match migrated {
        Ok(_) => (),
        Err(e) => println!("{}", e),
    };

    pool
}

lazy_static! {
    static ref POOL: SqlitePool = create_pool();
    static ref RE_REMOVE_COMMENTS: Regex = Regex::new(r"--.*").unwrap();
    static ref RE_COLLAPSE_SPACES: Regex = Regex::new(r"\s+").unwrap();
}

pub fn get_connection() -> PooledConnection<ConnectionManager<SqliteConnection>> {
    let connection = POOL.get().unwrap();
    add_functions(&connection);
    connection
}

pub fn log_cleanup_query(msg: &str, query: &str) {
    if log_enabled!(Debug) {
       let query = RE_REMOVE_COMMENTS.replace_all(query, "");
       let query = RE_COLLAPSE_SPACES.replace_all(&query, " ");
       debug!("{} {}", &msg, &query);
    }
}

pub fn execute_and_log<U: diesel::query_source::QueryableByName<Sqlite>>(
    msg: &str,
    query: &str,
) -> QueryResult<Vec<U>> {
    let connection = super::connections::get_connection();
    let res = sql_query(query).load(&connection);
    if let Err(ref r) = res {
        log_cleanup_query(&msg, &query);
        log::error!("{:?}: Error in query {:?}", msg, r);
    }
    res
}
