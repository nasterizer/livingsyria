import { useQuery, type UseQueryOptions, type UseQueryResult, type QueryKey } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export type NewsSources200 = { data: string[] };

export const getListNewsSourcesUrl = () => `/api/news/sources`;

export const listNewsSources = async (options?: RequestInit): Promise<NewsSources200> =>
  customFetch<NewsSources200>(getListNewsSourcesUrl(), { ...options, method: "GET" });

export const getListNewsSourcesQueryKey = () =>
  [getListNewsSourcesUrl()] as const;

export function useListNewsSources<
  TData = NewsSources200,
  TError = unknown,
>(options?: {
  query?: UseQueryOptions<NewsSources200, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getListNewsSourcesQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    listNewsSources({ signal });

  const query = useQuery({
    queryKey,
    queryFn,
    ...options?.query,
  }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryKey;
  return query;
}
