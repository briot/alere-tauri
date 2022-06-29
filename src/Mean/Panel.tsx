import * as React from 'react';
import Mean, { MeanProps } from '@/Mean/View';
import Settings from '@/Mean/Settings';
import Panel, { PanelProps, PanelBaseProps } from '@/Dashboard/Panel';
import useAccounts from '@/services/useAccounts';

export interface MeanPanelProps extends PanelBaseProps, MeanProps {
   type: 'mean';
}

const MeanPanel: React.FC<PanelProps<MeanPanelProps>> = p => {
   const title = (
      p.props.showExpenses
      ? (p.props.showIncome ? 'cashflow' : 'expenses')
      : (p.props.showIncome ? 'income' : '')
   );

   const { accounts } = useAccounts();
   if (!accounts.has_accounts()) {
      return null;
   }

   return (
      <Panel
         {...p}
         header={{name: `${title} history`,
                  range: p.props.range}}
         Settings={() =>
            <Settings
               props={p.props}
               excludeFields={p.excludeFields}
               save={p.save}
            />
         }
      >
         <Mean {...p.props} />
      </Panel>
   );
}

const registerMean = {'mean': MeanPanel};
export default registerMean;
