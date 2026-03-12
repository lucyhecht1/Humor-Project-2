import Link from "next/link";
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Not Authorized
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your account does not have access to this area.
          </p>
          <form action="/logout" method="POST" className="mt-6">
            <button
              type="submit"
              className="inline-block cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  const { user } = result;

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col bg-zinc-950 shadow-xl">
        {/* Header */}
        <div className="px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
              <span className="text-sm font-semibold text-white">
                {user.email?.charAt(0)?.toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-white">Admin</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px bg-white/5" />

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <AdminNav />
        </div>

        <div className="mx-4 h-px bg-white/5" />

        {/* Footer */}
        <div className="px-3 py-4 space-y-1.5">
          <form action="/logout" method="POST">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
