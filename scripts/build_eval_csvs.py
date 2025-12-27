#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
RUNS_DIR = ROOT / "runs"


def _safe_num(x: Any) -> float:
    try:
        n = float(x)
        return n if math.isfinite(n) else float("nan")
    except Exception:
        return float("nan")


def _max_drawdown(equity: List[float]) -> float:
    """
    Max drawdown as a positive fraction (peak-to-trough / peak).
    If equity is absolute dollars, this still works (relative to peak).
    """
    if not equity:
        return float("nan")
    peak = equity[0]
    mdd = 0.0
    for v in equity:
        if v > peak:
            peak = v
        if peak > 0:
            dd = (peak - v) / peak
            if dd > mdd:
                mdd = dd
    return float(mdd)


def _extract_episode_equity(episode: Any) -> Optional[List[float]]:
    """
    Tries multiple common shapes:
      - {"equity": [..]}
      - {"equity_curve": [..]}
      - {"curve": {"equity": [..]}}
      - {"values": [..]}  (last-resort)
    """
    if isinstance(episode, dict):
        for key in ("equity", "equity_curve", "equityCurve", "values"):
            if key in episode and isinstance(episode[key], list):
                return [_safe_num(v) for v in episode[key]]
        # nested
        if "curve" in episode and isinstance(episode["curve"], dict):
            if "equity" in episode["curve"] and isinstance(episode["curve"]["equity"], list):
                return [_safe_num(v) for v in episode["curve"]["equity"]]
    return None


def _iter_episodes(curves_obj: Any) -> List[Dict[str, Any]]:
    """
    Supports:
      - {"episodes": [ {..}, {..} ]}
      - [ {..}, {..} ]
      - {"data": [..]}
    """
    if isinstance(curves_obj, dict):
        if isinstance(curves_obj.get("episodes"), list):
            return curves_obj["episodes"]
        if isinstance(curves_obj.get("data"), list):
            return curves_obj["data"]
    if isinstance(curves_obj, list):
        return curves_obj
    return []


def _load_json(p: Path) -> Any:
    return json.loads(p.read_text(encoding="utf-8"))


def build_summary_table(run_dir: Path, out_csv: Path) -> pd.DataFrame:
    """
    Produces summary_table.csv with columns:
      policy,n_episodes,mean_final_equity,median_final_equity,mean_max_drawdown,median_max_drawdown
    computed from *_curves.json files found in run_dir.
    """
    policies = [
        ("ppo", run_dir / "ppo_curves.json"),
        ("buy_hold", run_dir / "buy_hold_curves.json"),
        ("avoid_earnings", run_dir / "avoid_earnings_curves.json"),
        ("flat", run_dir / "flat_curves.json"),
    ]

    rows = []
    for policy, fp in policies:
        if not fp.exists():
            continue
        obj = _load_json(fp)
        eps = _iter_episodes(obj)

        finals = []
        mdds = []

        for ep in eps:
            eq = _extract_episode_equity(ep)
            if not eq or len(eq) < 2:
                continue
            finals.append(eq[-1])
            mdds.append(_max_drawdown(eq))

        if finals:
            s = pd.Series(finals, dtype="float64")
            d = pd.Series(mdds, dtype="float64")
            rows.append(
                dict(
                    policy=policy,
                    n_episodes=int(len(finals)),
                    mean_final_equity=float(s.mean()),
                    median_final_equity=float(s.median()),
                    mean_max_drawdown=float(d.mean()),
                    median_max_drawdown=float(d.median()),
                )
            )

    df = pd.DataFrame(rows)
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_csv, index=False)
    return df


def build_symbol_failure_summary(run_dir: Path, out_csv: Path) -> pd.DataFrame:
    """
    Best-effort: creates symbol_failure_summary.csv if per-episode symbol metadata exists
    inside the PPO curves episodes. If not present, emits an empty CSV with headers
    (so UI renders a helpful empty state rather than exploding).
    """
    ppo_fp = run_dir / "ppo_curves.json"
    if not ppo_fp.exists():
        df = pd.DataFrame(columns=[
            "symbol","n_pairs","fail_rate","failures","reason","flags","failure_flags","primary_flag",
            "mean_delta_eq_vs_buyhold","mean_dd_improve_vs_buyhold","mean_delta_eq_vs_avoid","mean_dd_improve_vs_avoid"
        ])
        out_csv.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_csv, index=False)
        return df

    ppo = _load_json(ppo_fp)
    ppo_eps = _iter_episodes(ppo)

    # Load baselines if present to compute deltas/improvements
    def _load_policy_eps(name: str) -> List[Dict[str, Any]]:
        fp = run_dir / f"{name}_curves.json"
        if not fp.exists():
            return []
        return _iter_episodes(_load_json(fp))

    bh_eps = _load_policy_eps("buy_hold")
    av_eps = _load_policy_eps("avoid_earnings")

    # Build lookup by episode id if possible (common keys: episode_id, id, seed)
    def _key(ep: Dict[str, Any]) -> Optional[str]:
        for k in ("episode_id", "episodeId", "id", "seed"):
            if k in ep and ep[k] is not None:
                return str(ep[k])
        return None

    bh_by = { _key(e): e for e in bh_eps if _key(e) is not None }
    av_by = { _key(e): e for e in av_eps if _key(e) is not None }

    buckets: Dict[str, List[Dict[str, Any]]] = {}

    for ep in ppo_eps:
        sym = None
        for k in ("symbol","ticker","asset"):
            if k in ep and ep[k]:
                sym = str(ep[k]).strip().upper()
                break
        if not sym:
            continue
        buckets.setdefault(sym, []).append(ep)

    # If no symbol metadata exists, write empty CSV (UI should show "No rows")
    if not buckets:
        df = pd.DataFrame(columns=[
            "symbol","n_pairs","fail_rate","failures","reason","flags","failure_flags","primary_flag",
            "mean_delta_eq_vs_buyhold","mean_dd_improve_vs_buyhold","mean_delta_eq_vs_avoid","mean_dd_improve_vs_avoid"
        ])
        out_csv.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_csv, index=False)
        return df

    out_rows = []
    for sym, eps in buckets.items():
        n = 0
        fails = 0
        deq_bh = []
        ddimp_bh = []
        deq_av = []
        ddimp_av = []

        for ep in eps:
            eq = _extract_episode_equity(ep)
            if not eq or len(eq) < 2:
                continue
            n += 1

            # define a "failure" as final equity <= 0.95 * peak (or any rule you prefer)
            # This is a pragmatic proxy; replace later with your notebook’s real failure logic.
            peak = max(eq)
            failure = (eq[-1] < 0.95 * peak) if peak > 0 else False
            fails += 1 if failure else 0

            ep_id = _key(ep)

            # PPO vs BuyHold deltas (if matchable)
            if ep_id and ep_id in bh_by:
                bh_eq = _extract_episode_equity(bh_by[ep_id]) or []
                if bh_eq:
                    deq_bh.append(eq[-1] - bh_eq[-1])
                    ddimp_bh.append(_max_drawdown(bh_eq) - _max_drawdown(eq))  # positive = PPO improved DD

            # PPO vs AvoidEarnings deltas (if matchable)
            if ep_id and ep_id in av_by:
                av_eq = _extract_episode_equity(av_by[ep_id]) or []
                if av_eq:
                    deq_av.append(eq[-1] - av_eq[-1])
                    ddimp_av.append(_max_drawdown(av_eq) - _max_drawdown(eq))

        if n == 0:
            continue

        def _mean(xs: List[float]) -> float:
            xs = [x for x in xs if math.isfinite(x)]
            return float(sum(xs) / len(xs)) if xs else float("nan")

        out_rows.append(dict(
            symbol=sym,
            n_pairs=float(n),
            fail_rate=float(fails / n) if n else float("nan"),
            failures=float(fails),
            reason="",
            flags="",
            failure_flags="",
            primary_flag="",
            mean_delta_eq_vs_buyhold=_mean(deq_bh),
            mean_dd_improve_vs_buyhold=_mean(ddimp_bh),
            mean_delta_eq_vs_avoid=_mean(deq_av),
            mean_dd_improve_vs_avoid=_mean(ddimp_av),
        ))

    df = pd.DataFrame(out_rows)
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_csv, index=False)
    return df


def main():
    run_dir = RUNS_DIR / "sprint5_long_train"
    if not run_dir.exists():
        raise SystemExit(f"Run dir not found: {run_dir}")

    summary_csv = run_dir / "summary_table.csv"
    symfail_csv = run_dir / "symbol_failure_summary.csv"

    df1 = build_summary_table(run_dir, summary_csv)
    df2 = build_symbol_failure_summary(run_dir, symfail_csv)

    print(f"[ok] wrote {summary_csv} ({len(df1)} rows)")
    print(f"[ok] wrote {symfail_csv} ({len(df2)} rows)")


if __name__ == "__main__":
    main()
