import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LiveSearchInput } from "@/app/admin/_components/LiveSearchInput";
import { SortableHeader } from "@/app/admin/_components/SortableHeader";

interface HumorFlavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; dir?: string }>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function FlavorsPage({ searchParams }: Props) {
  "use no memo";
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { q = "", sort = "id", dir = "asc" } = await searchParams;

  const columnMap: Record<string, string> = {
    id: "id",
    slug: "slug",
    description: "description",
    created: "created_datetime_utc",
  };
  const sortColumn = columnMap[sort] ?? "id";

  const supabase = await createClient();
  let query = supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc", { count: "exact" })
    .order(sortColumn, { ascending: dir === "asc" });

  if (q.trim()) query = query.ilike("slug", `%${q.trim()}%`);

  const { data: flavors, error, count } = await query.returns<HumorFlavor[]>();

  const preserveParams = { q };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Humor Flavors
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {(count ?? 0).toLocaleString()} flavors{q ? " matching" : " total"}
          </p>
        </div>
        <LiveSearchInput defaultValue={q} placeholder="Search slugs…" />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load flavors: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <SortableHeader column="id" label="ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="slug" label="Slug" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="description" label="Description" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="created" label="Created" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Steps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!flavors?.length ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {q ? `No flavors matching "${q}".` : "No flavors found."}
                </td>
              </tr>
            ) : (
              flavors.map((flavor) => (
                <tr key={flavor.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {flavor.id}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">
                    {flavor.slug}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {flavor.description ? (
                      <span title={flavor.description}>
                        {flavor.description.length > 80
                          ? flavor.description.slice(0, 80) + "…"
                          : flavor.description}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(flavor.created_datetime_utc)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/flavors/${flavor.id}`}
                      className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-blue-950"
                    >
                      View steps
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
