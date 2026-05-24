import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { fetchPage, type FetchPageResult } from "../lib/api";
import type { EgknItem } from "../types/api";

// Lead-страница даёт быстрый count.
const LEAD_PAGE_SIZE = 10;
// pageSize=10 для небольших слоёв, 50 — для больших,
// чтобы не делать тысячи запросов и не упереться в rate-limit сервера.
const SMALL_PAGE_SIZE = 10;
const LARGE_PAGE_SIZE = 50;
const LARGE_THRESHOLD = 2000;
// Сервер начинает реджектить при слишком большом параллелизме —
// грузим страницами по WAVE_SIZE штук, ждём всю волну и идём дальше.
const WAVE_SIZE = 20;

export interface LayerPages {
  items: EgknItem[];
  totalLoaded: number;
  totalCount: number | null;
  loading: boolean;
  error: string | null;
}

const EMPTY: LayerPages = {
  items: [],
  totalLoaded: 0,
  totalCount: null,
  loading: false,
  error: null,
};

export function useLayerPages(layerName: string | null): LayerPages {
  const lead = useQuery({
    queryKey: ["layer", layerName, "lead"],
    queryFn: ({ signal }) => fetchPage(layerName!, 0, LEAD_PAGE_SIZE, signal),
    enabled: !!layerName,
  });

  const totalCount = lead.data?.count ?? null;
  const restPageSize =
    totalCount != null && totalCount > LARGE_THRESHOLD
      ? LARGE_PAGE_SIZE
      : SMALL_PAGE_SIZE;
  const restItemsLeft =
    totalCount != null ? Math.max(0, totalCount - lead.data!.items.length) : 0;
  const restTotalPages =
    restItemsLeft > 0 ? Math.ceil(restItemsLeft / restPageSize) : 0;

  const [wavesReady, setWavesReady] = useState(0);

  useEffect(() => {
    setWavesReady(0);
  }, [layerName, restPageSize, restTotalPages]);

  const enabledPages = Math.min(restTotalPages, (wavesReady + 1) * WAVE_SIZE);

  const restQueries = useQueries({
    queries:
      layerName && restTotalPages > 0
        ? Array.from({ length: restTotalPages }, (_, i) => ({
            queryKey: [
              "layer",
              layerName,
              "pageSize",
              restPageSize,
              "page",
              i + 1,
            ],
            queryFn: ({ signal }: { signal: AbortSignal }) =>
              fetchPage(layerName, i + 1, restPageSize, signal),
            enabled: lead.isSuccess && i < enabledPages,
          }))
        : [],
  });

  useEffect(() => {
    if (!lead.isSuccess || restTotalPages === 0) return;
    const waveStart = wavesReady * WAVE_SIZE;
    const waveEnd = Math.min(restTotalPages, waveStart + WAVE_SIZE);
    if (waveEnd <= waveStart) return;
    const waveDone = restQueries
      .slice(waveStart, waveEnd)
      .every((q) => q.isSuccess || q.isError);
    if (waveDone && waveEnd < restTotalPages) {
      setWavesReady((w) => w + 1);
    }
  }, [lead.isSuccess, restQueries, restTotalPages, wavesReady]);

  const items = useMemo(() => {
    if (!layerName) return [];
    const pages: Array<FetchPageResult | undefined> = [
      lead.data,
      ...restQueries.map((q) => q.data),
    ];
    return pages.flatMap((r) => tagItems(layerName, r));
  }, [layerName, lead.data, restQueries]);

  if (!layerName) return EMPTY;

  const inflight =
    lead.isLoading ||
    lead.isFetching ||
    restQueries.some((q) => q.isLoading || q.isFetching);
  const allWavesEnabled =
    restTotalPages === 0 || enabledPages >= restTotalPages;
  const loading = inflight || !allWavesEnabled;

  const errorObj = lead.error ?? restQueries.find((q) => q.error)?.error ?? null;
  const error = errorObj instanceof Error ? errorObj.message : null;

  return {
    items,
    totalLoaded: items.length,
    totalCount,
    loading,
    error,
  };
}

function tagItems(
  layer: string,
  res: FetchPageResult | undefined,
): EgknItem[] {
  if (!res) return [];
  return res.items.map((it) => ({ ...it, _layerName: layer }));
}
