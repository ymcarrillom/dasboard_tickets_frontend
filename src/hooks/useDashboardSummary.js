import { useEffect, useMemo, useRef, useState } from "react";

function safeRead(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

async function getJson(url, signal) {
  const res = await fetch(url, {
    signal,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-store",
    },
  });

  // ✅ si el servidor responde 304 (Not Modified), NO es error
  if (res.status === 304) return null;

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` - ${txt}` : ""}`);
  }
  return res.json();
}

export function useDashboardSummary(arg) {
  const days = typeof arg === "number" ? arg : arg?.days ?? 30;

  const cacheKey = useMemo(() => `dash:summary:${days}`, [days]);
  const cachedSummary = safeRead(cacheKey, null);

  const [summary, setSummary] = useState(() => cachedSummary);
  const [loading, setLoading] = useState(() => (cachedSummary ? false : true));
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const didLoadOnce = useRef(Boolean(cachedSummary));
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const ctrl = new AbortController();
    const isInitial = !didLoadOnce.current;

    (async () => {
      try {
        setError(null);
        if (isInitial) setLoading(true);
        else setFetching(true);

        const qs = `?days=${encodeURIComponent(days)}`;
        const data = await getJson(`/api/dashboard/summary${qs}`, ctrl.signal);

        // ✅ 304 → null → no actualizamos pero tampoco marcamos error
        if (data) {
          setSummary(data);
          safeWrite(cacheKey, data);
          didLoadOnce.current = true;
        }
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Error cargando summary");
        // ✅ no limpiamos summary (evita parpadeo)
      } finally {
        setLoading(false);
        setFetching(false);
      }
    })();

    return () => ctrl.abort();
  }, [days, refreshKey, cacheKey]);

  const isLoading = loading;
  const isError = Boolean(error);

  return {
    data: summary,
    summary,
    loading,
    fetching,
    error,
    isLoading,
    isError,
    refetch,
  };
}

export default useDashboardSummary;
