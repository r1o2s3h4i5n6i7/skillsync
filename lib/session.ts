import { cookies } from "next/headers";
import type { SessionUser } from "@/types/auth";

export type { SessionUser } from "@/types/auth";

const COOKIE_NAME = "skillsync_session";
const MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

/**
 * Set the authenticated user session in cookies.
 * Stores serialized user JSON + role & login flag for the proxy.
 */
export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  // These non-httpOnly cookies are read by the proxy (proxy.ts)
  cookieStore.set("user_role", user.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  cookieStore.set("is_logged_in", "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/**
 * Get the current session user from the cookie, or null if not authenticated.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const user: SessionUser = JSON.parse(sessionCookie.value);
    return user;
  } catch {
    return null;
  }
}

/**
 * Clear all session cookies (logout).
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  cookieStore.set("user_role", "", { path: "/", maxAge: 0 });
  cookieStore.set("is_logged_in", "", { path: "/", maxAge: 0 });
}
