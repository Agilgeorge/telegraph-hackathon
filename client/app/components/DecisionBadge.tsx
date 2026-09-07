import { Decision } from '../types/verification';

const CONFIG: Record<Decision, { color: string; bg: string; border: string; icon: string }> = {
  ALLOW: { color: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-800', icon: '✓' },
  WARN:  { color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-800', icon: '⚠' },
  BLOCK: { color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800', icon: '✕' },
};

export function DecisionBadge({ decision, score }: { decision: Decision; score: number }) {
  const c = CONFIG[decision];
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-8 text-center`}>
      <div className="text-6xl font-mono font-bold text-white mb-1">{score}</div>
      <div className="text-zinc-500 text-xs font-mono mb-4">/ 100</div>
      <div className={`text-2xl font-bold tracking-widest ${c.color}`}>
        {c.icon} {decision}
      </div>
    </div>
  );
}
