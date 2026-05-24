import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  setActiveDistrict,
  type ActiveDistrict,
  type District,
  type Region,
} from "../lib/districtsMeta";
import { getErrorMessage } from "../lib/errors";

export interface DistrictSelection {
  regionCode: string | null;
  districtCode: string | null;
  setting: boolean;
  error: string | null;
  select(region: Region, district: District): void;
}

export function useDistrictSelection(
  regions: Region[],
  initial: ActiveDistrict | null,
): DistrictSelection {
  const queryClient = useQueryClient();
  const [regionCode, setRegionCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);
  const [setting, setSetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedInitial, setAppliedInitial] = useState(false);

  useEffect(() => {
    if (appliedInitial) return;
    if (!initial) {
      setAppliedInitial(true);
      return;
    }
    const region = regions.find((r) => r.code === initial.regionCode);
    const district = region?.districts.find(
      (d) => d.code === initial.districtCode,
    );
    if (region && district) {
      setRegionCode(region.code);
      setDistrictCode(district.code);
    }
    setAppliedInitial(true);
  }, [initial, regions, appliedInitial]);

  const select = (region: Region, district: District) => {
    setRegionCode(region.code);
    setDistrictCode(district.code);
    setError(null);
    setSetting(true);
    queryClient.removeQueries({ queryKey: ["layer"] });
    setActiveDistrict(district.code)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setSetting(false));
  };

  return { regionCode, districtCode, setting, error, select };
}
