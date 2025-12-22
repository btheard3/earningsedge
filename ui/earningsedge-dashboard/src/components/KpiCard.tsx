type Props = {
  title: string;
  policy?: string; // optional label under value
  value: number;
  inverse?: boolean;
  formatter?: (v: number) => string;
};

export default function KpiCard({
  title,
  policy,
  value,
  inverse,
  formatter,
}: Props) {
  const display = formatter ? formatter(value) : Number.isFinite(value) ? value.toFixed(4) : "—";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-xs text-slate-400">{title}</div>

      <div className="mt-2 text-2xl font-semibold text-slate-100">
        {display}
      </div>

      {policy ? (
        <div className={`mt-1 text-xs ${inverse ? "text-emerald-300" : "text-sky-300"}`}>
          {policy}
        </div>
      ) : (
        <div className="mt-1 text-xs text-slate-500"> </div>
      )}
    </div>
  );
}
