import { Claim, RiskLevel, ActionRisk } from '../types/verification';
import { shortId } from '../utils/hashing';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /keep\s+(this|these)\s+(instructions|actions)\s+hidden/i,
  /you\s+are\s+now\s+a/i,
  /system\s+prompt/i,
  /jailbreak/i,
  /act\s+as\s+(if\s+you\s+are|a)/i,
  /disregard\s+(your|all)/i,
  /new\s+instructions:/i,
  /override\s+(your|all|previous)/i,
];

const FINANCIAL_PATTERNS = [
  /wallet\s+address/i,
  /payment\s+address/i,
  /send\s+\$?\d/i,
  /transfer\s+funds/i,
  /0x[a-fA-F0-9]{40}/,
  /bitcoin\s+address/i,
  /crypto\s+payment/i,
  /changed.*address/i,
  /new.*wallet/i,
];

const LOGIN_PATTERNS = [
  /login\s+using/i,
  /click\s+here\s+to\s+verify/i,
  /your\s+account\s+has\s+been/i,
  /verify\s+your\s+(account|identity)/i,
  /sign\s+in\s+to/i,
];

const DOWNLOAD_PATTERNS = [
  /download\s+this/i,
  /install\s+this/i,
  /run\s+this\s+(file|script|exe)/i,
];

const HIGH_RISK_PATTERNS = [
  /urgent.*action\s+required/i,
  /act\s+now/i,
  /limited\s+time/i,
  /your\s+account\s+will\s+be\s+(suspended|closed|deleted)/i,
];

function detectRisk(text: string): { risk: RiskLevel; category: string } {
  if (INJECTION_PATTERNS.some((p) => p.test(text))) {
    return { risk: 'critical', category: 'prompt_injection' };
  }
  if (FINANCIAL_PATTERNS.some((p) => p.test(text))) {
    return { risk: 'critical', category: 'financial' };
  }
  if (LOGIN_PATTERNS.some((p) => p.test(text))) {
    return { risk: 'high', category: 'phishing' };
  }
  if (DOWNLOAD_PATTERNS.some((p) => p.test(text))) {
    return { risk: 'high', category: 'malware' };
  }
  if (HIGH_RISK_PATTERNS.some((p) => p.test(text))) {
    return { risk: 'high', category: 'social_engineering' };
  }
  if (/\b(claim|announce|official|new|changed|updated|breaking)\b/i.test(text)) {
    return { risk: 'medium', category: 'factual' };
  }
  return { risk: 'low', category: 'general' };
}

export function extractClaims(text: string): Claim[] {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 400);

  const seen = new Set<string>();
  const claims: Claim[] = [];

  for (const sentence of sentences) {
    const { risk, category } = detectRisk(sentence);
    const key = sentence.toLowerCase().slice(0, 60);

    if (!seen.has(key) && (risk !== 'low' || claims.length < 3)) {
      seen.add(key);
      claims.push({
        id: `claim_${shortId(sentence)}`,
        text: sentence,
        risk,
        category,
      });
    }

    if (claims.length >= 5) break;
  }

  return claims;
}

export function getOverallRisk(claims: Claim[]): RiskLevel {
  if (claims.some((c) => c.risk === 'critical')) return 'critical';
  if (claims.some((c) => c.risk === 'high')) return 'high';
  if (claims.some((c) => c.risk === 'medium')) return 'medium';
  return 'low';
}

/**
 * Detect the highest-risk action implied by the text.
 * financial > login > download > read
 */
export function detectActionRisk(text: string): ActionRisk {
  if (FINANCIAL_PATTERNS.some((p) => p.test(text))) return 'financial';
  if (LOGIN_PATTERNS.some((p) => p.test(text))) return 'login';
  if (DOWNLOAD_PATTERNS.some((p) => p.test(text))) return 'download';
  return 'read';
}
