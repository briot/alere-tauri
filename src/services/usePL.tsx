import * as React from 'react';
import { DateRange, toDates } from '@/Dates';
import { CommodityId } from '@/services/useAccounts';
import useInvoke from '@/services/useInvoke';

export interface Metric {
   income: number;
   passive_income: number;
   work_income: number;
   expenses: number;
   income_taxes: number;
   other_taxes: number;
   networth: number;
   networth_start: number;
   liquid_assets: number;
   liquid_assets_at_start: number;
}

const NULL_METRIC: Metric = {
   income: NaN,
   passive_income: NaN,
   expenses: NaN,
   work_income: NaN,
   networth: NaN,
   networth_start: NaN,
   liquid_assets: NaN,
   liquid_assets_at_start: NaN,
   income_taxes: NaN,
   other_taxes: NaN,
};

const usePL = (range: DateRange, currencyId: CommodityId) => {
   const args = React.useMemo(
      () => {
         const r = toDates(range);
         return {
            mindate: r[0],
            maxdate: r[1],
            currency: currencyId,
         };
      },
      [range, currencyId]
   );
   const { data } = useInvoke({
      getCommand: 'metrics',
      args,
      placeholder: NULL_METRIC,
   });
   return data;
}

export const usePLMultiple = (
   ranges: DateRange[],
   currencyId: CommodityId,
): Metric[]  => {
   const [metrics, setMetrics] = React.useState<Metric[]>(
      () => Array(ranges.length).fill(NULL_METRIC),
   );

   React.useEffect(
      () => {
         const promises = ranges.map(r => {
             const dates = toDates(r);
             return invokeMetrics(dates[0], dates[1], currencyId);
         });
         Promise.all(promises).then(values => {
            setMetrics(values);
         });
      },
      [ranges, currencyId],
   );
   return metrics;
}

export default usePL;
