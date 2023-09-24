import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import {
  NewMoviePayload,
  NewMoviePayloadSchema,
  PublicMovieData,
} from "@/apps/movies/models.ts";
import {
  countAllMovies,
  deleteAllMovies,
  listMovies,
  transformToPublicMovieData,
} from "@/apps/movies/controller.ts";
import { getPaginationParams } from "@/utils/http/pagination.ts";
import { collectValues } from "@/utils/db/kv.ts";

export const handler: MethodHandler<PublicMovieData | PublicMovieData[]> = {
  async GET(req) {
    const url = new URL(req.url);
    const params = getPaginationParams(url);
    const iter = listMovies({
      ...params,
    });
    const results = await collectValues(iter, transformToPublicMovieData);
    const count = await countAllMovies();

    return Response.json({
      results,
      count,
      limit: params.limit,
      reverse: params.reverse,
      cursor: iter.cursor,
    });
  },
  async DELETE() {
    // Only used for debugging purposes.
    await deleteAllMovies();

    return Response.json({
      message: "all movies deleted",
    });
  },
};
