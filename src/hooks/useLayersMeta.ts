import { suspenseQuery } from "../lib/queries";
import { fetchLayersMeta } from "../lib/layersMeta";

export const useLayersMeta = () =>
  suspenseQuery(["layersMeta"], fetchLayersMeta);
