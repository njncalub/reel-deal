import { z } from "zod";

/** The basic properties for a single row in a database table. */
export const BaseRowSchema = z.object({
  /**
   * Uses ULID (Universally Unique Lexicographically Sortable Identifier).
   * @see https://github.com/ulid/spec
   */
  id: z.string().ulid(),
  /** The date and time when the item was created. */
  createdAt: z.date(),
});
