import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { SearchInput } from "./_components/SearchInput";
import { SortableHeader } from "./_components/SortableHeader";
import { UserStats } from "./_components/UserStats";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  created_datetime_utc: string | null;
}

type Props = {
  searchParams: Promise<{ q?: string; page?: string; sort?: string; dir?: string }>;
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

  const { q = "", page: pageParam = "1", sort = "created", dir = "desc" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const columnMap: Record<string, string> = {
    name: "first_name",
    id: "id",
    email: "email",
    superadmin: "is_superadmin",
    created: "created_datetime_utc",
  };
  const sortColumn = columnMap[sort] ?? "created_datetime_utc";
  const ascending = dir === "asc";

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc", { count: "exact" })
    .order(sortColumn, { ascending })
    .range(from, to);

  if (q.trim()) {
    query = query.ilike("email", `%${q.trim()}%`);
  }

  const { data: users, error, count } = await query.returns<Profile[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Users
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage accounts and access
        </p>
      </div>

      <UserStats />

      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <SearchInput defaultValue={q} />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load users: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[35%]" />
            <col className="w-[10%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <SortableHeader column="name" label="Name" defaultDir="asc" currentSort={sort} currentDir={dir} preserveParams={{ q }} />
              <SortableHeader column="id" label="ID" defaultDir="asc" currentSort={sort} currentDir={dir} preserveParams={{ q }} />
              <SortableHeader column="email" label="Email" defaultDir="asc" currentSort={sort} currentDir={dir} preserveParams={{ q }} />
              <SortableHeader column="superadmin" label="Superadmin" defaultDir="desc" currentSort={sort} currentDir={dir} preserveParams={{ q }} />
              <SortableHeader column="created" label="Created" defaultDir="desc" currentSort={sort} currentDir={dir} preserveParams={{ q }} />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!users?.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  {q ? `No users found matching "${q}".` : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30"
                >
                  <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300">
                    {user.first_name || user.last_name
                      ? [user.first_name, user.last_name].filter(Boolean).join(" ")
                      : <span className="text-zinc-400 dark:text-zinc-500">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      title={user.id}
                      className="font-mono text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      {user.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300">
                    {user.email}
                  </td>
                  <td className="px-5 py-3.5">
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
                  <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {(count ?? 0).toLocaleString("en-US")} total{q ? ` matching "${q}"` : ""}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <a
                href={`?${new URLSearchParams({ ...(q && { q }), page: String(page - 1) })}`}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                ← Prev
              </a>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">
                ← Prev
              </span>
            )}
            {page < totalPages ? (
              <a
                href={`?${new URLSearchParams({ ...(q && { q }), page: String(page + 1) })}`}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Next →
              </a>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">
                Next →
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
