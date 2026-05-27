import { isAdminAuthenticated } from "@/lib/admin/session";
import { isAdminConfigured } from "@/lib/admin/auth";
import { getAdminUserSummaries } from "@/lib/admin/users";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminUserTable } from "@/components/admin-user-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function AdminPage() {
  const configured = isAdminConfigured();

  if (!configured) {
    return (
      <main className="flex flex-1 flex-col px-6 py-10 max-w-5xl mx-auto w-full">
        <Alert variant="destructive">
          <AlertTitle>Admin panel not configured</AlertTitle>
          <AlertDescription>
            Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in
            your environment before using this page.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <AdminLoginForm />
      </main>
    );
  }

  const users = await getAdminUserSummaries();

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Admin
        </h1>
        <p className="text-muted-foreground mt-1">
          Suspend or delete user accounts registered through Clerk.
        </p>
      </div>
      <AdminUserTable users={users} />
    </main>
  );
}
