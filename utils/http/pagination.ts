export interface PaginationParams {
  /**
   * Due to limitations in Deno KV, we cannot simly use a numbered `offset` to
   * paginate. Instead, we need to use an iterator `cursor`.
   */
  cursor?: string;
  /** The maximum number of items to return. */
  limit?: number;
  /** Whether to return the items in reverse order. */
  reverse?: boolean;
}

export const DEFAULT_LIMIT = 25;

export function getPaginationParams(url: URL): PaginationParams {
  const parsedLimit = Number(url.searchParams.get("limit"));

  const params: PaginationParams = {
    cursor: url.searchParams.get("cursor") ?? "",
    limit: (Number.isNaN(parsedLimit) || parsedLimit < 1)
      ? DEFAULT_LIMIT
      : parsedLimit,
    reverse: url.searchParams.get("reverse") === "true",
  };
  return params;
}
