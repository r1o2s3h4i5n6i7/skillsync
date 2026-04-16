// ─── Auth Types ───────────────────────────────────────
// Shared between server-side API routes and client-side components

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  city: string;
  xp: number;
  level: number;
  streak: number;
  coins: number;
  joinedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: SessionUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "STUDENT" | "TEACHER";
}

export interface RegisterResponse {
  user: Pick<SessionUser, "id" | "name" | "email" | "role">;
}

export interface MeResponse {
  user: SessionUser | null;
}

export interface LogoutResponse {
  success: boolean;
}

/**
 * Returns the avatar image path for a given role.
 * Falls back to the role-based default image.
 */
export function getAvatarPath(role: UserRole): string {
  return `/avatars/${role.toLowerCase()}.png`;
}
