import { ulid } from "$std/ulid/mod.ts";

import { kv } from "@/utils/db/kv.ts";

import {
  MovieRow,
  MovieRowSchema,
  NewMoviePayload,
  PublicMovieData,
  PublicMovieDataSchema,
} from "./models.ts";

export async function countAllMovies() {
  const res = await kv.get<Deno.KvU64>(["movies_count"]);
  const count = res.value?.value ?? 0n;
  return Number(count);
}

export function transformToPublicMovieData(
  data: MovieRow | PublicMovieData,
): PublicMovieData {
  const res = PublicMovieDataSchema.safeParse(data);
  if (!res.success) {
    throw new Error("invalid movie data");
  }
  return res.data;
}

export function listMovies(options?: Deno.KvListOptions) {
  return kv.list<MovieRow>({ prefix: ["movies"] }, options);
}

export function getMovieById(id: string) {
  return kv.get<MovieRow>(["movies", id]);
}

export function removeMovieById(id: string) {
  return kv.delete(["movies", id]);
}

export async function createNewMovie(
  payload: NewMoviePayload,
): Promise<PublicMovieData> {
  const newMovieRow: MovieRow = {
    id: ulid(),
    createdAt: new Date(),
    ...payload,
  };
  if (!MovieRowSchema.safeParse(newMovieRow).success) {
    throw new Error("invalid movie payload");
  }

  const moviesKey = ["movies", newMovieRow.id];
  const moviesCountKey = ["movies_count"];
  const tx = await kv.atomic()
    .check({ key: moviesKey, versionstamp: null })
    .set(moviesKey, newMovieRow)
    .mutate({
      type: "sum",
      key: moviesCountKey,
      value: new Deno.KvU64(1n),
    })
    .commit();

  if (!tx.ok) throw new Error("failed to create movie");

  const getRes = await kv.get<PublicMovieData>(moviesKey);
  const movie = getRes.value;

  if (!movie) throw new Error("movie not found");

  return movie;
}

export async function deleteAllMovies() {
  const allMoviesIter = kv.list<MovieRow>({ prefix: ["movies"] });

  const promises = [];
  for await (const { key } of allMoviesIter) {
    promises.push(kv.delete(["movies", key[1] as string]));
  }
  promises.push(kv.set(["movies_count"], new Deno.KvU64(0n)));
}
