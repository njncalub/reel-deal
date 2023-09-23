import { z } from "zod";

import { BaseRowSchema } from "@/apps/base/models.ts";

export const RentalSchema = BaseRowSchema.extend({
  userId: z.string().ulid(),
  movieId: z.string().ulid(),
  rentalDate: z.date(),
  dueDate: z.date(),

  // Extra information:
  isReturned: z.boolean().default(false).optional(),
});
export type Rental = z.infer<typeof RentalSchema>;
