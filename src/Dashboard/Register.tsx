/**
 * A place that registers all known types of panels
 */

import { PanelProps } from '@/Dashboard/Props';
import registerAccountEdit from '@/AccountEdit/Panel';
import registerAccounts from '@/Accounts/Panel';
import registerAssets from '@/Assets/Panel';
import registerCashflow from '@/Cashflow/Panel';
import registerIE from '@/IncomeExpense/Panel';
import registerIEHistory from '@/IEHistory/Panel';
import registerIEHistoryBars from '@/IEHistoryBars/Panel';
import registerInvestments from '@/Investments/Panel';
import registerLedger from '@/Ledger/Panel';
import registerMean from '@/Mean/Panel';
import registerMetrics from '@/Metrics/Panel';
import registerNetworth from '@/NetWorth/Panel';
import registerNetworthHistory from '@/NWHistory/Panel';
import registerPerformance from '@/Performance/Panel';
import registerPriceHistory from '@/PriceHistory/Panel';
import registerRecent from '@/Recent/Panel';
import registerTicker from '@/Ticker/Panel';
import registerWelcome from '@/Welcome/Panel';

/**
 * The list of registered modules. Every time you define a new type of panel,
 * it should be registered in this object
 */
const PANELS: {[name: string]: React.FC<PanelProps<any>>} = {
   ...registerAccounts,
   ...registerAccountEdit,
   ...registerAssets,
   ...registerCashflow,
   ...registerIE,
   ...registerIEHistory,
   ...registerIEHistoryBars,
   ...registerInvestments,
   ...registerLedger,
   ...registerMean,
   ...registerMetrics,
   ...registerNetworth,
   ...registerNetworthHistory,
   ...registerPerformance,
   ...registerPriceHistory,
   ...registerRecent,
   ...registerTicker,
   ...registerWelcome,
};
export default PANELS;

