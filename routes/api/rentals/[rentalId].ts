import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import { PublicRentalData } from "@/apps/rentals/models.ts";
import {
  getUserRentalById,
  removeUserRentalById,
  transformToPublicRentalData,
} from "@/apps/rentals/controller.ts";

import { State } from "./_middleware.ts";

export const handler: MethodHandler<
  PublicRentalData | PublicRentalData[],
  State
> = {
  async GET(_req, ctx) {
    const userId = ctx.state.userId;
    const res = await getUserRentalById(userId, ctx.params.rentalId);
    const rental = res.value;
    if (res === null || rental === null) {
      return Response.json({
        errors: [
          {
            message: "rental not found",
          },
        ],
      }, {
        status: Status.NotFound,
      });
    }

    return Response.json(transformToPublicRentalData(rental));
  },
  async DELETE(_req, ctx) {
    const userId = ctx.state.userId;
    const res = await removeUserRentalById(userId, ctx.params.rentalId);
    const rental = res.value;
    if (res === null || rental === null) {
      return Response.json({
        errors: [
          {
            message: "rental not found",
          },
        ],
      }, {
        status: Status.NotFound,
      });
    }

    return Response.json(rental, { status: Status.OK });
  },
};
