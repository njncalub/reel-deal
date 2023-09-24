import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import { PublicMovieData } from "@/apps/movies/models.ts";
import {
  getMovieById,
  transformToPublicMovieData,
} from "@/apps/movies/controller.ts";

export const handler: MethodHandler<PublicMovieData | PublicMovieData[]> = {
  async GET(_req, ctx) {
    const res = await getMovieById(ctx.params.movieId);
    const movie = res.value;
    if (res === null || movie === null) {
      return Response.json({
        errors: [
          {
            message: "movie not found",
          },
        ],
      }, {
        status: Status.NotFound,
      });
    }

    return Response.json(transformToPublicMovieData(movie));
  },
};
