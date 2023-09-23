import { Payload } from "djwt";

import { PublicUserData } from "@/apps/users/models.ts";

import {
  LoginResponse,
  RefreshTokenResponse,
  TokenRow,
  TokenType,
} from "./models.ts";
import { getJwtPayload, getToken } from "./utils.ts";
import {
  getTokenById,
  removeTokenById,
  saveToken,
} from "@/apps/auth/controller.ts";
import { getUserById } from "@/apps/users/controller.ts";

export async function generateLoginTokens(
  user: PublicUserData,
): Promise<LoginResponse> {
  if (!user) {
    throw new Error(`user is invalid`);
  }

  const now = Date.now();

  const JWT_ACCESS_TOKEN_EXP =
    Number(Deno.env.get("JWT_ACCESS_TOKEN_EXP") ?? "3600") ?? 3600;
  const accessTokenExpires = now + (JWT_ACCESS_TOKEN_EXP * 1000);
  const accessToken = await getToken(accessTokenExpires, user.id);

  const JWT_REFRESH_TOKEN_EXP =
    Number(Deno.env.get("JWT_REFRESH_TOKEN_EXP") ?? "1800") ?? 1800;
  const refreshTokenExpires = now + (JWT_REFRESH_TOKEN_EXP * 1000);
  const refreshToken = await getToken(refreshTokenExpires, user.id);

  await saveToken({
    token: refreshToken,
    userId: user.id,
    expires: new Date(refreshTokenExpires),
    type: "refresh_token",
    blacklisted: false,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
    },
    tokens: {
      access: {
        type: "access_token",
        token: accessToken,
        expires: new Date(accessTokenExpires),
      },
      refresh: {
        type: "refresh_token",
        token: refreshToken,
        expires: new Date(refreshTokenExpires),
      },
    },
  };
}

export async function verifyToken(
  token: string,
  type: TokenType,
): Promise<TokenRow> {
  const payloadOrErr = await getJwtPayload(token, type);
  if (payloadOrErr instanceof Error) {
    throw payloadOrErr;
  }
  const payload: Payload = payloadOrErr;
  const res = await getTokenById(token);
  const tokenRow = res.value;
  if (res === null || tokenRow === null) {
    throw new Error(`invalid token`);
  }

  const userMatch = payload.sub === tokenRow.userId;
  const typeMatch = tokenRow.type === type;
  const blacklisted = tokenRow.blacklisted;
  if (!userMatch || !typeMatch || blacklisted) {
    throw new Error(`invalid token`);
  }

  return tokenRow;
}

export async function refreshAccessToken(
  token: string,
): Promise<RefreshTokenResponse> {
  // Verify if the refresh token is valid.
  let refreshToken: TokenRow;
  try {
    refreshToken = await verifyToken(
      token,
      "refresh_token",
    );
  } catch (error) {
    throw error;
  }

  // Get the user from the refresh token.
  const resUser = await getUserById(refreshToken.userId);
  const user = resUser.value;
  if (resUser === null || user === null) {
    throw new Error(`user not found`);
  }

  // Remove the refresh token from the database.
  await removeTokenById(refreshToken.token);

  // Generate new access and refresh tokens.
  return await generateLoginTokens(user);
}
