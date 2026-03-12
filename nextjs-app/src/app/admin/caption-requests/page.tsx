import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LiveSearchInput } from "@/app/admin/_components/LiveSearchInput";
import { SortableHeader } from "@/app/admin/_components/SortableHeader";

interface CaptionRequest {
  id: number;
  created_datetime_utc: string;
  profile_id: string;
  image_id: string;
}

type Props = {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; dir?: string }>;
};

const PAGE_SIZE = 100;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export default async function CaptionRequestsPage({ searchParams }: Props) {
  "use no memo";
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { page: pageParam = "1", q = "", sort = "created", dir = "desc" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const columnMap: Record<string, string> = {
    id: "id",
    profile: "profile_id",
    image: "image_id",
    created: "created_datetime_utc",
  };
  const sortColumn = columnMap[sort] ?? "created_datetime_utc";

  const supabase = await createClient();
  let query = supabase
    .from("caption_requests")
    .select("id, created_datetime_utc, profile_id, image_id", { count: "exact" })
    .order(sortColumn, { ascending: dir === "asc" })
    .range(from, to);

  if (q.trim()) query = query.ilike("profile_id", `%${q.trim()}%`);

  const { data: requests, error, count } = await query.returns<CaptionRequest[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort !== "created") params.set("sort", sort);
    if (dir !== "desc") params.set("dir", dir);
    params.set("page", String(p));
    return `/admin/caption-requests?${params.toString()}`;
  }

  const preserveParams = { q };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Caption Requests
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {(count ?? 0).toLocaleString()} requests{q ? " matching" : " total"}
          </p>
        </div>
        <LiveSearchInput defaultValue={q} placeholder="Filter by profile ID…" />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load caption requests: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <SortableHeader column="id" label="ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="profile" label="Profile" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="image" label="Image" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="created" label="Created" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!requests?.length ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {q ? `No requests matching "${q}".` : "No caption requests found."}
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {req.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <span title={req.profile_id} className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {req.profile_id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span title={req.image_id} className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {req.image_id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap" suppressHydrationWarning>
                    {formatDate(req.created_datetime_utc)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {(count ?? 0).toLocaleString()} total
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">← Prev</Link>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">← Prev</span>
            )}
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Next →</Link>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">Next →</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
