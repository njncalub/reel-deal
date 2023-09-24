import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import {
  NewRentalPayload,
  NewRentalPayloadSchema,
  PublicRentalData,
} from "@/apps/rentals/models.ts";
import {
  countAllRentalsByUserId,
  createNewRental,
  deleteAllRentals,
  listUserRentalsByUserId,
  transformToPublicRentalData,
} from "@/apps/rentals/controller.ts";
import { getPaginationParams } from "@/utils/http/pagination.ts";
import { collectValues } from "@/utils/db/kv.ts";

import { State } from "./_middleware.ts";

export const handler: MethodHandler<
  PublicRentalData | PublicRentalData[],
  State
> = {
  async POST(req, ctx) {
    const form = await req.json();
    const res = NewRentalPayloadSchema.safeParse(form);
    if (!res.success) {
      return Response.json({
        errors: res.error.issues,
      }, {
        status: Status.BadRequest,
      });
    }
    const payload: NewRentalPayload = res.data;

    const userId = ctx.state.userId;
    if (payload.userId !== userId) {
      return Response.json({
        errors: [
          {
            message:
              "userId in the payload does not match the userId in the access token",
          },
        ],
      }, {
        status: Status.Unauthorized,
      });
    }

    let rental: PublicRentalData;
    try {
      rental = await createNewRental(payload);
    } catch {
      return Response.json({
        errors: [
          {
            message: "encountered an error while creating a new rental",
          },
        ],
      }, {
        status: Status.BadRequest,
      });
    }

    return Response.json(transformToPublicRentalData(rental));
  },
  async GET(req, ctx) {
    const userId = ctx.state.userId;
    const url = new URL(req.url);
    const params = getPaginationParams(url);

    const iter = listUserRentalsByUserId(
      userId,
      {
        ...params,
      },
    );
    const results = await collectValues(iter, transformToPublicRentalData);
    const count = await countAllRentalsByUserId(userId);

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
    await deleteAllRentals();

    return Response.json({
      message: "all rentals deleted",
    });
  },
};
