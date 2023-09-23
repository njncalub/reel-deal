import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import {
  NewUserPayload,
  NewUserPayloadSchema,
  PublicUserData,
} from "@/apps/users/models.ts";
import {
  countAllUsers,
  createNewUser,
  deleteAllUsers,
  listUsers,
  transformToPublicUserData,
} from "@/apps/users/controller.ts";
import { getPaginationParams } from "@/utils/http/pagination.ts";
import { collectValues } from "@/utils/db/kv.ts";

export const handler: MethodHandler<PublicUserData | PublicUserData[]> = {
  async POST(req) {
    const form = await req.json();
    const res = NewUserPayloadSchema.safeParse(form);
    if (!res.success) {
      return Response.json({
        errors: res.error.issues,
      }, {
        status: Status.BadRequest,
      });
    }
    const payload: NewUserPayload = res.data;

    let user: PublicUserData;
    try {
      user = await createNewUser(payload);
    } catch {
      return Response.json({
        errors: [
          {
            message:
              "encountered an error while creating a new user, make sure that the email is unique",
          },
        ],
      }, {
        status: Status.BadRequest,
      });
    }

    return Response.json(transformToPublicUserData(user));
  },
  async GET(req) {
    const url = new URL(req.url);
    const params = getPaginationParams(url);
    const iter = listUsers({
      ...params,
    });
    const results = await collectValues(iter, transformToPublicUserData);
    const count = await countAllUsers();

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
    await deleteAllUsers();

    return Response.json({
      message: "all users deleted",
    });
  },
};
