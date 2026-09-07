export type EvidenceType = 'contradiction' | 'confirmation' | 'warning' | 'injection';

export interface EvidenceItem {
  type: EvidenceType;
  description: string;
  source?: string;
  confidence?: number;
}
