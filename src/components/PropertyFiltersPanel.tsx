import { useMemo } from "react";
import type { LayerAdapter } from "../lib/layerAdapter";
import {
  NULL_VALUE_CODE,
  collectUniqueValues,
} from "../lib/propertyFilter";
import type { PropertyFiltersApi } from "../hooks/usePropertyFilters";
import type { EgknItem } from "../types/api";
import { ValueMultiSelect, type ValueOption } from "./ValueMultiSelect";

interface PropertyFiltersPanelProps {
  items: EgknItem[];
  adapter: LayerAdapter;
  api: PropertyFiltersApi;
}

function toOptions(counts: Map<string, number>): ValueOption[] {
  const opts: ValueOption[] = [];
  for (const [value] of counts) {
    if (value === NULL_VALUE_CODE) continue;
    opts.push({ value, title: value });
  }
  opts.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  return opts;
}

export function PropertyFiltersPanel({
  items,
  adapter,
  api,
}: PropertyFiltersPanelProps) {
  const rightCounts = useMemo(
    () => collectUniqueValues(items, adapter.getRight),
    [items, adapter],
  );
  const statusCounts = useMemo(
    () => collectUniqueValues(items, adapter.getStatus),
    [items, adapter],
  );

  const rightOptions = useMemo(() => toOptions(rightCounts), [rightCounts]);
  const statusOptions = useMemo(() => toOptions(statusCounts), [statusCounts]);

  if (items.length === 0) return null;

  const hasAnySelection =
    api.filters.rights.size > 0 || api.filters.statuses.size > 0;

  const selectAllRights = () => {
    const all = new Set<string>(rightOptions.map((o) => o.value));
    if (rightCounts.has(NULL_VALUE_CODE)) all.add(NULL_VALUE_CODE);
    api.setRights(all);
  };
  const selectAllStatuses = () => {
    const all = new Set<string>(statusOptions.map((o) => o.value));
    if (statusCounts.has(NULL_VALUE_CODE)) all.add(NULL_VALUE_CODE);
    api.setStatuses(all);
  };

  return (
    <div className="egkn-filters-panel">
      <div className="egkn-filters-header">
        <span className="egkn-field-label">Доп. фильтры</span>
        {hasAnySelection ? (
          <button
            type="button"
            className="egkn-link-btn egkn-link-btn-danger"
            onClick={api.clearAll}
          >
            сбросить все
          </button>
        ) : null}
      </div>

      {rightOptions.length > 0 || rightCounts.has(NULL_VALUE_CODE) ? (
        <ValueMultiSelect
          label="Вид права"
          options={rightOptions}
          selected={api.filters.rights}
          onToggle={api.toggleRight}
          onClear={api.clearRights}
          onSelectAll={selectAllRights}
          counts={rightCounts}
          nullValue={rightCounts.has(NULL_VALUE_CODE) ? NULL_VALUE_CODE : undefined}
          nullLabel="Без вида права"
        />
      ) : null}

      {statusOptions.length > 0 || statusCounts.has(NULL_VALUE_CODE) ? (
        <ValueMultiSelect
          label="Статус"
          options={statusOptions}
          selected={api.filters.statuses}
          onToggle={api.toggleStatus}
          onClear={api.clearStatuses}
          onSelectAll={selectAllStatuses}
          counts={statusCounts}
          nullValue={statusCounts.has(NULL_VALUE_CODE) ? NULL_VALUE_CODE : undefined}
          nullLabel="Без статуса"
        />
      ) : null}
    </div>
  );
}
