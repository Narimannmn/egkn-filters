import { useEffect, useState } from "react";
import { findLayerMeta, type LayerGroup } from "../lib/layersMeta";
import { NULL_STATUS_CODE } from "../lib/sublayerFilter";

export interface LayerSelection {
  groupName: string | null;
  layerName: string | null;
  sublayerCodes: Set<string>;
  selectGroup(name: string): void;
  selectLayer(name: string | null): void;
  toggleSublayer(code: string): void;
  clearSublayers(): void;
  selectAllSublayers(): void;
}

export function useLayerSelection(
  meta: LayerGroup[],
  resetSignal: unknown,
): LayerSelection {
  const [groupName, setGroupName] = useState<string | null>(
    () => meta[0]?.name ?? null,
  );
  const [layerName, setLayerName] = useState<string | null>(null);
  const [sublayerCodes, setSublayerCodes] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    setLayerName(null);
    setSublayerCodes(new Set());
  }, [resetSignal]);

  const selectGroup = (name: string) => {
    setGroupName(name);
    setLayerName(null);
    setSublayerCodes(new Set());
  };

  const selectLayer = (name: string | null) => {
    setLayerName(name);
    setSublayerCodes(new Set());
  };

  const toggleSublayer = (code: string) => {
    setSublayerCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const clearSublayers = () => setSublayerCodes(new Set());

  const selectAllSublayers = () => {
    if (!layerName) return;
    const layer = findLayerMeta(meta, layerName);
    if (!layer) return;
    const all = new Set<string>(layer.sublayers.map((s) => s.code));
    all.add(NULL_STATUS_CODE);
    setSublayerCodes(all);
  };

  return {
    groupName,
    layerName,
    sublayerCodes,
    selectGroup,
    selectLayer,
    toggleSublayer,
    clearSublayers,
    selectAllSublayers,
  };
}
