import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import {
  RefreshTokenPayload,
  RefreshTokenPayloadSchema,
  RefreshTokenResponse,
} from "@/apps/auth/models.ts";
import { refreshAccessToken } from "@/apps/auth/service.ts";

export const handler: MethodHandler<RefreshTokenResponse> = {
  async POST(req) {
    const form = await req.json();
    const rawPayload = RefreshTokenPayloadSchema.safeParse(form);
    if (!rawPayload.success) {
      return Response.json({
        errors: rawPayload.error.issues,
      }, {
        status: Status.BadRequest,
      });
    }
    const payload: RefreshTokenPayload = rawPayload.data;

    const resp = await refreshAccessToken(payload.refreshToken);
    return Response.json(resp);
  },
};
