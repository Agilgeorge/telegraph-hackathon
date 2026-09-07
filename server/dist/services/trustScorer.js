"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTrustScore = calculateTrustScore;
const NEGATIVE_VERDICTS = new Set([
    'malicious', 'suspicious', 'high_risk', 'elevated_risk',
    'unsupported', 'dangerous', 'fraud', 'scam', 'phishing', 'inconclusive', 'recheck',
]);
const POSITIVE_VERDICTS = new Set([
    'safe', 'clean', 'low_risk', 'confirmed', 'supported', 'valid', 'assessed',
]);
const ACTION_RISK_PENALTY = {
    read: 0,
    download: -10,
    login: -15,
    financial: -25,
};
const RISK_LEVEL_PENALTY = {
    low: 0,
    medium: -5,
    high: -15,
    critical: -25,
};
function calculateTrustScore(signals, evidence, claims, overallRisk, actionRisk) {
    if (signals.length === 0)
        return 40;
    let score = 50;
    const negativeSignals = signals.filter((s) => NEGATIVE_VERDICTS.has(s.verdict));
    const positiveSignals = signals.filter((s) => POSITIVE_VERDICTS.has(s.verdict));
    // Positive signal bonus
    score += positiveSignals.length * 12;
    if (positiveSignals.length > 0) {
        const avgConf = positiveSignals.reduce((a, s) => a + s.confidence, 0) / positiveSignals.length;
        score += avgConf * 10;
    }
    // Negative signal penalty
    score -= negativeSignals.length * 20;
    for (const s of negativeSignals) {
        if (s.confidence > 0.8)
            score -= 10;
    }
    // Evidence penalties
    for (const e of evidence) {
        if (e.type === 'injection')
            score -= 50;
        else if (e.type === 'contradiction')
            score -= 15;
        else if (e.type === 'warning')
            score -= 10;
    }
    // Risk level and action risk penalties
    score += RISK_LEVEL_PENALTY[overallRisk];
    score += ACTION_RISK_PENALTY[actionRisk];
    return Math.max(0, Math.min(100, Math.round(score)));
}
