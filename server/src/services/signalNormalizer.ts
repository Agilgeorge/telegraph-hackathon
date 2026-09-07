import { NormalizedSignal } from '../types/verification';
import { TelegraphAskResponse } from '../types/telegraph';

function extractVerdict(signal: unknown, intent: string): string {
  if (!signal || typeof signal !== 'object') return 'unknown';
  const s = signal as Record<string, unknown>;

  if (
    intent === 'CRYPTO_PRICE' &&
    typeof s.price_usd === 'number'
  ) {
    return 'confirmed';
  }

  if (
    intent === 'CRYPTO_PRICE' &&
    s.status === 'ok' &&
    typeof s.price === 'number'
  ) {
    return 'confirmed';
  }
  if (
  intent === 'URL_SCAN' &&
  s.verdict === 'no_threat_signal'
) {
  return 'safe';
}

if (
  intent === 'WEB_SEARCH' &&
  (typeof s.answer === 'string' ||
    (Array.isArray(s.results) && s.results.length > 0))
) {
  return 'supported';
}

  if (typeof s.verdict === 'string') return s.verdict;
  if (typeof s.risk_tier === 'string') return s.risk_tier;
  if (typeof s.risk_level === 'string') return s.risk_level;
  if (typeof s.label === 'string') return s.label;
  if (typeof s.status === 'string') return s.status;
  if (typeof s.assessment_status === 'string') return s.assessment_status;

  if (intent === 'URL_SCAN' && typeof s.risk_score === 'number') {
    if (s.risk_score > 70) return 'malicious';
    if (s.risk_score > 40) return 'suspicious';
    return 'safe';
  }

  if (intent === 'FRAUD_DETECTION') {
    if (typeof s.is_suspicious === 'boolean') return s.is_suspicious ? 'suspicious' : 'clean';
    if (typeof s.risk_score === 'number') {
      if (s.risk_score > 0.7) return 'high_risk';
      if (s.risk_score > 0.4) return 'elevated_risk';
      return 'low_risk';
    }
  }

   if (intent === 'FACT_CHECK') {
    if (typeof s.supported === 'boolean') return s.supported ? 'supported' : 'unsupported';
  }



  return 'unknown';
}

function extractConfidence(signal: unknown, response: TelegraphAskResponse): number {
  if (response.confidence > 0) return clamp(response.confidence);
  if (signal && typeof signal === 'object') {
    const s = signal as Record<string, unknown>;
    if (typeof s.confidence === 'number') return clamp(s.confidence);
    if (typeof s.risk_score === 'number') return clamp(s.risk_score);
  }
  return 0.5;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizeSignal(response: TelegraphAskResponse): NormalizedSignal {
  return {
    intent: response.intent,
    miner: response.miner_name || `Miner #${response.miner_id}`,
    minerId: response.miner_id,
    confidence: extractConfidence(response.signal, response),
    verdict: extractVerdict(response.signal, response.intent).toLowerCase(),
    cost: response.cost,
    raw: response.signal,
  };
}
