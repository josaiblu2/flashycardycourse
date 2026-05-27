"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifyAdminCredentials } from "@/lib/admin/auth";
import {
  assertAdminLoginAllowed,
  clearAdminLoginAttempts,
  recordAdminLoginFailure,
} from "@/lib/admin/login-rate-limit";
import { getRequestIp } from "@/lib/admin/request-ip";
import {
  clearAdminSession,
  requireAdminSession,
  setAdminSession,
} from "@/lib/admin/session";
import {
  banClerkUser,
  deleteClerkUser,
  unbanClerkUser,
} from "@/lib/admin/users";
import { deleteDecksByUserId } from "@/db/queries/admin-decks";

const AdminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export async function adminLogin(input: AdminLoginInput) {
  const parsed = AdminLoginSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid credentials");

  const requestIp = await getRequestIp();
  assertAdminLoginAllowed(requestIp);

  const isValid = verifyAdminCredentials(
    parsed.data.username,
    parsed.data.password
  );
  if (!isValid) {
    recordAdminLoginFailure(requestIp);
    throw new Error("Invalid username or password");
  }

  clearAdminLoginAttempts(requestIp);
  await setAdminSession();
}

export async function adminLogout() {
  await clearAdminSession();
}

// Target Clerk user ID for admin operations — not used for session authorization.
const AdminUserActionSchema = z.object({
  userId: z.string().min(1),
});

type AdminUserActionInput = z.infer<typeof AdminUserActionSchema>;

export async function suspendUser(input: AdminUserActionInput) {
  const parsed = AdminUserActionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await requireAdminSession();
  await banClerkUser(parsed.data.userId);
  revalidatePath("/admin");
}

export async function unsuspendUser(input: AdminUserActionInput) {
  const parsed = AdminUserActionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await requireAdminSession();
  await unbanClerkUser(parsed.data.userId);
  revalidatePath("/admin");
}

export async function deleteUserAccount(input: AdminUserActionInput) {
  const parsed = AdminUserActionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await requireAdminSession();
  await deleteDecksByUserId(parsed.data.userId);
  await deleteClerkUser(parsed.data.userId);
  revalidatePath("/admin");
}
