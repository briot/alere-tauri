use diesel::prelude::*;
use chrono::{DateTime, Utc, TimeZone};
use log::info;
use serde::Serialize;
use std::collections::HashMap;
use diesel::sql_types::Integer;
use super::accounts::{commodity_kinds, price_sources};
use super::models::{AccountId, CommodityId, Commodity, Roi};

#[derive(Serialize)]
pub struct Position {
    avg_cost: f32,
    equity: f32,
    gains: f32,
    invested: f32,
    pl: f32,
    roi: f32,
    shares: f32,
    weighted_avg: f32,
}

impl Position {
    pub fn new(roi: &Roi) -> Self {
        Position {
            avg_cost: roi.average_cost.unwrap_or(f32::NAN),
            equity: roi.balance,
            gains: roi.realized_gain,
            invested: roi.invested,
            pl: roi.pl,
            roi: roi.roi.unwrap_or(f32::NAN),
            shares: roi.shares,
            weighted_avg: roi.weighted_average.unwrap_or(f32::NAN),
        }
    }
}

impl Default for Position {
    fn default() -> Self {
        Position {
            avg_cost: 0.0,
            equity: 0.0,
            gains: 0.0,
            invested: 0.0,
            pl: 0.0,
            roi: 0.0,
            shares: 0.0,
            weighted_avg: 0.0,
        }
    }
}

#[derive(Serialize)]
pub struct Price {
    t: i64,  //  DateTime<Utc>,
    price: f32,
    roi: f32,
    shares: f32,
}

/// Details on an investment account

#[derive(Serialize)]
pub struct ForAccount {
    account: AccountId,
    start: Position,                    // as of mindate
    end: Position,                      // as of maxdate
    oldest: Option<DateTime<Utc>>,      // oldest transaction (for annualized)
    most_recent: Option<DateTime<Utc>>, // most recent transaction
    now_for_annualized: DateTime<Utc>,
    prices: Vec<Price>,
    annualized_roi: f32,
    period_roi: f32,
}

impl ForAccount {
    pub fn new(id: AccountId) -> ForAccount {
        ForAccount {
            account: id,
            start: Default::default(),
            end: Default::default(),
            oldest: None,
            most_recent: None,
            now_for_annualized: Utc::now(),
            prices: vec![],
            annualized_roi: f32::NAN,
            period_roi: f32::NAN,
        }
    }
}

/// Details on a traded symbol

#[derive(Serialize)]
pub struct Symbol {  //  <'a> {
    id: CommodityId,
    ticker: String,
    source: i32,
    is_currency: bool,
    accounts: Vec<AccountId>,
    price_scale: i32,
}

#[derive(QueryableByName)]
struct AccountIdAndCommodity {

    #[sql_type = "Integer"]
    id: AccountId,

    #[sql_type = "Integer"]
    commodity_id: CommodityId,
}

#[tauri::command]
pub async fn quotes(
    mindate: DateTime<Utc>,
    maxdate: DateTime<Utc>,
    currency: CommodityId,
    commodities: Option<Vec<CommodityId>>,
    accounts: Option<Vec<AccountId>>
) -> (Vec<Symbol>, HashMap<AccountId, ForAccount>) {
    info!("quotes {:?} {:?} {}", &mindate, &maxdate, currency);

    // Find all commodities

    let mut all_commodities: Vec<Commodity> = {
       use super::schema::alr_commodities::dsl::*;
       let c = &super::connections::get_connection();
       alr_commodities.load::<Commodity>(c).expect("Error reading commodities")
    };

    if let Some(commodities) = commodities {
        all_commodities.retain(|comm| commodities.contains(&comm.id));
    }
    let mut symbols = HashMap::new();
    all_commodities.iter_mut().for_each(
        |comm| {
            symbols.insert(comm.id, Symbol {
                id: comm.id,
                ticker: comm.quote_symbol
                    .as_ref()
                    .cloned()
                    .unwrap_or_else(|| "".to_string()),
                source: comm.quote_source_id.unwrap_or(price_sources::USER),
                is_currency: comm.kind == commodity_kinds::CURRENCY,
                price_scale: comm.price_scale,
                accounts: vec![],
            });
        }
    );

    // Find the corresponding accounts

    let filter_account = match accounts {
        Some(accs) => format!(
            "AND a.id IN ({})",
            accs
            .iter()
            .map(|id| id.to_string())
            .collect::<Vec<_>>()
            .join(",")
        ),
        None       => "".to_string(),
    };
    let query = format!(
        "
        SELECT a.id, a.commodity_id
        FROM alr_accounts a 
        JOIN alr_account_kinds k ON (a.kind_id = k.id)
        WHERE k.is_trading {filter_account}
        "
    );
    let result = super::connections::execute_and_log::<AccountIdAndCommodity>(
        "quotes,acc", &query);
    let mut accs = HashMap::new();
    if let Ok(accounts) = result {
        accounts
        .iter()
        .for_each(|a| {
            let acc = ForAccount::new(a.id);
            accs.insert(a.id, acc);
            symbols.get_mut(&a.commodity_id).unwrap().accounts.push(a.id);
        });
    }

    // Remove all symbols for which we have zero account, to limit the scope
    // of the following query.

    symbols.retain(|_, symb| !symb.accounts.is_empty());

    // Compute metrics

    let accs_ids = accs.iter()
        .map(|(id, _)| id.to_string())
        .collect::<Vec<_>>()
        .join(",");
    let query = format!(
        "
        SELECT *
        FROM alr_roi r
        WHERE r.account_id IN ({accs_ids})
        AND r.currency_id = {currency}
        ORDER BY r.mindate
        "
    );

    let result = super::connections::execute_and_log::<Roi>(
        "quotes,roi", &query);
    match result {
        Ok(rois) => {
            rois
            .iter()
            .for_each(|r| {
                let a_in_map = accs.get_mut(&r.account_id);
                let mut a = a_in_map.unwrap();
                let mi = Utc.from_utc_datetime(&r.mindate);
                let ma = Utc.from_utc_datetime(&r.maxdate);

                if a.oldest.is_none() {
                    a.oldest = Some(mi);
                }
                a.most_recent = Some(mi);

                if mi <= mindate && mindate < ma {
                    a.start = Position::new(r);
                }
                if mi <= maxdate && maxdate < ma {
                    a.end = Position::new(r);
                }

                a.prices.push(Price {
                    t: mi.timestamp_millis(),
                    price: r.computed_price,
                    roi: match r.roi {
                        Some(val) => (val - 1.0) * 100.0,
                        None      => f32::NAN,
                    },
                    shares: r.shares,
                });
            });

            for (_, a) in accs.iter_mut() {
                let now = Utc::now();

                // Annualized total return on investment
                if let Some(old) = a.oldest {
                    let d = (now - old).num_days() as f32;
                    a.annualized_roi = f32::powf(a.end.roi, 365.0 / d);
                }

                // Return over the period [mindata, maxdate]
                let d2 = a.start.equity + a.end.invested - a.start.invested;
                if f32::abs(d2) >= 1E-6 {
                    a.period_roi =
                        (a.end.equity + a.end.gains - a.start.gains)
                        / d2;
                }
            }

            (
                symbols.into_values().collect::<Vec<_>>(),
                accs,
            )
        },
        Err(_) => {
            (
                vec![],
                HashMap::new(),
            )
        }
    }
}
