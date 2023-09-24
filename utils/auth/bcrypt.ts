// File originally from:
// https://github.com/JamesBroadberry/deno-bcrypt/issues/26#issue-1137157761
// https://github.com/JamesBroadberry/deno-bcrypt/issues/26#issuecomment-1509979258

import {
  compare as comparePromise,
  compareSync,
  hash as hashPromise,
  hashSync,
} from "bcrypt";

export const isRunningInDenoDeploy = Deno.env.get("IN_PRODUCTION") === "true";

export const hash: typeof hashPromise = isRunningInDenoDeploy
  ? (plaintext: string, salt: string | undefined = undefined) =>
    new Promise((res) => res(hashSync(plaintext, salt)))
  : hashPromise;

export const compare: typeof comparePromise = isRunningInDenoDeploy
  ? (plaintext: string, hash: string) =>
    new Promise((res) => res(compareSync(plaintext, hash)))
  : comparePromise;
