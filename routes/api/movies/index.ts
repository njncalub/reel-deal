import { Handlers as MethodHandler } from "$fresh/server.ts";

import { PublicMovieData } from "@/apps/movies/models.ts";
import {
  countAllMovies,
  deleteAllMovies,
  listMovies,
  transformToPublicMovieData,
} from "@/apps/movies/controller.ts";
import { getPaginationParams } from "@/utils/http/pagination.ts";
import { collectValues } from "@/utils/db/kv.ts";
import { guardDebugMode } from "@/utils/auth/checkDebugMode.ts";

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
  async DELETE(req) {
    // NOTE: Only used for debugging purposes.
    const err = guardDebugMode(req);
    if (err) return err;

    await deleteAllMovies();

    return Response.json({
      message: "all movies deleted",
    });
  },
};
