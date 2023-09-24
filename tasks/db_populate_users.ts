#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --unstable

import "$std/dotenv/load.ts";

import { countAllUsers, createNewUser } from "@/apps/users/controller.ts";
import {
  NewUserPayload,
  NewUserPayloadSchema,
  PublicUserData,
} from "@/apps/users/models.ts";
import { extractDataFromFile } from "@/utils/files/extractDataFromFile.ts";

try {
  console.log("Populating users from seed data...");

  const users = await extractDataFromFile<NewUserPayload, NewUserPayload>(
    "./seed/users.yaml",
    (item) => {
      const res = NewUserPayloadSchema.safeParse(item);
      if (!res.success) {
        console.log({
          message: "invalid user payload",
          errors: res.error,
        });
      }
      return res.success;
    },
    (user) => user,
  );

  if (users instanceof Error) {
    console.log(users.message);
    Deno.exit(1);
  }

  const promises: Promise<PublicUserData>[] = [];
  for (const user of users) {
    console.log(
      `Inserting: User ${user.name} (${user.email})`,
    );

    promises.push(createNewUser(user));
  }

  await Promise.all(promises);

  const count = await countAllUsers();
  console.log(`Database now has ${count} user(s)`);
} catch (e) {
  console.error(e);
}
