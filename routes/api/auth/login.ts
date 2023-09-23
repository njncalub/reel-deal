import { Handlers as MethodHandler } from "$fresh/server.ts";
import { Status } from "$std/http/http_status.ts";

import {
  LoginPayload,
  LoginPayloadSchema,
  LoginResponse,
} from "@/apps/auth/models.ts";
import { PublicUserData } from "@/apps/users/models.ts";
import { loginUsingEmailAndPassword } from "@/apps/users/controller.ts";
import { generateLoginTokens } from "@/apps/auth/service.ts";

export const handler: MethodHandler<LoginResponse> = {
  async POST(req) {
    const form = await req.json();
    const rawPayload = LoginPayloadSchema.safeParse(form);
    if (!rawPayload.success) {
      return Response.json({
        errors: rawPayload.error.issues,
      }, {
        status: Status.BadRequest,
      });
    }
    const payload: LoginPayload = rawPayload.data;

    let user: PublicUserData;
    try {
      user = await loginUsingEmailAndPassword(payload.email, payload.password);
    } catch (error) {
      return Response.json({
        errors: [{ message: error.message }],
      }, {
        status: Status.Unauthorized,
      });
    }

    const resp = await generateLoginTokens(user);
    return Response.json(resp);
  },
};
