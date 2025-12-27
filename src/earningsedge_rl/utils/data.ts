import Papa from "papaparse";

export async function loadCSV<T = any>(url: string): Promise<T[]> {
  const res = await fetch(url);

  // If Vite serves index.html for a missing file, res.ok can still be true.
  const text = await res.text();

  const looksLikeHtml =
    text.trim().startsWith("<!doctype") ||
    text.trim().startsWith("<html") ||
    res.headers.get("content-type")?.includes("text/html");

  if (!res.ok || looksLikeHtml) {
    throw new Error(
      `Artifact not found or mis-routed: ${url} returned HTML (did you export to public/artifacts?)`
    );
  }

  const parsed = Papa.parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) console.warn("CSV parse warnings:", parsed.errors);
  return (parsed.data ?? []) as T[];
}
