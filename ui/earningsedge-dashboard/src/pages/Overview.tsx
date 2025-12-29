import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";
import { useRun } from "../state/run";

type Metrics = Record<string, any>;

async function exists(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function prettyRunName(run: string) {
  // Keep Sprint 4 as default when the app loads, but render a clean headline.
  // Examples: "sprint4" -> "Sprint 4", "sprint5_long_train" -> "Sprint 5 Long Train"
  const r = run.replace(/[_-]+/g, " ").trim();

  // If it starts with "sprint5" etc, format nicely
  const match = r.match(/^sprint\s*(\d+)\s*(.*)$/i) || r.match(/^sprint(\d+)\s*(.*)$/i);
  if (match) {
    const sprintNum = match[1];
    const rest = (match[2] || "").trim();
    const titleRest = rest
      ? rest
          .split(" ")
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "";

    return titleRest ? `Sprint ${sprintNum} – ${titleRest}` : `Sprint ${sprintNum}`;
  }

  // Fallback: Title Case
  return r
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Overview() {
  const { run, basePath } = useRun();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const [hasSummary, setHasSummary] = useState<boolean | null>(null);
  const [hasErrorCsv, setHasErrorCsv] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${basePath}/metrics.json`);
        if (!res.ok) throw new Error(`metrics.json not found for ${run}`);
        const m = await res.json();
        if (alive) setMetrics(m);
      } catch {
        if (alive) setMetrics(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [basePath, run]);

  useEffect(() => {
    let alive = true;

    (async () => {
      const [s, e] = await Promise.all([
        exists(`${basePath}/summary_table.csv`),
        exists(`${basePath}/symbol_failure_summary.csv`),
      ]);
      if (!alive) return;
      setHasSummary(s);
      setHasErrorCsv(e);
    })();

    return () => {
      alive = false;
    };
  }, [basePath, run]);

  const evalStatus = useMemo(() => {
    if (hasSummary === null || hasErrorCsv === null) return "checking";
    if (hasSummary && hasErrorCsv) return "ready";
    return "partial";
  }, [hasSummary, hasErrorCsv]);

  const headline = prettyRunName(run);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950/60 to-slate-950/30 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs text-slate-400">EarningsEdge RL</div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">
              {headline}
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-3xl">
              This dashboard compares a PPO trading agent against simple baselines around earnings events.
              Use it to answer one question:{" "}
              <span className="text-slate-100 font-medium">
                does PPO improve equity outcomes without exploding drawdown?
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {evalStatus === "ready" ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Evaluation artifacts ready
              </div>
            ) : evalStatus === "partial" ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-xs text-rose-200">
                <XCircle className="h-4 w-4" />
                Evaluation artifacts missing (fix in public/artifacts)
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-300">
                Checking run…
              </div>
            )}
          </div>
        </div>

        {/* QUICK PATHS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <NavLink
            to="/ppo-vs-baselines"
            className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-5 hover:bg-slate-950/55 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-slate-200" />
                <div className="text-sm font-semibold text-slate-100">
                  PPO vs Baselines
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition" />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Aggregate performance: mean/median final equity + max drawdown.
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              Needs: <span className="font-mono">summary_table.csv</span>
            </div>
          </NavLink>

          <NavLink
            to="/error-analysis"
            className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-5 hover:bg-slate-950/55 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-slate-200" />
                <div className="text-sm font-semibold text-slate-100">
                  Error Analysis
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition" />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Where PPO fails: symbol-level failure concentration and deltas vs baselines.
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              Needs: <span className="font-mono">symbol_failure_summary.csv</span>
            </div>
          </NavLink>

          <NavLink
            to="/experiments"
            className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-5 hover:bg-slate-950/55 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-5 w-5 text-slate-200" />
                <div className="text-sm font-semibold text-slate-100">
                  Sprint 5 Plan
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition" />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              The ranked backlog: what to try next to improve risk-adjusted performance.
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              Works even without evaluation CSVs.
            </div>
          </NavLink>
        </div>
      </div>

      {/* RUN SNAPSHOT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-100">Run snapshot</div>
            <div className="mt-1 text-xs text-slate-400">
              Loaded from <span className="font-mono">{basePath}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-slate-400">Loading…</div>
        ) : !metrics ? (
          <div className="mt-4 text-sm text-rose-300">
            Could not load <span className="font-mono">metrics.json</span> for this run.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Training</div>
              <div className="mt-2 text-sm text-slate-200">
                timesteps:{" "}
                <span className="font-mono">
                  {String(metrics.timesteps ?? metrics.total_timesteps ?? "—")}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-200">
                episodes:{" "}
                <span className="font-mono">
                  {String(metrics.n_episodes ?? metrics.episodes ?? "—")}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Objective</div>
              <div className="mt-2 text-sm text-slate-200">
                metric:{" "}
                <span className="font-mono">
                  {String(metrics.primary_metric ?? metrics.metric ?? "final_equity")}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-200">
                constraint:{" "}
                <span className="font-mono">
                  {String(metrics.constraint ?? "drawdown-aware")}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Evaluation artifacts</div>
              <div className="mt-2 text-sm text-slate-200">
                summary_table.csv:{" "}
                <span className={hasSummary ? "text-emerald-300" : "text-rose-300"}>
                  {hasSummary ? "present" : "missing"}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-200">
                symbol_failure_summary.csv:{" "}
                <span className={hasErrorCsv ? "text-emerald-300" : "text-rose-300"}>
                  {hasErrorCsv ? "present" : "missing"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
