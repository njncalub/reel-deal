import { z } from "zod";

import { BaseRowSchema } from "@/apps/base/models.ts";

export const MovieRowSchema = BaseRowSchema.extend({
  title: z.string(),
  genre: z.array(z.string()),
  releaseYear: z.number().positive().gte(1895).lte(2100),
  rentalPrice: z.number().nonnegative(),
  /**
   * We are using a bigint here due to Deno KV requiring bigints if we want to
   * update them inside a transaction.
   * @see https://docs.deno.com/kv/manual/operations#sum
   * @see https://deno.land/api@v1.37.0?s=Deno.KvU64&unstable=
   */
  availableCopies: z.preprocess(
    (value) => BigInt(value as number),
    z.bigint().nonnegative(),
  ),

  // Extra information:
  synopsis: z.string().optional(),
  imdbUrl: z.string().url().optional(),
});
export type MovieRow = z.infer<typeof MovieRowSchema>;

export const PublicMovieDataSchema = MovieRowSchema.pick({
  id: true,
  title: true,
  genre: true,
  releaseYear: true,
  rentalPrice: true,
}).extend({
  /** Converts the bigint value back to a number. */
  availableCopies: z.preprocess(
    (value) => Number(value as bigint),
    z.number().nonnegative(),
  ),
});
export type PublicMovieData = z.infer<typeof PublicMovieDataSchema>;

export const NewMoviePayloadSchema = MovieRowSchema.pick({
  title: true,
  genre: true,
  releaseYear: true,
  rentalPrice: true,
  availableCopies: true,
  synopsis: true,
  imdbUrl: true,
});
export type NewMoviePayload = z.infer<typeof NewMoviePayloadSchema>;
