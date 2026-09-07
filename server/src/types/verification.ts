import { EvidenceItem } from './evidence';

export type InputType = 'url' | 'text';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Decision = 'ALLOW' | 'WARN' | 'BLOCK';
export type ActionRisk = 'read' | 'download' | 'login' | 'financial';

export interface VerificationInput {
  type: InputType;
  value: string;
}

export interface Claim {
  id: string;
  text: string;
  risk: RiskLevel;
  category: string;
}

export interface ExtractedContent {
  title: string;
  content: string;
  url?: string;
}

export interface NormalizedSignal {
  intent: string;
  miner: string;
  minerId: string;
  confidence: number;
  verdict: string;
  cost?: number;
  raw?: unknown;
}

export interface VerificationStep {
  name: string;
  status: 'pending' | 'running' | 'done' | 'failed';
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
  steps: VerificationStep[];
}
