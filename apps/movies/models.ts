import { z } from "zod";

import { BaseRowSchema } from "@/apps/base/models.ts";

export const MovieRowSchema = BaseRowSchema.extend({
  title: z.string(),
  genre: z.string(),
  releaseYear: z.number().positive().gte(1895).lte(2100),
  rentalPrice: z.number().nonnegative(),
  availableCopies: z.number().nonnegative(),

  // Extra information:
  imdbUrl: z.string().url().optional(),
  posterUrl: z.string().url().optional(),
});
export type MovieRow = z.infer<typeof MovieRowSchema>;

export const PublicMovieDataSchema = MovieRowSchema.pick({
  id: true,
  title: true,
  genre: true,
  releaseYear: true,
  rentalPrice: true,
  availableCopies: true,
});
export type PublicMovieData = z.infer<typeof PublicMovieDataSchema>;
