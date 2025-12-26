import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, FlaskConical, LineChart, AlertTriangle } from "lucide-react";
import { useRun } from "../state/run";

const nav = [
  { to: "/", label: "Overview", icon: BarChart3 },
  { to: "/ppo-vs-baselines", label: "PPO vs Baselines", icon: LineChart },
  { to: "/error-analysis", label: "Error Analysis", icon: AlertTriangle },
  { to: "/experiments", label: "Sprint 5 Plan", icon: FlaskConical },
];

export default function AppShell() {
  const { run, setRun } = useRun();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-72 md:flex-col border-r border-slate-800 bg-slate-950/60 backdrop-blur">
          <div className="px-5 py-5">
            <div className="text-lg font-bold tracking-tight">
              EarningsEdge <span className="text-emerald-400">RL</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              PPO evaluation • matched episodes • diagnostics
            </div>

            {/* Run selector (Sprint 4 vs Sprint 5) */}
            <div className="mt-4">
              <label className="block text-[11px] text-slate-500 mb-1">Run</label>
              <select
                value={run}
                onChange={(e) => setRun(e.target.value as any)}
                className="h-9 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 text-sm text-slate-200 outline-none focus:border-slate-600"
              >
                <option value="sprint4">Sprint 4 – Baseline</option>
                <option value="sprint5">Sprint 5 – Long Train</option>
              </select>
              <div className="mt-2 text-[11px] text-slate-500">
                Loading from <span className="font-mono">/artifacts/{run}</span>
              </div>
            </div>
          </div>

          <nav className="px-3 pb-6">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    isActive
                      ? "bg-slate-800/60 text-white"
                      : "text-slate-300 hover:bg-slate-900/60 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-5 py-4 border-t border-slate-800 text-xs text-slate-400">
            Built from your notebook artifacts in{" "}
            <code className="text-slate-300">runs/</code>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/60 backdrop-blur">
            <div className="px-4 md:px-8 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Dashboard</div>
                <div className="text-xl font-semibold">EarningsEdge Results</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-xs text-slate-400">
                  Local • Vite • Tailwind
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
            </div>
          </header>

          <div className="px-4 md:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
