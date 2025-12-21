type Props = {
  title: string;
  policy: string;
  value: number;
  inverse?: boolean; // when lower is better (drawdown)
};

export default function KpiCard({ title, policy, value, inverse }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-xs text-slate-400">{title}</div>

      <div className="mt-2 text-lg font-semibold text-slate-100">
        {Number.isFinite(value) ? value.toFixed(4) : "—"}
      </div>

      <div
        className={`mt-1 text-xs ${
          inverse ? "text-emerald-400" : "text-sky-400"
        }`}
      >
        {policy}
      </div>
    </div>
  );
}

