export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="mt-2 text-sm text-slate-300">
          This dashboard visualizes PPO vs baseline strategies using matched-episode evaluation
          and highlights where PPO wins, loses, and why.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-xs text-slate-400">Run</div>
          <div className="mt-1 text-lg font-semibold">sprint4_generalization</div>
          <div className="mt-2 text-xs text-slate-400">Source: runs/…/notebook03_outputs</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-xs text-slate-400">Policies</div>
          <div className="mt-1 text-lg font-semibold">PPO + 3 baselines</div>
          <div className="mt-2 text-xs text-slate-400">buy_hold • flat • avoid_earnings</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-xs text-slate-400">Next</div>
          <div className="mt-1 text-lg font-semibold">Sprint 5 experiments</div>
          <div className="mt-2 text-xs text-slate-400">ranked, low-risk improvements</div>
        </div>
      </div>
    </div>
  )
}
