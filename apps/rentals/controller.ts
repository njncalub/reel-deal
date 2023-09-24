import { ulid } from "$std/ulid/mod.ts";

import { kv } from "@/utils/db/kv.ts";

import { UserRow } from "@/apps/users/models.ts";
import { MovieRow } from "@/apps/movies/models.ts";

import {
  NewRentalPayload,
  PublicRentalData,
  PublicRentalDataSchema,
  RentalRow,
  RentalRowSchema,
} from "./models.ts";

export async function countAllRentals() {
  const res = await kv.get<Deno.KvU64>(["rentals_count"]);
  const count = res.value?.value ?? 0n;
  return Number(count);
}

export async function countAllRentalsByUserId(userId: string) {
  const res = await kv.get<Deno.KvU64>(["users", userId, "rentals_count"]);
  const count = res.value?.value ?? 0n;
  return Number(count);
}

export function transformToPublicRentalData(
  data: RentalRow | PublicRentalData,
): PublicRentalData {
  const res = PublicRentalDataSchema.safeParse(data);
  if (!res.success) {
    throw new Error("invalid rental data");
  }
  return res.data;
}

export function listRentals(options?: Deno.KvListOptions) {
  return kv.list<RentalRow>({ prefix: ["rentals"] }, options);
}

export function listUserRentalsByUserId(
  userId: string,
  options?: Deno.KvListOptions,
) {
  return kv.list<RentalRow>(
    { prefix: ["users", userId, "current_rentals"] },
    options,
  );
}

export function getRentalById(rentalId: string) {
  return kv.get<RentalRow>(["rentals", rentalId]);
}

export function getUserRentalById(userId: string, rentalId: string) {
  return kv.get<RentalRow>(["users", userId, "current_rentals", rentalId]);
}

export function removeRentalById(id: string) {
  return kv.delete(["rentals", id]);
}

export async function removeUserRentalById(userId: string, rentalId: string) {
  // Get the user and rental to make sure they exist.
  const usersRowKey = ["users", userId];
  const rentalsRowKey = ["rentals", rentalId];
  const userCurrentRentalsRowKey = [
    "users",
    userId,
    "current_rentals",
    rentalId,
  ];
  const userRemovedRentalsRowKey = [
    "users",
    userId,
    "removed_rentals",
    rentalId,
  ];
  const [userRow, rentalsRow] = await kv.getMany<[UserRow, RentalRow]>([
    usersRowKey,
    rentalsRowKey,
  ]);
  if (userRow.value === null) {
    throw new Error(`user ${userId} not found`);
  }
  if (rentalsRow.value === null) {
    throw new Error(`rental ${rentalId} not found`);
  }

  // Get the rented movie.
  const moviesRowKey = ["movies", rentalsRow.value.movieId];
  const moviesRow = await kv.get<MovieRow>(moviesRowKey);
  if (moviesRow.value === null) {
    throw new Error(`movie ${rentalsRow.value.movieId} not found`);
  }

  // Increment the available copies.
  const newMoviesRow: MovieRow = {
    ...moviesRow.value,
    availableCopies: moviesRow.value.availableCopies + 1n,
  };

  // Update the user's rental.
  const newRentalRow: RentalRow = {
    ...rentalsRow.value,
    isReturned: true,
    returnedDate: new Date(),
  };

  const tx = await kv.atomic()
    .check(userRow) // Ensure the user has not been changed since we fetched it.
    .check(rentalsRow) // Ensure the rental has not been changed since we fetched it.
    .check(moviesRow) // Ensure the movie has not been changed since we fetched it.
    .check({ key: userRemovedRentalsRowKey, versionstamp: null }) // Ensure the removed user rental does not already exist.
    .delete(userCurrentRentalsRowKey)
    .set(rentalsRowKey, newRentalRow)
    .set(userRemovedRentalsRowKey, newRentalRow)
    .set(moviesRowKey, newMoviesRow)
    .mutate({
      type: "sum",
      key: ["rentals_count"],
      // NOTE: This is a very hacky way to subtract by one, since using `-1n`
      // directly will throw `RangeError: value must be a positive bigint`.
      value: new Deno.KvU64(0xffffffffffffffffn),
    })
    .mutate({
      type: "sum",
      key: ["users", userId, "current_rentals_count"],
      // NOTE: This is a very hacky way to subtract by one, since using `-1n`
      // directly will throw `RangeError: value must be a positive bigint`.
      value: new Deno.KvU64(0xffffffffffffffffn),
    })
    .commit();

  if (!tx.ok) throw new Error("failed to remove rental");

  return kv.get<PublicRentalData>(rentalsRowKey);
}

export async function createNewRental(
  payload: NewRentalPayload,
): Promise<PublicRentalData> {
  const now = new Date();

  const newRentalRow: RentalRow = {
    ...payload,

    id: ulid(),
    createdAt: now,
    rentalDate: now,
    /** Note: The due date is 7 days from now. */
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    isReturned: false,
  };
  if (!RentalRowSchema.safeParse(newRentalRow).success) {
    throw new Error("invalid rental payload");
  }

  // Get the user and movie to make sure they exist.
  const usersRowKey = ["users", newRentalRow.userId];
  const moviesRowKey = ["movies", newRentalRow.movieId];
  const [userRow, moviesRow] = await kv.getMany<[UserRow, MovieRow]>([
    usersRowKey,
    moviesRowKey,
  ]);
  if (userRow.value === null) {
    throw new Error(`user ${newRentalRow.userId} not found`);
  }
  if (moviesRow.value === null) {
    throw new Error(`movie ${newRentalRow.movieId} not found`);
  }

  // Ensure the movie still has copies available.
  const availableCopies = moviesRow.value.availableCopies;
  if (availableCopies === 0n) {
    throw new Error(`movie ${newRentalRow.movieId} is out of stock`);
  }

  // Decrement the available copies.
  const newMoviesRow: MovieRow = {
    ...moviesRow.value,
    availableCopies: availableCopies - 1n,
  };

  const rentalsRowKey = ["rentals", newRentalRow.id];
  const rentalsCountKey = ["rentals_count"];
  const userRentalsRowKey = [
    "users",
    newRentalRow.userId,
    "current_rentals",
    newRentalRow.id,
  ];
  const userRentalsCountKey = ["users", newRentalRow.userId, "rentals_count"];

  const tx = await kv.atomic()
    .check(moviesRow) // Ensure the movie has not been changed since we fetched it.
    .check({ key: rentalsRowKey, versionstamp: null }) // Ensure the rental does not already exist.
    .check({ key: userRentalsRowKey, versionstamp: null }) // Ensure the user rental does not already exist.
    .set(rentalsRowKey, newRentalRow)
    .set(userRentalsRowKey, newRentalRow)
    .set(moviesRowKey, newMoviesRow)
    .mutate({
      type: "sum",
      key: rentalsCountKey,
      value: new Deno.KvU64(1n),
    })
    .mutate({
      type: "sum",
      key: userRentalsCountKey,
      value: new Deno.KvU64(1n),
    })
    .commit();

  if (!tx.ok) throw new Error("failed to create rental");

  const getRes = await kv.get<PublicRentalData>(rentalsRowKey);
  const rental = getRes.value;

  if (!rental) throw new Error("rental not found");

  return rental;
}

/** NOTE: For debugging purposes only. */
export async function deleteAllRentals() {
  const promises = [];
  const userIdsWithRentals = [];

  for await (
    const { key, value } of kv.list<RentalRow>({ prefix: ["rentals"] })
  ) {
    promises.push(kv.delete(["rentals", key[1] as string]));
    userIdsWithRentals.push(value.userId);
  }
  for (const userId of userIdsWithRentals) {
    for await (
      const { key } of kv.list<RentalRow>({
        prefix: ["users", userId, "current_rentals"],
      })
    ) {
      promises.push(
        kv.delete(["users", userId, "current_rentals", key[3] as string]),
      );
    }
    for await (
      const { key } of kv.list<RentalRow>({
        prefix: ["users", userId, "removed_rentals"],
      })
    ) {
      promises.push(
        kv.delete(["users", userId, "removed_rentals", key[3] as string]),
      );
    }
    for await (
      const { key } of kv.list<RentalRow>({
        prefix: ["users", userId, "rentals"],
      })
    ) {
      promises.push(
        kv.delete(key),
      );
    }
    promises.push(
      kv.set(["users", userId, "current_rentals_count"], new Deno.KvU64(0n)),
    );
    promises.push(
      kv.set(["users", userId, "removed_rentals_count"], new Deno.KvU64(0n)),
    );
  }

  // TODO(njncalub): Increment the available copies of the rented movies.

  promises.push(kv.set(["rentals_count"], new Deno.KvU64(0n)));

  await Promise.all(promises);
}
