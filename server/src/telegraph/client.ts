import "dotenv/config";
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

import {
  TelegraphAskRequest,
  TelegraphAskResponse,
} from "../types/telegraph";

const ENGINE_URL =
  process.env.TELEGRAPH_ENGINE_URL ||
  "https://devnode.telegraphprotocol.com";

const PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("EVM_PRIVATE_KEY is missing from .env");
}

const account = privateKeyToAccount(
  PRIVATE_KEY as `0x${string}`
);

const x402 = new x402Client();

x402.register(
  "eip155:*",
  new ExactEvmScheme(account)
);

const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  x402
);

export async function ask(
  req: TelegraphAskRequest
): Promise<TelegraphAskResponse> {
  const response = await fetchWithPayment(
    `${ENGINE_URL}/engine/v1/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: req.intent,
        query: req.query,
        params: req.params || {},
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Telegraph request failed (${response.status}): ${body}`
    );
  }

  const data: unknown = await response.json();

console.log("TELEGRAPH RAW RESPONSE:");
console.log(JSON.stringify(data, null, 2));

if (!data || typeof data !== "object") {
    throw new Error(
      "Telegraph returned an invalid response"
    );
  }

  const result = data as {
    miner_id?: unknown;
    miner_name?: unknown;
    intent?: unknown;
    result?: unknown;
    confidence?: unknown;
    cost_usd?: unknown;
  };

  if (
    typeof result.intent !== "string" ||
    typeof result.miner_id !== "string" ||
    typeof result.miner_name !== "string" ||
    typeof result.result === "undefined"
  ) {
    throw new Error(
      "Telegraph returned an incomplete signal"
    );
  }

  return {
    signal: result.result,
    intent: result.intent,
    miner_id: result.miner_id,
    miner_name: result.miner_name,
    confidence:
  typeof (result.result as { confidence?: unknown })?.confidence === "number"
    ? (result.result as { confidence: number }).confidence
    : typeof result.confidence === "number"
      ? result.confidence
      : 0.5,
    cost:
      typeof result.cost_usd === "number"
        ? result.cost_usd
        : undefined,
  };
}

export async function askParallel(
  requests: TelegraphAskRequest[]
): Promise<(TelegraphAskResponse | null)[]> {
  const results = await Promise.allSettled(
    requests.map(ask)
  );

  return results.map((r, index) => {
    if (r.status === "rejected") {
      console.error(
        `Telegraph request ${index + 1} failed:`,
        r.reason
      );
      return null;
    }

    return r.value;
  });
}