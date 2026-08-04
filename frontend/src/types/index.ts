import { z } from 'zod';

export const RoleEnum = z.enum(['CUSTOMER', 'STORE_OWNER', 'DRIVER', 'ADMIN']);
export type Role = z.infer<typeof RoleEnum>;

export const LoginIntentEnum = z.enum(['login', 'signup']);
export type LoginIntent = z.infer<typeof LoginIntentEnum>;

export const SendOtpSchema = z.object({
  phone: z.string().min(10),
  role: RoleEnum,
  intent: LoginIntentEnum,
});
export type SendOtpRequest = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  sessionId: z.string().uuid(),
  role: RoleEnum,
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpSchema>;

// Add more shared schemas as needed
