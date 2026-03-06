import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { SearchInput } from "./_components/SearchInput";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  created_datetime_utc: string | null;
}

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 100;

/** Format ISO date for display; same output on server and client to avoid hydration mismatch. */
function formatCreatedUtc(iso: string): string {
  const d = new Date(iso);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const am = h < 12;
  const h12 = h % 12 || 12;
  const mm = m < 10 ? `0${m}` : String(m);
  return `${mon} ${day}, ${year}, ${h12}:${mm} ${am ? "AM" : "PM"} UTC`;
}

export default async function UsersPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (q.trim()) {
    query = query.ilike("email", `%${q.trim()}%`);
  }

  const { data: users, error, count } = await query.returns<Profile[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div suppressHydrationWarning>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Users
        </h1>
        <SearchInput defaultValue={q} />
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          Failed to load users: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                ID
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Superadmin
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!users?.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500"
                >
                  {q ? `No users found matching "${q}".` : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {user.first_name || user.last_name
                      ? [user.first_name, user.last_name].filter(Boolean).join(" ")
                      : <span className="text-zinc-400 dark:text-zinc-500">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      title={user.id}
                      className="font-mono text-xs text-zinc-400 dark:text-zinc-500"
                    >
                      {user.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_superadmin ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {user.created_datetime_utc
                      ? formatCreatedUtc(user.created_datetime_utc)
                      : <span className="text-zinc-400 dark:text-zinc-500">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {(count ?? 0).toLocaleString("en-US")} total{q ? ` matching "${q}"` : ""}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <a
                href={`?${new URLSearchParams({ ...(q && { q }), page: String(page - 1) })}`}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                ← Prev
              </a>
            ) : (
              <span className="rounded-md border border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
                ← Prev
              </span>
            )}
            {page < totalPages ? (
              <a
                href={`?${new URLSearchParams({ ...(q && { q }), page: String(page + 1) })}`}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Next →
              </a>
            ) : (
              <span className="rounded-md border border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
                Next →
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
