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
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="px-4 pt-8 pb-6">
          <h1 className="mt-3 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Admin Panel
          </h1>
          <p className="mt-2 text-sm italic leading-snug text-zinc-500 dark:text-zinc-400">
            Where the Crackd Magic Happens
          </p>
        </div>

        <div className="flex-1 px-3">
          <AdminNav />
        </div>

        <div className="border-t border-zinc-200/80 px-3 py-4 dark:border-zinc-800/80">
          <p className="truncate px-2 text-xs text-zinc-500 dark:text-zinc-400" title={user.email ?? undefined}>
            {user.email}
          </p>
          <form action="/logout" method="POST" className="mt-2">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-3 inline-flex w-full justify-center cursor-pointer rounded-full border border-green-200 bg-green-50/80 px-4 py-1.5 text-sm font-medium text-green-700 transition-colors hover:border-green-300 hover:bg-green-100 active:scale-[0.98]"
          >
            Back to homepage
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
