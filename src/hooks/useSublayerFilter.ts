import { useMemo } from "react";
import type { LayerAdapter } from "../lib/layerAdapter";
import type { LayerNode } from "../lib/layersMeta";
import { filterBySublayer } from "../lib/sublayerFilter";
import type { EgknItem } from "../types/api";

export function useSublayerFilter(
  items: EgknItem[],
  codes: Set<string>,
  layer: LayerNode | null,
  adapter: LayerAdapter,
): EgknItem[] {
  return useMemo(
    () => filterBySublayer(items, codes, layer, adapter),
    [items, codes, layer, adapter],
  );
}
