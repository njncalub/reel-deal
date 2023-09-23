import {
  decode as decodeBase64url,
  encode as encodeBase64url,
} from "$std/encoding/base64url.ts";

import { create, Header, Payload, verify } from "djwt";

import { TokenType } from "./models.ts";

export async function generateKey() {
  const key = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );

  const rawKey = await crypto.subtle.exportKey("raw", key);
  return encodeBase64url(rawKey);
}

export async function loadKey() {
  const secretKeyString: string = Deno.env.get("SECRET_KEY") ?? "";
  const keyBuffer = decodeBase64url(secretKeyString);

  return await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
}

export async function getToken(
  exp: number,
  sub: string,
): Promise<string> {
  const now = Date.now();
  const header: Header = {
    alg: "HS512",
    typ: "JWT",
  };
  // See: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
  const payload: Payload = {
    iss: "reel-deal",
    iat: now,
    sub,
    exp,
  };

  const key = await loadKey();

  return create(header, payload, key);
}

export async function getJwtPayload(
  token: string,
  type: TokenType = "access_token",
): Promise<Payload | Error> {
  try {
    const key = await loadKey();
    return await verify(token, key);
  } catch {
    const tokenType = (type === "access_token")
      ? "access_token"
      : "refresh_token";

    throw new Error(`${tokenType} is invalid`);
  }
}
