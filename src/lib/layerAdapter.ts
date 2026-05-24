import type { EgknItem, EgknProperty } from "../types/api";

export interface FieldRow {
  label: string;
  value: string;
}

export interface Badge {
  kind: "status" | "use" | "right" | "method" | "category";
  label: string;
  title: string;
}

export interface LayerAdapter {
  getStatus(item: EgknItem): string | null;
  getRight(item: EgknItem): string | null;
  getAddress(item: EgknItem): string | null;
  getRows(item: EgknItem): FieldRow[];
  getBadges(item: EgknItem): Badge[];
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v : null;

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

function fmtArea(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} м²`;
}

function fmtMoney(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} ₸`;
}

function fmtDate(s: string): string {
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime()) && /\d{4}-\d{2}-\d{2}/.test(s)) {
    return iso.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  return s;
}

function joinNonEmpty(parts: Array<string | null>, sep: string): string | null {
  const filtered = parts.filter((p): p is string => Boolean(p));
  return filtered.length ? filtered.join(sep) : null;
}

const reqlandAdapter: LayerAdapter = {
  getStatus: (item) => str(item.properties.land_status_name_ru),
  getRight: (item) => str(item.properties.right_type_name_ru),
  getAddress: (item) => {
    const p = item.properties;
    return joinNonEmpty([str(p.address_ru), str(p.placedesc_ru)], ", ");
  },
  getRows: (item) => {
    const p = item.properties;
    const rows: FieldRow[] = [];
    const area = num(p.shape_area);
    if (area != null) rows.push({ label: "Площадь", value: fmtArea(area) });
    const date = str(p.request_date);
    if (date) rows.push({ label: "Дата", value: fmtDate(date) });
    return rows;
  },
  getBadges: (item) => {
    const p = item.properties;
    const badges: Badge[] = [];
    const status = str(p.land_status_name_ru);
    if (status) badges.push({ kind: "status", label: status, title: "Статус" });
    const use = str(p.usedesc_ru);
    if (use) badges.push({ kind: "use", label: use, title: "Назначение" });
    const right = str(p.right_type_name_ru);
    if (right) badges.push({ kind: "right", label: right, title: "Вид права" });
    return badges;
  },
};

const freeAdapter: LayerAdapter = {
  getStatus: (item) => str(item.properties.land_status_name_ru),
  getRight: (item) => str(item.properties.pvp_name_ru),
  getAddress: (item) => str(item.properties.address_rus),
  getRows: (item) => {
    const p = item.properties as EgknProperty & Record<string, unknown>;
    const rows: FieldRow[] = [];
    const area = num(p.area) ?? num(p.squ);
    if (area != null) rows.push({ label: "Площадь", value: fmtArea(area) });
    const auction = str(p.auction_time);
    if (auction) rows.push({ label: "Торг", value: fmtDate(auction) });
    const pub = str(p.publish_date);
    if (pub) rows.push({ label: "Публикация", value: fmtDate(pub) });
    const start = num(p.start_cost);
    if (start != null && start > 0) {
      rows.push({ label: "Стартовая цена", value: fmtMoney(start) });
    }
    return rows;
  },
  getBadges: (item) => {
    const p = item.properties as EgknProperty & Record<string, unknown>;
    const badges: Badge[] = [];
    const status = str(p.land_status_name_ru);
    if (status) badges.push({ kind: "status", label: status, title: "Статус" });
    const right = str(p.pvp_name_ru);
    if (right) badges.push({ kind: "right", label: right, title: "Вид права" });
    const use = str(p.usedesc_ru);
    if (use) badges.push({ kind: "use", label: use, title: "Назначение" });
    const method = str(p.auction_method_name_ru);
    if (method) badges.push({ kind: "method", label: method, title: "Способ аукциона" });
    const category = str(p.land_category_name);
    if (category) badges.push({ kind: "category", label: category, title: "Категория земель" });
    return badges;
  },
};

const ADAPTERS: Record<string, LayerAdapter> = {
  free: freeAdapter,
};

export function getLayerAdapter(layerName: string | null | undefined): LayerAdapter {
  if (layerName && ADAPTERS[layerName]) return ADAPTERS[layerName];
  return reqlandAdapter;
}
