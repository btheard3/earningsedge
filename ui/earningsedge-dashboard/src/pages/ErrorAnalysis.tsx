export default function ErrorAnalysis() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold">Error Analysis</h2>
        <p className="mt-2 text-sm text-slate-300">
          Diagnose failure modes: missed trend, conservative policy, and risk/return tradeoffs.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        (Next step) Load <code>symbol_failure_summary.csv</code> and plot distributions + scatter.
      </div>
    </div>
  )
}
