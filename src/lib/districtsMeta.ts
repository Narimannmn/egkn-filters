const LIST_ENDPOINT = "https://map.gov4c.kz/egkn/rest/map/districts?lang=ru";
const SET_ENDPOINT = "https://map.gov4c.kz/egkn/rest/map/district";
const LOGIN_ENDPOINT = "https://map.gov4c.kz/egkn/rest/cabinet/login";

export interface ActiveDistrict {
  regionCode: string;
  districtCode: string;
}

interface LoginResponse {
  district?: {
    code?: string;
    regionCode?: string;
  };
}

export async function fetchActiveDistrict(): Promise<ActiveDistrict | null> {
  const res = await fetch(LOGIN_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as LoginResponse;
  const d = data.district;
  if (!d || !d.code || !d.regionCode) return null;
  return { regionCode: d.regionCode, districtCode: d.code };
}

export interface District {
  code: string;
  nameRu: string;
  type: string;
}

export interface Region {
  code: string;
  nameRu: string;
  districts: District[];
}

interface RawDistrict {
  code: string;
  nameRu: string;
  type: string;
}

interface RawRegion {
  code: string;
  nameRu: string;
  districts?: RawDistrict[];
}

export async function fetchRegions(): Promise<Region[]> {
  const res = await fetch(LIST_ENDPOINT, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = (await res.json()) as RawRegion[];
  return raw.map((r) => ({
    code: r.code,
    nameRu: r.nameRu,
    districts: (r.districts ?? [])
      .filter((d) => d.type && d.type.startsWith("р-н"))
      .map((d) => ({ code: d.code, nameRu: d.nameRu, type: d.type })),
  }));
}

export async function setActiveDistrict(code: string): Promise<void> {
  const url = `${SET_ENDPOINT}?code=${encodeURIComponent(code)}`;
  const res = await fetch(url, {
    method: "PUT",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
