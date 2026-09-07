import { MinerDef } from '../types/telegraph';

export const MINERS: Record<string, MinerDef> = {
  TAVILY: {
    id: '202',
    name: 'Tavily',
    intents: ['WEB_SEARCH', 'FACT_CHECK', 'NEWS_SEARCH', 'RESEARCH_QUERY'],
  },
  LIVECERT: {
    id: '4433',
    name: 'LiveCert',
    intents: ['FACT_CHECK', 'SSL_VERIFICATION', 'WEATHER_FORECAST', 'NEWS_HEADLINES'],
  },
  TXLENS: {
    id: '9002',
    name: 'TxLens',
    intents: ['FRAUD_DETECTION', 'WEB_SEARCH', 'ONCHAIN_TX_LOOKUP'],
  },
  SENTINEL: {
    id: '94217603',
    name: 'Telegraph Sentinel',
    intents: ['FRAUD_DETECTION'],
  },
  PREFLIGHT: {
    id: '20260828',
    name: 'PREFLIGHT',
    intents: ['URL_SCAN', 'SSL_VERIFICATION', 'FRAUD_DETECTION'],
  },
  CHAINSIGHT: {
    id: '302',
    name: 'ChainSight',
    intents: ['FRAUD_DETECTION', 'URL_SCAN', 'CRYPTO_PRICE'],
  },
  DEGENLENS: {
    id: '10002',
    name: 'DegenLens',
    intents: ['FRAUD_DETECTION', 'WALLET_BALANCE_CHECK', 'ONCHAIN_TX_LOOKUP'],
  },
};
