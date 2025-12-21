import { useEffect, useState } from "react";
import { loadCSV } from "./utils/data";

type SummaryRow = {
  policy: string;
  n_episodes: number;
  mean_final: number;
  median_final: number;
  mean_max_drawdown: number;
  median_max_drawdown: number;
};

export default function App() {
  const [rows, setRows] = useState<SummaryRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadCSV<SummaryRow>("/artifacts/sprint4/summary_table.csv")
      .then(setRows)
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-2xl font-semibold mb-4">EarningsEdge Results</h1>

      {err && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <div className="font-medium">Failed to load data</div>
          <pre className="text-sm opacity-90 mt-2">{err}</pre>
        </div>
      )}

      {!err && !rows && <div className="opacity-80">Loading CSV…</div>}

      {rows && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-3">Policy</th>
                <th className="text-right p-3">Episodes</th>
                <th className="text-right p-3">Mean Final</th>
                <th className="text-right p-3">Median Final</th>
                <th className="text-right p-3">Mean Max DD</th>
                <th className="text-right p-3">Median Max DD</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.policy} className="border-t border-slate-800">
                  <td className="p-3">{r.policy}</td>
                  <td className="p-3 text-right">{r.n_episodes}</td>
                  <td className="p-3 text-right">{r.mean_final?.toFixed(4)}</td>
                  <td className="p-3 text-right">{r.median_final?.toFixed(4)}</td>
                  <td className="p-3 text-right">
                    {r.mean_max_drawdown?.toFixed(4)}
                  </td>
                  <td className="p-3 text-right">
                    {r.median_max_drawdown?.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
