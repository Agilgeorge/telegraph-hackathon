import { EvidenceItem } from '../types/verification';

const ICON: Record<EvidenceItem['type'], string> = {
  injection: '🔴',
  warning: '⚠️',
  contradiction: '⚡',
  confirmation: '🟢',
};

const COLOR: Record<EvidenceItem['type'], string> = {
  injection: 'text-red-400',
  warning: 'text-yellow-400',
  contradiction: 'text-orange-400',
  confirmation: 'text-green-400',
};

export function EvidencePanel({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) return null;

  return (
    <div className="border border-zinc-800 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
        Evidence
      </h3>
      <ul className="space-y-3">
        {evidence.map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 shrink-0">{ICON[e.type]}</span>
            <div className="flex flex-col gap-0.5">
              <span className={`text-sm ${COLOR[e.type]}`}>{e.description}</span>
              {e.source && (
                <span className="text-xs text-zinc-600 font-mono">via {e.source}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
