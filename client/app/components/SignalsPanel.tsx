import { NormalizedSignal } from '../types/verification';

const VERDICT_COLOR: Record<string, string> = {
  safe: 'text-green-400',
  clean: 'text-green-400',
  low_risk: 'text-green-400',
  valid: 'text-green-400',
  confirmed: 'text-green-400',
  supported: 'text-green-400',
  assessed: 'text-green-400',
  malicious: 'text-red-400',
  suspicious: 'text-red-400',
  high_risk: 'text-red-400',
  dangerous: 'text-red-400',
  elevated_risk: 'text-yellow-400',
  unsupported: 'text-yellow-400',
  inconclusive: 'text-yellow-400',
  unknown: 'text-zinc-500',
};

const INTENT_LABEL: Record<string, string> = {
  WEB_SEARCH: 'Web Search',
  FACT_CHECK: 'Fact Check',
  FRAUD_DETECTION: 'Fraud Detection',
  URL_SCAN: 'URL Scan',
  RESEARCH_QUERY: 'Research',
  NEWS_SEARCH: 'News Search',
};

export function SignalsPanel({ signals }: { signals: NormalizedSignal[] }) {
  if (signals.length === 0) return null;

  return (
    <div className="border border-zinc-800 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
        Telegraph Signals
      </h3>
      <div className="space-y-3">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-400 font-mono text-xs">
                {INTENT_LABEL[s.intent] || s.intent}
              </span>
              <span className="text-zinc-300 text-xs">{s.miner}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xs ${VERDICT_COLOR[s.verdict] ?? 'text-zinc-500'}`}>
                {s.verdict}
              </span>
              <span className="text-zinc-600 text-xs font-mono w-10 text-right">
                {(s.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
