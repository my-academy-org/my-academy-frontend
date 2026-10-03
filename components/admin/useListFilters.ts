"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/**
 * List filters live in the URL (?status=…&search=…&page=…) so the server
 * fetches exactly the page being shown. "" means "no filter".
 */
export function useListFilters<F extends { search: string }>(basePath: string, filters: F) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.search);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A pending search must not navigate after the list is left.
  useEffect(() => () => clearTimeout(timer.current), []);

  const hrefFor = (changes: Partial<F>, page = 1) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, ...changes })) {
      if (value) params.set(key, String(value));
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  /** Changing a filter goes back to the first page. */
  const apply = (changes: Partial<F>) => {
    clearTimeout(timer.current);
    startTransition(() => router.replace(hrefFor(changes), { scroll: false }));
  };

  const onSearch = (value: string) => {
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => apply({ search: value.trim() } as Partial<F>), 350);
  };

  const reset = () => {
    setQuery("");
    clearTimeout(timer.current);
    startTransition(() => router.replace(basePath, { scroll: false }));
  };

  return { query, onSearch, apply, reset, hrefFor, pending };
}
