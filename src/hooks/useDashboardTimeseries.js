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

  if (res.status === 304) return null;

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` - ${txt}` : ""}`);
  }
  return res.json();
}

export function useDashboardTimeseries(arg) {
  const days = typeof arg === "number" ? arg : arg?.days ?? 30;

  const cacheKey = useMemo(() => `dash:timeseries:${days}`, [days]);
  const cached = safeRead(cacheKey, { items: [], meta: { days } });

  const [items, setItems] = useState(() => cached.items || []);
  const [meta, setMeta] = useState(() => cached.meta || { days });

  const [loading, setLoading] = useState(() => ((cached.items || []).length ? false : true));
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const didLoadOnce = useRef(((cached.items || []).length > 0));
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
        const data = await getJson(`/api/dashboard/timeseries${qs}`, ctrl.signal);

        if (data) {
          const nextItems = Array.isArray(data?.items) ? data.items : items;
          const nextMeta = data?.meta ?? meta;

          setItems(nextItems);
          setMeta(nextMeta);

          safeWrite(cacheKey, { items: nextItems, meta: nextMeta });
          didLoadOnce.current = true;
        }
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Error cargando timeseries");
      } finally {
        setLoading(false);
        setFetching(false);
      }
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, refreshKey, cacheKey]);

  const isLoading = loading;
  const isError = Boolean(error);

  return {
    data: { items, meta }, // 👈 lo que MetricsPage espera: data.items
    items,
    meta,
    loading,
    fetching,
    error,
    isLoading,
    isError,
    refetch,
  };
}

export default useDashboardTimeseries;
