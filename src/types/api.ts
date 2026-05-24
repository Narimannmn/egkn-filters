export interface EgknProperty {
  id: string;
  address_ru: string | null;
  placedesc_ru: string | null;
  shape_area: number | null;
  usedesc_ru: string | null;
  right_type_name_ru: string | null;
  land_status_name_ru: string | null;
  request_date: string | null;
  [key: string]: unknown;
}

export interface EgknItem {
  id: string;
  geometry: string;
  properties: EgknProperty;
  _layerName?: string;
}

export interface EgknResponse {
  req: EgknItem[];
  count: number;
}
