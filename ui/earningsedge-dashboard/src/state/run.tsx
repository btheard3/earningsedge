import { createContext, useContext, useMemo, useState } from "react";

type RunKey = "sprint4" | "sprint5";

const RunContext = createContext<{
  run: RunKey;
  setRun: (r: RunKey) => void;
  basePath: string;
} | null>(null);

export function RunProvider({ children }: { children: React.ReactNode }) {
  const [run, setRun] = useState<RunKey>("sprint4");

  const value = useMemo(
    () => ({
      run,
      setRun,
      basePath: `/artifacts/${run}`,
    }),
    [run]
  );

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error("useRun must be used inside RunProvider");
  return ctx;
}
