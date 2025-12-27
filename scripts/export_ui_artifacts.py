#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
from pathlib import Path

def safe_copy(src: Path, dst: Path) -> bool:
    if not src.exists():
        print(f"[skip] missing: {src}")
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    print(f"[copy] {src} -> {dst}")
    return True

def write_csv_from_rows(rows: list[dict], out_path: Path) -> None:
    import csv
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        raise RuntimeError(f"No rows to write for {out_path}")
    # union keys (stable order: common keys first)
    keys = []
    for r in rows:
        for k in r.keys():
            if k not in keys:
                keys.append(k)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        w.writerows(rows)

def try_extract_summary_table(metrics: dict) -> list[dict] | None:
    # Common patterns you might have
    for k in ["summary_table", "summary", "aggregate_summary", "summary_rows"]:
        v = metrics.get(k)
        if isinstance(v, list) and v and isinstance(v[0], dict):
            return v
    return None

def main() -> None:
    ROOT = Path(__file__).resolve().parents[1]
    runs_dir = ROOT / "runs"
    ui_public = ROOT / "ui" / "earningsedge-dashboard" / "public" / "artifacts"

    mapping = {
        "sprint4": runs_dir / "sprint4_generalization",
        "sprint5": runs_dir / "sprint5_long_train",
    }

    for sprint_key, run_dir in mapping.items():
        out_dir = ui_public / sprint_key
        out_dir.mkdir(parents=True, exist_ok=True)

        # Always copy what exists
        safe_copy(run_dir / "metrics.json", out_dir / "metrics.json")
        safe_copy(run_dir / "train_meta.json", out_dir / "train_meta.json")
        safe_copy(run_dir / "universe_split.json", out_dir / "universe_split.json")

        for name in [
            "ppo_curves.json",
            "buy_hold_curves.json",
            "avoid_earnings_curves.json",
            "flat_curves.json",
        ]:
            safe_copy(run_dir / name, out_dir / name)

        # These two are what your UI expects
        summary_csv = out_dir / "summary_table.csv"
        failure_csv = out_dir / "symbol_failure_summary.csv"

        # If the CSV already exists in the run folder, copy it
        if not safe_copy(run_dir / "summary_table.csv", summary_csv):
            # Try to derive it from metrics.json if possible
            metrics_path = run_dir / "metrics.json"
            if metrics_path.exists():
                metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
                rows = try_extract_summary_table(metrics)
                if rows:
                    write_csv_from_rows(rows, summary_csv)
                    print(f"[gen] wrote {summary_csv} from metrics.json (embedded table)")
                else:
                    print(f"[warn] no summary_table.csv for {sprint_key} and couldn't derive from metrics.json")

        # same idea for failure summary
        if not safe_copy(run_dir / "symbol_failure_summary.csv", failure_csv):
            # If your notebook writes it elsewhere, you can add more paths here later
            print(f"[warn] no symbol_failure_summary.csv for {sprint_key}")

    print("\nDone. Now your UI should fetch from /artifacts/sprint4 and /artifacts/sprint5.\n")

if __name__ == "__main__":
    main()