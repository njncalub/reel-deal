import { z } from "zod";

import { BaseRowSchema } from "@/apps/base/models.ts";
import { PublicMovieDataSchema } from "@/apps/movies/models.ts";

export const RentalRowSchema = BaseRowSchema.extend({
  userId: z.string().ulid(),
  movieId: z.string().ulid(),
  rentalDate: z.date(),
  dueDate: z.date(),

  // Extra information:
  isReturned: z.boolean().default(false).optional(),
  returnedDate: z.date().optional(),
});
export type RentalRow = z.infer<typeof RentalRowSchema>;

export const PublicRentalDataSchema = RentalRowSchema.pick({
  id: true,
  movieId: true,
  rentalDate: true,
  dueDate: true,
  isReturned: true,
  returnedDate: true,
}).extend({
  movie: PublicMovieDataSchema.optional(),
});
export type PublicRentalData = z.infer<typeof PublicRentalDataSchema>;

export const NewRentalPayloadSchema = RentalRowSchema.pick({
  userId: true,
  movieId: true,
});
export type NewRentalPayload = z.infer<typeof NewRentalPayloadSchema>;
