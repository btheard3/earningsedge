import { useEffect, useMemo, useState } from "react";
import { loadCSV } from "../utils/data";
import KpiCard from "../components/KpiCard";
import { useRun } from "../state/run";

type SummaryRow = {
  policy: string;
  n_episodes: number;
  mean_final_equity: number;
  median_final_equity: number;
  mean_max_drawdown: number;
  median_max_drawdown: number;
};

function fmt(x: unknown, digits = 4) {
  if (x === null || x === undefined) return "—";
  const n = typeof x === "number" ? x : Number(x);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export default function PpoVsBaselines() {
  const { basePath } = useRun();
  const CSV_PATH = `${basePath}/summary_table.csv`;

  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const data = await loadCSV<any>(CSV_PATH);

        const cleaned: SummaryRow[] = (data ?? []).map((r: any) => ({
          policy: String(r.policy),
          n_episodes: Number(r.n_episodes),
          mean_final_equity: Number(r.mean_final_equity),
          median_final_equity: Number(r.median_final_equity),
          mean_max_drawdown: Number(r.mean_max_drawdown),
          median_max_drawdown: Number(r.median_max_drawdown),
        }));

        if (alive) setRows(cleaned);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Failed to load summary CSV");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [CSV_PATH]);

  const sorted = useMemo(() => {
    const order = ["ppo", "buy_hold", "avoid_earnings", "flat"];
    return [...rows].sort((a, b) => {
      const ai = order.indexOf(a.policy);
      const bi = order.indexOf(b.policy);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [rows]);

  const kpis = useMemo(() => {
    if (!rows.length) return null;

    const by = (key: keyof SummaryRow, dir: "max" | "min") => {
      const sortedRows = [...rows].sort((a, b) => {
        const av = Number(a[key]);
        const bv = Number(b[key]);
        if (!Number.isFinite(av) && !Number.isFinite(bv)) return 0;
        if (!Number.isFinite(av)) return 1;
        if (!Number.isFinite(bv)) return -1;
        return dir === "max" ? bv - av : av - bv;
      });
      return sortedRows[0];
    };

    return {
      bestMeanFinal: by("mean_final_equity", "max"),
      bestMedianFinal: by("median_final_equity", "max"),
      lowestMeanDD: by("mean_max_drawdown", "min"),
      lowestMedianDD: by("median_max_drawdown", "min"),
    };
  }, [rows]);

  const deltas = useMemo(() => {
    if (!rows.length) return null;

    const ppo = rows.find((r) => r.policy === "ppo");
    const bh = rows.find((r) => r.policy === "buy_hold");
    if (!ppo || !bh) return null;

    return {
      deltaMeanFinal: ppo.mean_final_equity - bh.mean_final_equity,
      deltaMedianFinal: ppo.median_final_equity - bh.median_final_equity,
      deltaMeanDD: ppo.mean_max_drawdown - bh.mean_max_drawdown,
      deltaMedianDD: ppo.median_max_drawdown - bh.median_max_drawdown,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
        <div className="text-sm text-slate-300">PPO vs Baselines</div>
        <div className="text-xs text-slate-400 mt-1">
          Loaded from <span className="font-mono">{CSV_PATH}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">
            Aggregate performance summary
          </h2>
          <a
            className="text-xs text-slate-400 hover:text-slate-200 underline"
            href={CSV_PATH}
          >
            download CSV
          </a>
        </div>

        {loading && <div className="mt-4 text-sm text-slate-400">Loading…</div>}
        {err && <div className="mt-4 text-sm text-red-300">Could not load: {err}</div>}

        {!loading && !err && (
          <>
            {kpis && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard title="Best Mean Final Equity" policy={kpis.bestMeanFinal.policy} value={kpis.bestMeanFinal.mean_final_equity} />
                <KpiCard title="Best Median Final Equity" policy={kpis.bestMedianFinal.policy} value={kpis.bestMedianFinal.median_final_equity} />
                <KpiCard title="Lowest Mean Max Drawdown" policy={kpis.lowestMeanDD.policy} value={kpis.lowestMeanDD.mean_max_drawdown} inverse />
                <KpiCard title="Lowest Median Max Drawdown" policy={kpis.lowestMedianDD.policy} value={kpis.lowestMedianDD.median_max_drawdown} inverse />
              </div>
            )}

            {deltas && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4">
                <DeltaCard title="PPO vs Buy&Hold (Mean Final Equity)" value={deltas.deltaMeanFinal} goodWhen="positive" />
                <DeltaCard title="PPO vs Buy&Hold (Mean Max Drawdown)" value={deltas.deltaMeanDD} goodWhen="negative" />
              </div>
            )}

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left">policy</th>
                    <th className="px-3 py-2 text-right">n_episodes</th>
                    <th className="px-3 py-2 text-right">mean_final</th>
                    <th className="px-3 py-2 text-right">median_final</th>
                    <th className="px-3 py-2 text-right">mean_max_dd</th>
                    <th className="px-3 py-2 text-right">median_max_dd</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => (
                    <tr key={r.policy} className="border-t border-slate-800">
                      <td className="px-3 py-2 text-slate-200">{r.policy}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{Number.isFinite(r.n_episodes) ? r.n_episodes : "—"}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{fmt(r.mean_final_equity)}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{fmt(r.median_final_equity)}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{fmt(r.mean_max_drawdown)}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{fmt(r.median_max_drawdown)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeltaCard({
  title,
  value,
  goodWhen,
}: {
  title: string;
  value: number;
  goodWhen: "positive" | "negative";
}) {
  const isGood = goodWhen === "positive" ? value >= 0 : value <= 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-slate-100">
          {value >= 0 ? "+" : ""}
          {value.toFixed(4)}
        </div>
        <div className={`text-xs ${isGood ? "text-emerald-300" : "text-rose-300"}`}>
          {isGood ? "favorable" : "unfavorable"}
        </div>
      </div>
      <div className="mt-1 text-[11px] text-slate-500">
        {goodWhen === "positive"
          ? "Positive means PPO beats Buy&Hold."
          : "Negative means PPO has lower drawdown (better)."}
      </div>
    </div>
  );
}
