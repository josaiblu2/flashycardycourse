import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

const ADMIN_ROLE = "admin";

export function parseAdminUserIds(): string[] {
  const raw = process.env.ADMIN_CLERK_USER_IDS;
  if (!raw?.trim()) return [];

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminConfigured(): boolean {
  return parseAdminUserIds().length > 0;
}

export function isAllowlistedAdmin(userId: string): boolean {
  return parseAdminUserIds().includes(userId);
}

async function hasAdminMetadata(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata?.role === ADMIN_ROLE;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  if (isAllowlistedAdmin(userId)) return true;
  return hasAdminMetadata(userId);
}

export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (await isAdminUser(userId)) return userId;
  throw new Error("Forbidden");
}
