import "server-only";

import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { resolveProAccess, type ProAccess } from "@/lib/billing/pro-access";

export const FREE_PRO_ACCESS: ProAccess = {
  hasPro: false,
  isClerkPro: false,
  isDemoPro: false,
  isAdmin: false,
  source: "free",
};

/** Dedupes Clerk session reads when layout and pages both call auth(). */
export const getCachedAuth = cache(auth);

/** Dedupes pro resolution when layout and pages run in the same request. */
export const getCachedProAccess = cache(async (): Promise<ProAccess> => {
  const { userId, has } = await getCachedAuth();
  if (!userId) return FREE_PRO_ACCESS;
  return resolveProAccess(userId, has);
});
