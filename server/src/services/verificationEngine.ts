import { VerificationInput, VerificationResult } from '../types/verification';
import { shortId } from '../utils/hashing';
import { isUrl, truncate } from '../utils/normalization';
import { extractContent } from './contentExtractor';
import { extractClaims, getOverallRisk, detectActionRisk } from './claimExtractor';
import { buildIntentPlan } from './intentRouter';
import { askParallel } from '../telegraph/client';
import { normalizeSignal } from './signalNormalizer';
import { addAvailabilityEvidence, fuseEvidence } from './evidenceFusion';
import { calculateTrustScore } from './trustScorer';
import { makeDecision } from './decisionEngine';

export async function runVerification(input: VerificationInput): Promise<VerificationResult> {
  const verificationId = `ver_${shortId(input.value + Date.now())}`;

  // 1. Content extraction
  let text = input.value;
  let url: string | undefined;
  let contentExtractionFailed = false;

  if (input.type === 'url' || isUrl(input.value)) {
    url = input.value;
    try {
      const extracted = await extractContent(input.value);
      text = `${extracted.title}\n\n${extracted.content}`;
    } catch {
      contentExtractionFailed = true;
      text = input.value;
    }
  }

  // 2. Claim extraction + risk
  const claims = extractClaims(text);
  const overallRisk = getOverallRisk(claims);
  const actionRisk = detectActionRisk(text);

  // 3. Intent planning
  const queryText = truncate(claims.map((c) => c.text).join('. ') || text, 500);
  const { intents, requests } = buildIntentPlan(overallRisk, actionRisk, !!url, url, queryText);

  // 4. Parallel Telegraph requests
  const rawResponses = await askParallel(requests);

  const minersFailed = rawResponses.filter((r) => r === null).length;
  const signals = rawResponses
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .map(normalizeSignal);

  // 5. Evidence fusion
  const evidence = addAvailabilityEvidence(
    fuseEvidence(signals, claims),
    minersFailed,
    rawResponses.length
  );
  if (contentExtractionFailed) {
    evidence.push({
      type: 'warning',
      description: 'The URL could not be fetched, so claims were analyzed from the submitted address only',
      source: 'Content extraction',
    });
  }

  // 6. Score + decision
  const score = calculateTrustScore(signals, evidence, claims, overallRisk, actionRisk);
  const { action, reason } = makeDecision(score, evidence, claims, overallRisk, actionRisk);

  return {
    verificationId,
    decision: { action, score, reason },
    claims,
    signals,
    evidence,
    actionRisk,
    telegraph: {
      intentsUsed: intents.length,
      signalsReceived: signals.length,
      minersFailed,
    },
    steps: [
      { name: 'Content extracted', status: contentExtractionFailed ? 'failed' : 'done' },
      { name: 'Claims identified', status: 'done' },
      { name: 'Telegraph signals collected', status: signals.length > 0 ? 'done' : 'failed' },
      { name: 'Evidence fused', status: 'done' },
      { name: 'Trust score calculated', status: 'done' },
    ],
  };
}
