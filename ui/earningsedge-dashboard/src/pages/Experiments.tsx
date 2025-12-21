export default function Experiments() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold">Sprint 5 Plan</h2>
        <p className="mt-2 text-sm text-slate-300">
          This is your ranked improvement backlog — what to try next, in order, after the evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="text-xs text-slate-400">Tier 1</div>
          <div className="mt-1 font-semibold">Low risk, high leverage</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
            <li>Train longer (1M timesteps) and re-evaluate</li>
            <li>Add trend/volatility context features</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="text-xs text-slate-400">Tier 2</div>
          <div className="mt-1 font-semibold">Objective shaping</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
            <li>Reward = growth − λ·drawdown</li>
            <li>Penalize large exposure around high-vol regimes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
