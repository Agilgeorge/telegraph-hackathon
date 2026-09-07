"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuseEvidence = fuseEvidence;
exports.addAvailabilityEvidence = addAvailabilityEvidence;
const NEGATIVE_VERDICTS = new Set([
    'malicious', 'suspicious', 'high_risk', 'elevated_risk',
    'unsupported', 'dangerous', 'fraud', 'scam', 'phishing', 'inconclusive',
    'recheck',
]);
const POSITIVE_VERDICTS = new Set([
    'safe', 'clean', 'low_risk', 'confirmed', 'supported', 'valid', 'assessed',
]);
function fuseEvidence(signals, claims) {
    const evidence = [];
    const negativeSignals = signals.filter((s) => NEGATIVE_VERDICTS.has(s.verdict));
    const positiveSignals = signals.filter((s) => POSITIVE_VERDICTS.has(s.verdict));
    // Prompt injection — hard override
    const injectionClaims = claims.filter((c) => c.category === 'prompt_injection');
    if (injectionClaims.length > 0) {
        evidence.push({
            type: 'injection',
            description: 'Prompt injection instructions detected in the submitted content',
            confidence: 1.0,
        });
    }
    // Fraud signals
    const fraudSignals = signals.filter((s) => s.intent === 'FRAUD_DETECTION' && NEGATIVE_VERDICTS.has(s.verdict));
    if (fraudSignals.length > 0) {
        evidence.push({
            type: 'warning',
            description: `${fraudSignals.length} fraud detection signal(s) flagged this content as suspicious`,
            source: fraudSignals.map((s) => s.miner).join(', '),
            confidence: Math.max(...fraudSignals.map((s) => s.confidence)),
        });
    }
    // URL scan
    const urlScanNegative = signals.filter((s) => s.intent === 'URL_SCAN' && NEGATIVE_VERDICTS.has(s.verdict));
    if (urlScanNegative.length > 0) {
        evidence.push({
            type: 'warning',
            description: 'URL scan identified this link as potentially malicious or suspicious',
            source: urlScanNegative.map((s) => s.miner).join(', '),
            confidence: Math.max(...urlScanNegative.map((s) => s.confidence)),
        });
    }
    // Fact check failed
    const factCheckNegative = signals.filter((s) => s.intent === 'FACT_CHECK' && NEGATIVE_VERDICTS.has(s.verdict));
    if (factCheckNegative.length > 0) {
        evidence.push({
            type: 'warning',
            description: 'Independent fact-checking could not verify the claims in this content',
            source: factCheckNegative.map((s) => s.miner).join(', '),
            confidence: Math.max(...factCheckNegative.map((s) => s.confidence)),
        });
    }
    // Contradiction: miners disagree
    if (negativeSignals.length > 0 && positiveSignals.length > 0) {
        evidence.push({
            type: 'contradiction',
            description: `Intelligence providers disagree: ${positiveSignals.length} signal(s) indicate safe, ${negativeSignals.length} signal(s) indicate risk`,
        });
    }
    // Financial claim without confirmation
    const financialClaims = claims.filter((c) => c.category === 'financial');
    if (financialClaims.length > 0 && positiveSignals.length === 0) {
        evidence.push({
            type: 'warning',
            description: 'Financial action detected but no independent source confirms the claim',
        });
    }
    // All clear
    if (evidence.length === 0 && positiveSignals.length > 0) {
        evidence.push({
            type: 'confirmation',
            description: `${positiveSignals.length} independent signal(s) confirm this content is safe`,
            source: positiveSignals.map((s) => s.miner).join(', '),
            confidence: positiveSignals.reduce((a, s) => a + s.confidence, 0) / positiveSignals.length,
        });
    }
    return evidence;
}
function addAvailabilityEvidence(evidence, failedCount, expectedCount) {
    if (failedCount === 0)
        return evidence;
    return [
        ...evidence,
        {
            type: 'warning',
            description: failedCount === expectedCount
                ? 'Telegraph intelligence providers were unavailable; this result cannot be independently verified'
                : `${failedCount} Telegraph intelligence provider(s) were unavailable; confidence is reduced`,
            source: 'Telegraph availability',
        },
    ];
}
