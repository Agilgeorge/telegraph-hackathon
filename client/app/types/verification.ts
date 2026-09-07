export type Decision = 'ALLOW' | 'WARN' | 'BLOCK';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ActionRisk = 'read' | 'download' | 'login' | 'financial';

export interface Claim {
  id: string;
  text: string;
  risk: RiskLevel;
  category: string;
}

export interface NormalizedSignal {
  intent: string;
  miner: string;
  minerId: string;
  confidence: number;
  verdict: string;
  cost?: number;
}

export interface EvidenceItem {
  type: 'contradiction' | 'confirmation' | 'warning' | 'injection';
  description: string;
  source?: string;
  confidence?: number;
}

export interface VerificationResult {
  verificationId: string;
  decision: {
    action: Decision;
    score: number;
    reason: string;
  };
  claims: Claim[];
  signals: NormalizedSignal[];
  evidence: EvidenceItem[];
  actionRisk: ActionRisk;
  telegraph: {
    intentsUsed: number;
    signalsReceived: number;
    minersFailed: number;
  };
  steps: { name: string; status: string }[];
}
