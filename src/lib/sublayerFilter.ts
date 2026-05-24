import type { LayerAdapter } from "./layerAdapter";
import type { LayerNode } from "./layersMeta";
import type { EgknItem } from "../types/api";

export const NULL_STATUS_CODE = "__null";

export function filterBySublayer(
  items: EgknItem[],
  codes: Set<string>,
  layer: LayerNode | null,
  adapter: LayerAdapter,
): EgknItem[] {
  if (codes.size === 0) return items;
  if (!layer || layer.sublayers.length === 0) return items;
  return items.filter((item) => {
    const status = adapter.getStatus(item);
    if (status == null) return codes.has(NULL_STATUS_CODE);
    const code = layer.sublayers.find((s) => s.title === status)?.code;
    return code != null && codes.has(code);
  });
}
