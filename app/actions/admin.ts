"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  banClerkUser,
  deleteClerkUser,
  unbanClerkUser,
} from "@/lib/admin/users";
import { deleteDecksByUserId } from "@/db/queries/admin-decks";

const AdminUserActionSchema = z.object({
  userId: z.string().min(1),
});

type AdminUserActionInput = z.infer<typeof AdminUserActionSchema>;

export async function suspendUser(input: AdminUserActionInput) {
  const parsed = AdminUserActionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await requireAdmin();
  await banClerkUser(parsed.data.userId);
  revalidatePath("/admin");
}

export async function unsuspendUser(input: AdminUserActionInput) {
  const parsed = AdminUserActionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await requireAdmin();
  await unbanClerkUser(parsed.data.userId);
  revalidatePath("/admin");
}

export async function deleteUserAccount(input: AdminUserActionInput) {
  const parsed = AdminUserActionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await requireAdmin();
  await deleteDecksByUserId(parsed.data.userId);
  await deleteClerkUser(parsed.data.userId);
  revalidatePath("/admin");
}
