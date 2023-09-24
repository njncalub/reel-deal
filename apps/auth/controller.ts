import { kv } from "@/utils/db/kv.ts";

import {
  NewTokenPayload,
  PublicTokenData,
  PublicTokenDataSchema,
  TokenRow,
  TokenRowSchema,
} from "./models.ts";

export function getTokenById(id: string) {
  return kv.get<TokenRow>(["tokens", id]);
}

export function transformToPublicTokenData(
  data: TokenRow | PublicTokenData,
): PublicTokenData {
  const res = PublicTokenDataSchema.safeParse(data);
  if (!res.success) {
    throw new Error("invalid token data");
  }
  return res.data;
}

export async function saveToken(
  payload: NewTokenPayload,
): Promise<TokenRow> {
  const now = new Date();

  const newTokenRow: TokenRow = {
    ...payload,
    createdAt: now,
  };
  if (!TokenRowSchema.safeParse(newTokenRow).success) {
    throw new Error("invalid token data");
  }

  const tokensKey = ["tokens", newTokenRow.token];
  const tx = await kv.atomic()
    .check({ key: tokensKey, versionstamp: null })
    .set(tokensKey, newTokenRow)
    .commit();

  if (!tx.ok) throw new Error("failed to save token");

  const getRes = await kv.get<TokenRow>(tokensKey);
  const token = getRes.value;

  if (!token) throw new Error("token not found");

  return token;
}

export function deleteTokenById(id: string) {
  return kv.delete(["tokens", id]);
}

export async function deleteAllTokens() {
  const allTokensIter = kv.list<TokenRow>({ prefix: ["tokens"] });

  const promises = [];
  for await (const { key } of allTokensIter) {
    promises.push(kv.delete(["tokens", key[1] as string]));
  }

  await Promise.all(promises);
}
