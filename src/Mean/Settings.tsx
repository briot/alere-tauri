import * as React from 'react';
import { DateRange, DateRangePicker } from '@/Dates';
import { Checkbox, NumberInput } from '@/Form';
import { PanelProps } from '@/Dashboard/Panel';
import { MeanPanelProps } from '@/Mean/Panel';

const Settings: React.FC<PanelProps<MeanPanelProps>> = p => {
   const changeRange = (range: DateRange) => p.save({ range });
   const changePrior = (prior: number) => p.save({ prior });
   const changeAfter = (after: number) => p.save({ after });
   const changeExp   = (showExpenses: boolean) => p.save({ showExpenses });
   const changeInc   = (showIncome: boolean) => p.save({ showIncome });
   const changeRMean =
      (showRollingMean: boolean) => p.save({ showRollingMean });
   const changeMean  = (showMean: boolean) => p.save({ showMean });
   const changeUnr   = (showUnrealized: boolean) => p.save({ showUnrealized });
   const changeNeg   = (negateExpenses: boolean) => p.save({ negateExpenses });

   return (
      <fieldset>
         <legend>Expenses History</legend>
         <Checkbox
            value={p.props.showExpenses}
            onChange={changeExp}
            text="Show expenses"
         />
         <Checkbox
            value={p.props.showIncome}
            onChange={changeInc}
            text="Show income (not including unrealized gains)"
         />
         <Checkbox
            value={p.props.showUnrealized}
            onChange={changeUnr}
            text="Add unrealized gains (stocks, real-estate,...) to income"
         />
         <Checkbox
            value={p.props.showRollingMean}
            onChange={changeRMean}
            text="Show rolling means"
         />
         <Checkbox
            value={p.props.showMean}
            onChange={changeMean}
            text="Show mean income"
         />
         <Checkbox
            value={p.props.negateExpenses}
            onChange={changeNeg}
            text="Show expenses as positive numbers"
         />
         <NumberInput
            value={p.props.prior}
            text="Months before"
            title="How many months before the date to use, when computing averages"
            onChange={changePrior}
         />
         <NumberInput
            value={p.props.after}
            text="Months after"
            title="How many months after the date to use, when computing averages"
            onChange={changeAfter}
         />
         {
            !p.excludeFields?.includes("range") &&
            <DateRangePicker
               text="Time period"
               value={p.props.range || 'forever'}
               onChange={changeRange}
            />
         }
      </fieldset>
   );
}
export default Settings;
