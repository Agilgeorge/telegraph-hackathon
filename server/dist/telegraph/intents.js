"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTENTS = void 0;
exports.selectIntents = selectIntents;
exports.INTENTS = {
    WEB_SEARCH: 'WEB_SEARCH',
    FACT_CHECK: 'FACT_CHECK',
    RESEARCH_QUERY: 'RESEARCH_QUERY',
    FRAUD_DETECTION: 'FRAUD_DETECTION',
    URL_SCAN: 'URL_SCAN',
    NEWS_SEARCH: 'NEWS_SEARCH',
};
/**
 * Select which intents to fire based on risk level, action risk, and whether a URL is present.
 * Low-risk → 1–2 signals. Medium → 2–3. High/critical → 3–4.
 */
function selectIntents(riskLevel, actionRisk, hasUrl) {
    const intents = new Set();
    // Always do web search
    intents.add(exports.INTENTS.WEB_SEARCH);
    if (riskLevel === 'medium' || riskLevel === 'high' || riskLevel === 'critical') {
        intents.add(exports.INTENTS.FACT_CHECK);
    }
    if (riskLevel === 'high' || riskLevel === 'critical') {
        intents.add(exports.INTENTS.FRAUD_DETECTION);
    }
    if (riskLevel === 'critical') {
        intents.add(exports.INTENTS.RESEARCH_QUERY);
    }
    // URL-specific checks
    if (hasUrl) {
        intents.add(exports.INTENTS.URL_SCAN);
    }
    // Financial or login actions always get fraud detection
    if (actionRisk === 'financial' || actionRisk === 'login') {
        intents.add(exports.INTENTS.FRAUD_DETECTION);
        intents.add(exports.INTENTS.FACT_CHECK);
    }
    return [...intents];
}
