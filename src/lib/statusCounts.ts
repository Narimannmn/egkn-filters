import type { LayerAdapter } from "./layerAdapter";
import type { LayerNode } from "./layersMeta";
import { NULL_STATUS_CODE } from "./sublayerFilter";
import type { EgknItem } from "../types/api";

export function computeStatusCounts(
  items: EgknItem[],
  layer: LayerNode | null,
  adapter: LayerAdapter,
): Map<string, number> {
  const counts = new Map<string, number>();
  if (!layer || layer.sublayers.length === 0) return counts;
  const titleToCode = new Map(layer.sublayers.map((s) => [s.title, s.code]));
  for (const item of items) {
    const status = adapter.getStatus(item);
    const code = status == null ? NULL_STATUS_CODE : titleToCode.get(status);
    if (code == null) continue;
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  return counts;
}
