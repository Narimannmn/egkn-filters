import { useSuspenseQuery, type QueryKey } from "@tanstack/react-query";

export function suspenseQuery<T>(key: QueryKey, fn: () => Promise<T>): T {
  return useSuspenseQuery({ queryKey: key, queryFn: fn }).data;
}
