"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildIntentPlan = buildIntentPlan;
const intents_1 = require("../telegraph/intents");
function buildIntentPlan(riskLevel, actionRisk, hasUrl, url, queryText) {
    const intents = (0, intents_1.selectIntents)(riskLevel, actionRisk, hasUrl);
    const requests = intents.map((intent) => {
        if (intent === 'URL_SCAN' && url) {
            return {
                intent,
                query: `Scan this URL for safety, phishing, and malicious content: ${url}`,
                params: { url },
            };
        }
        if (intent === 'FRAUD_DETECTION') {
            return {
                intent,
                query: `Assess for fraud, scam, or deception: ${queryText}`,
                params: {},
            };
        }
        if (intent === 'FACT_CHECK') {
            return {
                intent,
                query: `Fact-check this claim with independent sources: ${queryText}`,
                params: {},
            };
        }
        if (intent === 'RESEARCH_QUERY') {
            return {
                intent,
                query: `Research and synthesize evidence about: ${queryText}`,
                params: {},
            };
        }
        // WEB_SEARCH, NEWS_SEARCH
        if (intent === 'WEB_SEARCH') {
            return {
                intent,
                query: `Perform a general web search to find independent sources about this claim. Do not look up transaction hashes, wallet balances, token prices, or blockchain transactions unless the claim explicitly asks for them: ${queryText}`,
                params: {},
            };
        }
        if (intent === 'NEWS_SEARCH') {
            return {
                intent,
                query: `Search recent news sources for independent reporting about this claim: ${queryText}`,
                params: {},
            };
        }
        return {
            intent,
            query: queryText,
            params: {},
        };
    });
    return { intents, requests };
}
