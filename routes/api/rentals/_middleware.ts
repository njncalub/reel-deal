import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import { extractJwt } from "@/utils/auth/extractJwt.ts";
import { getJwtPayload } from "@/apps/auth/utils.ts";

export interface State {
  userId: string;
}

export const handler = [
  async function checkAuthorizationHeader(
    req: Request,
    ctx: MiddlewareHandlerContext<State>,
  ) {
    const authHeader = req.headers.get("Authorization");
    const jwt = extractJwt(authHeader);

    if (jwt === null) {
      return Response.json({
        errors: [
          {
            message: "`Authorization` header is missing or invalid",
          },
        ],
      }, {
        status: Status.Unauthorized,
      });
    }

    const payload = await getJwtPayload(jwt, "access_token");
    if (payload instanceof Error || payload.sub === undefined) {
      return Response.json({
        errors: [
          {
            message: "invalid token",
          },
        ],
      }, {
        status: Status.Unauthorized,
      });
    }

    ctx.state.userId = payload.sub;

    return ctx.next();
  },
];
