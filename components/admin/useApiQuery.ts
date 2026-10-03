"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { errorMessage, getDataVersion, subscribeToData } from "@/lib/admin/api";

/**
 * Loads data from the API in the browser. Refetches when `key` changes and,
 * unless `refresh` is off, after every successful mutation. While a refetch is
 * in flight the previous data stays available, so lists don't flash empty.
 */
export function useApiQuery<T>(key: string, fetcher: () => Promise<T>, { refresh = true }: { refresh?: boolean } = {}) {
  const version = useSyncExternalStore(subscribeToData, getDataVersion, () => 0);
  const stamp = refresh ? `${key}@${version}` : key;
  const [state, setState] = useState<{ stamp?: string; data?: T; error?: string }>({});
  const run = useEffectEvent(fetcher);

  useEffect(() => {
    let cancelled = false;
    run().then(
      (data) => {
        if (!cancelled) setState({ stamp, data });
      },
      (error: unknown) => {
        if (!cancelled) setState({ stamp, error: errorMessage(error) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [stamp]);

  const loading = state.stamp !== stamp;
  return { data: state.data, error: loading ? undefined : state.error, loading };
}
