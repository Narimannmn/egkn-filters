import type { EgknItem } from "../types/api";

const ENDPOINT = "https://map.gov4c.kz/egkn/rest/map/layer";

export interface FetchPageResult {
  items: EgknItem[];
  count: number;
}

export async function fetchPage(
  layer: string,
  pageNum: number,
  pageSize = 10,
  signal?: AbortSignal,
): Promise<FetchPageResult> {
  const url =
    `${ENDPOINT}?name=${encodeURIComponent(layer)}&pageNum=${pageNum}` +
    `&pageSize=${pageSize}&lang=ru&readySite=false`;
  const res = await fetch(url, { credentials: "same-origin", signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const items = extractItems(data, layer);
  const count = typeof data.count === "number" ? data.count : items.length;
  return { items, count };
}

function extractItems(data: Record<string, unknown>, layer: string): EgknItem[] {
  const byLayer = data[layer];
  if (Array.isArray(byLayer)) return byLayer as EgknItem[];
  const req = data.req;
  if (Array.isArray(req)) return req as EgknItem[];
  for (const v of Object.values(data)) {
    if (Array.isArray(v)) return v as EgknItem[];
  }
  return [];
}
