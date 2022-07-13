import * as React from 'react';
import useAccounts, { Account } from '@/services/useAccounts';
import { DateRange, toDates } from '@/Dates';
import { Transaction, incomeExpenseSplits } from '@/Transaction';
import useInvoke from '@/services/useInvoke';


const noTransactions: Transaction[] = [];

/**
 * Fetch a ledger from the server
 */

const useTransactions = (
   accountList: Account[],
   range: DateRange|undefined,   // undefined, to see forever
   refDate: Date,                // starting point of the date range
   includeScheduled?: boolean,
): Transaction[] => {
   const { accounts } = useAccounts();
   const discard_internal = accountList.length > 1;
   const args = React.useMemo(
      () => {
         const r = toDates(range ?? "all");
         return {
            mindate: r[0],
            maxdate: r[1],
            accountids: accountList.map(a => a.id),
            occurrences: includeScheduled ? 1 : 0,
         };
      },
      [accountList, range, includeScheduled]
   );

   const parse = React.useCallback(
      (raw: Transaction[]) => {
         raw.forEach(t =>
            t.splits.forEach(s =>
               s.account = accounts.getAccount(s.account_id)
            )
         );
         if (discard_internal) {
            raw = raw.filter(t => incomeExpenseSplits(t).length > 0);
         }
         return raw;
      },
      [accounts, discard_internal]
   );

   const { data } = useInvoke({
      getCommand: 'ledger',
      args,
      placeholder: noTransactions,
      parse,
   });

   return data;
}

export default useTransactions;
