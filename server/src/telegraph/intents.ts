import { RiskLevel, ActionRisk } from '../types/verification';

export const INTENTS = {
  WEB_SEARCH: 'WEB_SEARCH',
  FACT_CHECK: 'FACT_CHECK',
  RESEARCH_QUERY: 'RESEARCH_QUERY',
  FRAUD_DETECTION: 'FRAUD_DETECTION',
  URL_SCAN: 'URL_SCAN',
  NEWS_SEARCH: 'NEWS_SEARCH',
} as const;

export type Intent = (typeof INTENTS)[keyof typeof INTENTS];

/**
 * Select which intents to fire based on risk level, action risk, and whether a URL is present.
 * Low-risk → 1–2 signals. Medium → 2–3. High/critical → 3–4.
 */
export function selectIntents(
  riskLevel: RiskLevel,
  actionRisk: ActionRisk,
  hasUrl: boolean
): Intent[] {
  const intents = new Set<Intent>();

  // Always do web search
  intents.add(INTENTS.WEB_SEARCH);

  if (riskLevel === 'medium' || riskLevel === 'high' || riskLevel === 'critical') {
    intents.add(INTENTS.FACT_CHECK);
  }

  if (riskLevel === 'high' || riskLevel === 'critical') {
    intents.add(INTENTS.FRAUD_DETECTION);
  }

  if (riskLevel === 'critical') {
    intents.add(INTENTS.RESEARCH_QUERY);
  }

  // URL-specific checks
  if (hasUrl) {
    intents.add(INTENTS.URL_SCAN);
  }

  // Financial or login actions always get fraud detection
  if (actionRisk === 'financial' || actionRisk === 'login') {
    intents.add(INTENTS.FRAUD_DETECTION);
    intents.add(INTENTS.FACT_CHECK);
  }

  return [...intents];
}
