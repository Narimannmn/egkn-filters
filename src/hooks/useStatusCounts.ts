import { useMemo } from "react";
import type { LayerAdapter } from "../lib/layerAdapter";
import type { LayerNode } from "../lib/layersMeta";
import { computeStatusCounts } from "../lib/statusCounts";
import type { EgknItem } from "../types/api";

export function useStatusCounts(
  items: EgknItem[],
  layer: LayerNode | null,
  adapter: LayerAdapter,
): Map<string, number> {
  return useMemo(
    () => computeStatusCounts(items, layer, adapter),
    [items, layer, adapter],
  );
}
