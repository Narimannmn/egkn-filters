import { suspenseQuery } from "../lib/queries";
import { fetchActiveDistrict } from "../lib/districtsMeta";

export const useActiveDistrict = () =>
  suspenseQuery(["activeDistrict"], fetchActiveDistrict);
