import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropertyFilters } from "../lib/propertyFilter";

export interface PropertyFiltersApi {
  filters: PropertyFilters;
  toggleRight: (value: string) => void;
  toggleStatus: (value: string) => void;
  clearRights: () => void;
  clearStatuses: () => void;
  setRights: (values: Set<string>) => void;
  setStatuses: (values: Set<string>) => void;
  clearAll: () => void;
}

function toggleInSet(prev: Set<string>, value: string): Set<string> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function usePropertyFilters(resetSignal: unknown): PropertyFiltersApi {
  const [rights, setRightsState] = useState<Set<string>>(() => new Set());
  const [statuses, setStatusesState] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setRightsState(new Set());
    setStatusesState(new Set());
  }, [resetSignal]);

  const toggleRight = useCallback(
    (value: string) => setRightsState((prev) => toggleInSet(prev, value)),
    [],
  );
  const toggleStatus = useCallback(
    (value: string) => setStatusesState((prev) => toggleInSet(prev, value)),
    [],
  );
  const clearRights = useCallback(() => setRightsState(new Set()), []);
  const clearStatuses = useCallback(() => setStatusesState(new Set()), []);
  const clearAll = useCallback(() => {
    setRightsState(new Set());
    setStatusesState(new Set());
  }, []);

  const filters = useMemo<PropertyFilters>(
    () => ({ rights, statuses }),
    [rights, statuses],
  );

  return {
    filters,
    toggleRight,
    toggleStatus,
    clearRights,
    clearStatuses,
    setRights: setRightsState,
    setStatuses: setStatusesState,
    clearAll,
  };
}
