import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import { PublicUserData } from "@/apps/users/models.ts";
import {
  getUserById,
  transformToPublicUserData,
} from "@/apps/users/controller.ts";

export const handler: MethodHandler<PublicUserData | PublicUserData[]> = {
  async GET(_req, ctx) {
    const res = await getUserById(ctx.params.userId);
    const user = res.value;
    if (res === null || user === null) {
      return Response.json({
        errors: [
          {
            message: "user not found",
          },
        ],
      }, {
        status: Status.NotFound,
      });
    }

    // TODO(njncalub): Add more properties if the user owns the account.

    return Response.json(transformToPublicUserData(user));
  },
};
