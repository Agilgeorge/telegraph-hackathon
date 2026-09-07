export interface TelegraphAskRequest {
  intent: string;
  query: string;
  params?: Record<string, unknown>;
}

export interface TelegraphAskResponse {
  signal: unknown;
  miner_id: string;
  miner_name: string;
  confidence: number;
  intent: string;
  cost?: number;
}

export interface MinerDef {
  id: string;
  name: string;
  intents: string[];
}
