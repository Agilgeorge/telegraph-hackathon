"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runVerification = runVerification;
const hashing_1 = require("../utils/hashing");
const normalization_1 = require("../utils/normalization");
const contentExtractor_1 = require("./contentExtractor");
const claimExtractor_1 = require("./claimExtractor");
const intentRouter_1 = require("./intentRouter");
const client_1 = require("../telegraph/client");
const signalNormalizer_1 = require("./signalNormalizer");
const evidenceFusion_1 = require("./evidenceFusion");
const trustScorer_1 = require("./trustScorer");
const decisionEngine_1 = require("./decisionEngine");
async function runVerification(input) {
    const verificationId = `ver_${(0, hashing_1.shortId)(input.value + Date.now())}`;
    // 1. Content extraction
    let text = input.value;
    let url;
    let contentExtractionFailed = false;
    if (input.type === 'url' || (0, normalization_1.isUrl)(input.value)) {
        url = input.value;
        try {
            const extracted = await (0, contentExtractor_1.extractContent)(input.value);
            text = `${extracted.title}\n\n${extracted.content}`;
        }
        catch {
            contentExtractionFailed = true;
            text = input.value;
        }
    }
    // 2. Claim extraction + risk
    const claims = (0, claimExtractor_1.extractClaims)(text);
    const overallRisk = (0, claimExtractor_1.getOverallRisk)(claims);
    const actionRisk = (0, claimExtractor_1.detectActionRisk)(text);
    // 3. Intent planning
    const queryText = (0, normalization_1.truncate)(claims.map((c) => c.text).join('. ') || text, 500);
    const { intents, requests } = (0, intentRouter_1.buildIntentPlan)(overallRisk, actionRisk, !!url, url, queryText);
    // 4. Parallel Telegraph requests
    const rawResponses = await (0, client_1.askParallel)(requests);
    const minersFailed = rawResponses.filter((r) => r === null).length;
    const signals = rawResponses
        .filter((r) => r !== null)
        .map(signalNormalizer_1.normalizeSignal);
    // 5. Evidence fusion
    const evidence = (0, evidenceFusion_1.addAvailabilityEvidence)((0, evidenceFusion_1.fuseEvidence)(signals, claims), minersFailed, rawResponses.length);
    if (contentExtractionFailed) {
        evidence.push({
            type: 'warning',
            description: 'The URL could not be fetched, so claims were analyzed from the submitted address only',
            source: 'Content extraction',
        });
    }
    // 6. Score + decision
    const score = (0, trustScorer_1.calculateTrustScore)(signals, evidence, claims, overallRisk, actionRisk);
    const { action, reason } = (0, decisionEngine_1.makeDecision)(score, evidence, claims, overallRisk, actionRisk);
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
