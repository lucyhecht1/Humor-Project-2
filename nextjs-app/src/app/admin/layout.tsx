import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { AdminNav } from "./_components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await requireSuperadmin();

  if (!result.authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 p-8 text-center shadow-sm dark:border-zinc-800">
          <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Not Authorized
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your account does not have access to this area.
          </p>
          <a
            href="/logout"
            className="mt-6 inline-block text-sm font-medium text-zinc-700 underline underline-offset-2 dark:text-zinc-300"
          >
            Sign out
          </a>
        </div>
      </main>
    );
  }

  const { user } = result;

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-zinc-200 px-3 py-6 dark:border-zinc-800">
        <p className="mb-6 px-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Admin
        </p>

        <AdminNav />

        <div className="mt-auto space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="truncate px-3 text-xs text-zinc-400 dark:text-zinc-500">
            {user.email}
          </p>
          <form action="/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
