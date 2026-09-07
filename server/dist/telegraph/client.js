"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ask = ask;
exports.askParallel = askParallel;
require("dotenv/config");
const fetch_1 = require("@x402/fetch");
const client_1 = require("@x402/core/client");
const client_2 = require("@x402/evm/exact/client");
const accounts_1 = require("viem/accounts");
const ENGINE_URL = process.env.TELEGRAPH_ENGINE_URL ||
    "https://devnode.telegraphprotocol.com";
const PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error("EVM_PRIVATE_KEY is missing from .env");
}
const account = (0, accounts_1.privateKeyToAccount)(PRIVATE_KEY);
const x402 = new client_1.x402Client();
x402.register("eip155:*", new client_2.ExactEvmScheme(account));
const fetchWithPayment = (0, fetch_1.wrapFetchWithPayment)(fetch, x402);
async function ask(req) {
    const response = await fetchWithPayment(`${ENGINE_URL}/engine/v1/ask`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            intent: req.intent,
            query: req.query,
            params: req.params || {},
        }),
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Telegraph request failed (${response.status}): ${body}`);
    }
    const data = await response.json();
    console.log("TELEGRAPH RAW RESPONSE:");
    console.log(JSON.stringify(data, null, 2));
    if (!data || typeof data !== "object") {
        throw new Error("Telegraph returned an invalid response");
    }
    const result = data;
    if (typeof result.intent !== "string" ||
        typeof result.miner_id !== "string" ||
        typeof result.miner_name !== "string" ||
        typeof result.result === "undefined") {
        throw new Error("Telegraph returned an incomplete signal");
    }
    return {
        signal: result.result,
        intent: result.intent,
        miner_id: result.miner_id,
        miner_name: result.miner_name,
        confidence: typeof result.result?.confidence === "number"
            ? result.result.confidence
            : typeof result.confidence === "number"
                ? result.confidence
                : 0.5,
        cost: typeof result.cost_usd === "number"
            ? result.cost_usd
            : undefined,
    };
}
async function askParallel(requests) {
    const results = await Promise.allSettled(requests.map(ask));
    return results.map((r, index) => {
        if (r.status === "rejected") {
            console.error(`Telegraph request ${index + 1} failed:`, r.reason);
            return null;
        }
        return r.value;
    });
}
