use super::cte_query_balance::CTE_BALANCES_CURRENCY;
use super::dates::CTE_DATES;
use super::models::CommodityId;

pub const CTE_QUERY_NETWORTH: &str = "cte_qn";

/// Create a query that returns the networth as computed for a set of
/// dates. These dates must be found in the "dates(date)" table, which
/// typically will be provided as a common table expression.
///
/// requires cte_balances_currency() and dates
///
/// :param max_scheduled_occurrences:
///     if 0, ignore all scheduled transactions.
///     if 1, only look at the next occurrence of them.

pub fn cte_query_networth(currency: CommodityId) -> String {
    return format!(
        "
       {CTE_QUERY_NETWORTH} AS (  \
       SELECT   \
          {CTE_DATES}.date, \
          SUM({CTE_BALANCES_CURRENCY}.balance) AS value  \
       FROM {CTE_DATES}, \
          {CTE_BALANCES_CURRENCY}, \
          alr_accounts \
          JOIN alr_account_kinds k ON (alr_accounts.kind_id=k.id) \
       WHERE \
          --  sqlite compares date as strings, so we need to add
          --  the time. Otherwise, 2020-11-30 is less than
          --  2020-11-30 00:00:00 and we do not get transactions
          --  on the last day of the month
          strftime('%Y-%m-%d', {CTE_BALANCES_CURRENCY}.mindate) \
             <= strftime('%Y-%m-%d', {CTE_DATES}.date) \
          AND strftime('%Y-%m-%d', {CTE_DATES}.date) \
             < strftime('%Y-%m-%d', {CTE_BALANCES_CURRENCY}.maxdate) \
          AND {CTE_BALANCES_CURRENCY}.currency_id = {currency} \
          AND {CTE_BALANCES_CURRENCY}.account_id = alr_accounts.id  \
          AND k.is_networth  \
       GROUP BY {CTE_DATES}.date \
    )"
    );
}
