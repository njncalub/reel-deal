import { z } from "zod";

import { BaseRowSchema } from "@/apps/base/models.ts";

export const UserRowSchema = BaseRowSchema.extend({
  email: z.string().email(),
  name: z.string(),

  // Extra information:
  /** Specifies if the user is an administrator. */
  isAdmin: z.boolean().default(false),
  /** Used for saving the user's hashed password to the database. */
  hashedPassword: z.string(),
});
export type UserRow = z.infer<typeof UserRowSchema>;

export const PublicUserDataSchema = UserRowSchema.pick({
  id: true,
  name: true,
});
export type PublicUserData = z.infer<typeof PublicUserDataSchema>;

export const NewUserPayloadSchema = UserRowSchema.pick({
  email: true,
  name: true,
}).extend({
  /** Used for creating a new user. Must specify a valid password. */
  password: z.string().min(8).max(100).regex(
    // From: https://www.section.io/engineering-education/password-strength-checker-javascript/
    new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])"),
    "Your password should have at least one uppercase letter, one lowercase letter, one number, and one special character.",
  ),
}).strict();
export type NewUserPayload = z.infer<typeof NewUserPayloadSchema>;
