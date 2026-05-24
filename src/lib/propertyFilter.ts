import type { LayerAdapter } from "./layerAdapter";
import type { EgknItem } from "../types/api";

export const NULL_VALUE_CODE = "__null";

export interface PropertyFilters {
  rights: Set<string>;
  statuses: Set<string>;
}

export function collectUniqueValues(
  items: EgknItem[],
  pick: (item: EgknItem) => string | null,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const v = pick(item) ?? NULL_VALUE_CODE;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

export function filterByProperties(
  items: EgknItem[],
  filters: PropertyFilters,
  adapter: LayerAdapter,
): EgknItem[] {
  const { rights, statuses } = filters;
  if (rights.size === 0 && statuses.size === 0) return items;
  return items.filter((item) => {
    if (rights.size > 0) {
      const r = adapter.getRight(item) ?? NULL_VALUE_CODE;
      if (!rights.has(r)) return false;
    }
    if (statuses.size > 0) {
      const s = adapter.getStatus(item) ?? NULL_VALUE_CODE;
      if (!statuses.has(s)) return false;
    }
    return true;
  });
}
