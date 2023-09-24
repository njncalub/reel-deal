import { ulid } from "$std/ulid/mod.ts";

import { compare, hash } from "@/utils/auth/bcrypt.ts";
import { kv } from "@/utils/db/kv.ts";

import {
  NewUserPayload,
  PublicUserData,
  PublicUserDataSchema,
  UserRow,
  UserRowSchema,
} from "./models.ts";

export async function loginUsingEmailAndPassword(
  email: string,
  password: string,
): Promise<PublicUserData> {
  const res = await kv.get<UserRow>(["users_by_email", email]);
  const user = res.value;
  if (!user) throw new Error("user not found");

  const passwordMatch = await compare(password, user.hashedPassword);
  if (!passwordMatch) throw new Error("invalid password");

  return transformToPublicUserData(user);
}

export async function countAllUsers() {
  const res = await kv.get<Deno.KvU64>(["users_count"]);
  const count = res.value?.value ?? 0n;
  return Number(count);
}

export function transformToPublicUserData(
  data: UserRow | PublicUserData,
): PublicUserData {
  const res = PublicUserDataSchema.safeParse(data);
  if (!res.success) {
    throw new Error(
      `invalid user data: ${res.error}, ${JSON.stringify(data)}}`,
    );
  }
  return res.data;
}

export function listUsers(options?: Deno.KvListOptions) {
  return kv.list<UserRow>({ prefix: ["users"] }, options);
}

export function getUserById(id: string) {
  return kv.get<UserRow>(["users", id]);
}

export function getUserByEmail(email: string) {
  return kv.get<UserRow>(["users", email]);
}

export async function createNewUser(
  payload: NewUserPayload,
): Promise<PublicUserData> {
  const newUserRow: UserRow = {
    id: ulid(),
    createdAt: new Date(),
    email: payload.email,
    name: payload.name,
    isAdmin: false,
    hashedPassword: await hash(payload.password),
  };
  if (!UserRowSchema.safeParse(newUserRow).success) {
    throw new Error(`invalid user payload`);
  }

  const usersKey = ["users", newUserRow.id];
  // Due to limitations by Deno KV, we need to maintain a list of unique emails
  // in order to check if a user already exists with the same email.
  // See: https://docs.deno.com/kv/manual/secondary_indexes
  const usersByEmailKey = ["users_by_email", newUserRow.email];
  // We also need to keep track of the total number of users in order to
  // count the number of users in the database.
  const usersCountKey = ["users_count"];
  const tx = await kv.atomic()
    .check({ key: usersKey, versionstamp: null })
    .check({ key: usersByEmailKey, versionstamp: null })
    .set(usersKey, newUserRow)
    .set(usersByEmailKey, newUserRow)
    .mutate({
      type: "sum",
      key: usersCountKey,
      value: new Deno.KvU64(1n),
    })
    .commit();

  if (!tx.ok) throw new Error("failed to create user");

  const getRes = await kv.get<PublicUserData>(usersKey);
  const user = getRes.value;

  if (!user) throw new Error("user not found");

  return user;
}

/** NOTE: For debugging purposes only. */
export async function deleteAllUsers() {
  const allUsersIter = kv.list<UserRow>({ prefix: ["users"] });
  const allUsersByEmailIter = kv.list<UserRow>({ prefix: ["users_by_email"] });

  const promises = [];
  for await (const { key } of allUsersIter) {
    promises.push(kv.delete(["users", key[1] as string]));
  }
  for await (const { key } of allUsersByEmailIter) {
    promises.push(kv.delete(["users_by_email", key[1] as string]));
  }
  promises.push(kv.delete(["users_count"]));

  await Promise.all(promises);
}
