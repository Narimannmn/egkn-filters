import { suspenseQuery } from "../lib/queries";
import { fetchRegions } from "../lib/districtsMeta";

export const useRegions = () => suspenseQuery(["regions"], fetchRegions);
