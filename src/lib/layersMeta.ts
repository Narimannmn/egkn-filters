const ENDPOINT = "https://map.gov4c.kz/egkn/rest/map/layers?lang=ru";

export interface Sublayer {
  code: string;
  title: string;
}

export interface LayerNode {
  name: string;
  title: string;
  sublayers: Sublayer[];
}

export interface LayerGroup {
  name: string;
  title: string;
  layers: LayerNode[];
}

interface RawSublayer {
  name: string;
  title: string;
}
interface RawLayer {
  name: string;
  title: string;
  sublayers?: RawSublayer[];
}
interface RawGroup {
  name: string;
  title: string;
  layers?: RawLayer[];
}

export async function fetchLayersMeta(): Promise<LayerGroup[]> {
  const res = await fetch(ENDPOINT, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = (await res.json()) as RawGroup[];
  return raw
    .map((g) => ({
      name: g.name,
      title: g.title,
      layers: (g.layers ?? []).map((l) => ({
        name: l.name,
        title: l.title,
        sublayers: (l.sublayers ?? []).map((s) => ({
          code: s.name,
          title: s.title,
        })),
      })),
    }));
}

export function findLayerMeta(
  groups: LayerGroup[],
  layerName: string,
): LayerNode | null {
  for (const g of groups) {
    for (const l of g.layers) {
      if (l.name === layerName) return l;
    }
  }
  return null;
}
