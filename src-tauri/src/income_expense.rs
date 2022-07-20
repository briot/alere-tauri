use super::cte_list_splits::{
    cte_list_splits, cte_splits_with_values, CTE_SPLITS_WITH_VALUE};
use super::dates::{DateValues};
use super::models::{AccountId, CommodityId};
use super::occurrences::Occurrences;
use chrono::{DateTime, Utc};
use serde::Serialize;
use super::accounts::AccountKindCategory;
use log::info;

#[derive(Serialize)]
pub struct OneIncomeExpense {
    accountid: AccountId,
    value: f32,      // total for this account in the time range
}

#[derive(Serialize)]
pub struct IncomeExpenseInPeriod {
    items: Vec<OneIncomeExpense>,
    mindate: DateTime<Utc>,
    maxdate: DateTime<Utc>,
}


#[tauri::command]
pub async fn income_expense(
    income: bool,
    expense: bool,
    mindate: DateTime<Utc>,
    maxdate: DateTime<Utc>,
    currency: CommodityId,
) -> IncomeExpenseInPeriod {
    info!("income_expense {:?} {:?} income={} expense={}",
          &mindate, &maxdate, income, expense);

    let mut categories = vec![];
    if expense {
        categories.push(AccountKindCategory::EXPENSE);
    }
    if income {
        categories.push(AccountKindCategory::INCOME);
    }
    if categories.len() == 0 {
        return IncomeExpenseInPeriod {
            items: vec![],
            mindate,
            maxdate,
        };
    }

    let list_splits = cte_list_splits(
        &DateValues::new(Some(vec![mindate.date(), maxdate.date()])),
        super::scenarios::NO_SCENARIO,
        &Occurrences::no_recurrence());
    let with_values = cte_splits_with_values();
    let cats = categories.iter()
        .map(|&cat| (cat as u32).to_string())
        .collect::<Vec<_>>()
        .join(",");
    let query = format!(
        "
        WITH RECURSIVE {list_splits}, \
          {with_values} \
        SELECT s.account_id, SUM(s.value) AS value \
        FROM {CTE_SPLITS_WITH_VALUE} s \
        JOIN alr_accounts a ON (a.id = s.account_id) \
        JOIN alr_account_kinds k ON (k.id = a.kind_id) \
        WHERE s.value_commodity_id = {currency} \
        AND NOT k.is_unrealized \
        AND k.category IN ({cats}) \
        GROUP BY s.account_id
        "
    );
    let rows =
        super::connections::execute_and_log
            ::<super::metrics::SplitsPerAccount>("income_expense", &query);
    match rows {
        Ok(r) => {
            IncomeExpenseInPeriod {
                mindate: mindate,
                maxdate: maxdate,
                items: r.iter()
                    .map(|acc| OneIncomeExpense {
                        accountid: acc.account_id,
                        value: -acc.value
                    })
                    .collect()
            }
        },
        Err(_) => {
            IncomeExpenseInPeriod {
                items: vec![],
                mindate,
                maxdate,
            }
        }
    }
}
