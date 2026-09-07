import { useEffect, useState } from 'react';

interface Step {
  name: string;
  status: string;
}

const LOADING_STEP_NAMES = [
  'Extracting content',
  'Identifying claims',
  'Querying Telegraph miners',
  'Fusing evidence',
  'Calculating trust score',
];

export function VerificationSteps({ steps, loading }: { steps: Step[]; loading: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const resetTimer = window.setTimeout(() => setActiveIndex(0), 0);
    const timer = window.setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, LOADING_STEP_NAMES.length - 1));
    }, 1400);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearInterval(timer);
    };
  }, [loading]);

  if (!loading && steps.length === 0) return null;

  const displaySteps = loading
    ? LOADING_STEP_NAMES.map((name, index) => ({
        name,
        status: index < activeIndex ? 'done' : index === activeIndex ? 'running' : 'pending',
      }))
    : steps;

  return (
    <div className="border border-zinc-800 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
        Verification Pipeline
      </h3>
      <ul className="space-y-2">
        {displaySteps.map((step, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {step.status === 'done'    && <span className="text-green-400 w-4">✓</span>}
            {step.status === 'running' && <span className="text-yellow-400 w-4 animate-pulse">◉</span>}
            {step.status === 'pending' && <span className="text-zinc-700 w-4">○</span>}
            {step.status === 'failed'  && <span className="text-red-400 w-4">✕</span>}
            <span
              className={
                step.status === 'done'    ? 'text-zinc-300' :
                step.status === 'running' ? 'text-white' :
                step.status === 'failed'  ? 'text-red-400' :
                'text-zinc-600'
              }
            >
              {step.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
