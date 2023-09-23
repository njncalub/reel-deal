import { z } from "zod";

import {
  NewUserPayloadSchema,
  PublicUserDataSchema,
} from "@/apps/users/models.ts";

export type TokenType = "access_token" | "refresh_token";

export const TokenRowSchema = z.object({
  token: z.string(),
  userId: z.string().ulid(),
  type: z.enum(["access_token", "refresh_token"]),
  expires: z.date(),
  blacklisted: z.boolean(),
  createdAt: z.date(),
});
export type TokenRow = z.infer<typeof TokenRowSchema>;

export const NewTokenPayloadSchema = TokenRowSchema.pick({
  token: true,
  userId: true,
  type: true,
  expires: true,
  blacklisted: true,
});
export type NewTokenPayload = z.infer<typeof NewTokenPayloadSchema>;

export const PublicTokenDataSchema = TokenRowSchema.pick({
  token: true,
  type: true,
  expires: true,
});
export type PublicTokenData = z.infer<typeof PublicTokenDataSchema>;

export const LoginPayloadSchema = NewUserPayloadSchema.pick({
  email: true,
  password: true,
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const LoginResponseSchema = z.object({
  user: PublicUserDataSchema,
  tokens: z.object({
    access: PublicTokenDataSchema,
    refresh: PublicTokenDataSchema,
  }),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RefreshTokenPayloadSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

export const RefreshTokenResponseSchema = z.object({
  user: PublicUserDataSchema,
  tokens: z.object({
    access: PublicTokenDataSchema,
    refresh: PublicTokenDataSchema,
  }),
});
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
