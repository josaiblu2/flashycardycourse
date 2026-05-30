import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { getDeckCountsByUserIds } from "@/db/queries/admin-decks";
import { requireAdmin } from "@/lib/admin/require-admin";

export type AdminUserSummary = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: number;
  banned: boolean;
  deckCount: number;
};

export async function getAdminUserSummaries(): Promise<AdminUserSummary[]> {
  await requireAdmin();

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  });

  const deckCounts = await getDeckCountsByUserIds(users.map((user) => user.id));

  return users.map((user) => ({
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    name:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      null,
    createdAt: user.createdAt,
    banned: user.banned,
    deckCount: deckCounts.get(user.id) ?? 0,
  }));
}

export async function banClerkUser(userId: string) {
  await requireAdmin();
  const client = await clerkClient();
  await client.users.banUser(userId);
}

export async function unbanClerkUser(userId: string) {
  await requireAdmin();
  const client = await clerkClient();
  await client.users.unbanUser(userId);
}

export async function deleteClerkUser(userId: string) {
  await requireAdmin();
  const client = await clerkClient();
  await client.users.deleteUser(userId);
}
