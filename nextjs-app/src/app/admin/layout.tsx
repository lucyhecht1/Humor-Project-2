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
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Not Authorized
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your account does not have access to this area.
          </p>
          <a
            href="/logout"
            className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign out
          </a>
        </div>
      </main>
    );
  }

  const { user } = result;

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col bg-zinc-900 shadow-xl dark:bg-zinc-950">
        <div className="flex flex-col px-4 pt-8 pb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700/80">
              <span className="text-sm font-semibold text-white">C</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white">
                Admin
              </h1>
              <p className="text-[11px] text-zinc-400">
                Crackd
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <AdminNav />
        </div>

        <div className="border-t border-zinc-700/80 px-3 py-4">
          <p
            className="truncate rounded-md bg-zinc-800/60 px-3 py-2 text-xs text-zinc-400"
            title={user.email ?? undefined}
          >
            {user.email}
          </p>
          <form action="/logout" method="POST" className="mt-3">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-zinc-800 px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-2 inline-flex w-full justify-center cursor-pointer rounded-lg border border-zinc-600 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-white active:scale-[0.98]"
          >
            Back to homepage
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
