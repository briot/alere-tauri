import * as React from 'react';
import { Checkbox } from '@/Form';
import { PanelProps } from '@/Dashboard/Panel';
import { PriceHistoryPanelProps } from '@/PriceHistory/Panel';

const Settings: React.FC<PanelProps<PriceHistoryPanelProps>> = p => {
   const changeShares = (show: boolean) => p.save({ showShares: show });
   const changePrice = (show: boolean) => p.save({ showPrice: show });
   const changeHold = (show: boolean) => p.save({ showHolding: show });
   const changeROI = (show: boolean) => p.save({ showROI: show });
   const changeWA = (show: boolean) => p.save?.({ showWeightedAverage: show });
   const changeAC = (show: boolean) => p.save?.({ showAverageCost: show });

   return (
      <fieldset>
         <legend>Price History</legend>
         <Checkbox
            value={!!p.props.showShares}
            onChange={changeShares}
            text="Show positions"
         />
         <Checkbox
            value={!!p.props.showPrice}
            onChange={changePrice}
            text="Show prices"
         />
         <Checkbox
            value={!!p.props.showHolding}
            onChange={changeHold}
            text="Show holdings"
         />
         <Checkbox
            value={!!p.props.showROI}
            onChange={changeROI}
            text="Show return-on-investment"
         />
         <Checkbox
             value={!!p.props.showWeightedAverage}
             onChange={changeWA}
             text="Show Weighted Average lines in graphs"
         />
         <Checkbox
             value={!!p.props.showAverageCost}
             onChange={changeAC}
             text="Show Average Cost lines in graphs"
         />
      </fieldset>
   );
}
export default Settings;
