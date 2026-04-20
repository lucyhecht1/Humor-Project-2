import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { FilterBar } from "./_components/FilterBar";
import { LiveSearchInput } from "@/app/admin/_components/LiveSearchInput";
import { SortableHeader } from "@/app/admin/_components/SortableHeader";
import { CaptionStats } from "./_components/CaptionStats";

interface Caption {
  id: string;
  content: string | null;
  like_count: number | null;
  is_public: boolean;
  is_featured: boolean;
  created_datetime_utc: string | null;
  profile_id: string | null;
  image_id: string | null;
  humor_flavor_id: number | null;
  caption_request_id: number | null;
  llm_prompt_chain_id: number | null;
  images: { url: string } | null;
}

type Props = {
  searchParams: Promise<{ image_id?: string; profile_id?: string; q?: string; page?: string; sort?: string; dir?: string }>;
};

const PAGE_SIZE = 50;

function formatDate(iso: string | null) {
  if (!iso) return "—";
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

function Flag({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      No
    </span>
  );
}

function IdCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-zinc-400 dark:text-zinc-500">—</span>;
  return (
    <span title={value} className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
      {value.slice(0, 8)}…
    </span>
  );
}

function NumCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-zinc-400 dark:text-zinc-500">—</span>;
  return <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{value}</span>;
}

export default async function CaptionsPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { image_id = "", profile_id = "", q = "", page: pageParam = "1", sort = "created", dir = "desc" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const columnMap: Record<string, string> = {
    id: "id",
    content: "content",
    likes: "like_count",
    public: "is_public",
    featured: "is_featured",
    profile: "profile_id",
    image_id: "image_id",
    flavor: "humor_flavor_id",
    request: "caption_request_id",
    chain: "llm_prompt_chain_id",
    created: "created_datetime_utc",
  };
  const sortColumn = columnMap[sort] ?? "created_datetime_utc";

  const supabase = await createClient();

  let query = supabase
    .from("captions")
    .select(
      "id, content, like_count, is_public, is_featured, created_datetime_utc, profile_id, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, images(url)",
      { count: "exact" }
    )
    .order(sortColumn, { ascending: dir === "asc" })
    .range(from, to);

  if (image_id.trim()) query = query.eq("image_id", image_id.trim());
  if (profile_id.trim()) query = query.eq("profile_id", profile_id.trim());
  if (q.trim()) query = query.ilike("content", `%${q.trim()}%`);

  const { data: captions, error, count } = await query.returns<Caption[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const activeFilters = [
    q && `content: "${q}"`,
    image_id && `image: ${image_id.slice(0, 8)}…`,
    profile_id && `profile: ${profile_id.slice(0, 8)}…`,
  ].filter(Boolean);

  const preserveParams = { q, image_id, profile_id };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Captions</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {(count ?? 0).toLocaleString()} captions total
        </p>
      </div>

      <CaptionStats />

      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
          <FilterBar imageId={image_id} profileId={profile_id} />
          <LiveSearchInput defaultValue={q} placeholder="Search content…" />
        </div>
        {activeFilters.length > 0 && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Filtering by {activeFilters.join(", ")}
          </p>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load captions: {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <SortableHeader column="id" label="ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Image</th>
              <SortableHeader column="content" label="Content" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="likes" label="Likes" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <SortableHeader column="public" label="Public" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <SortableHeader column="featured" label="Featured" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <SortableHeader column="profile" label="Profile" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="image_id" label="Image ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="flavor" label="Flavor" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="request" label="Request" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="chain" label="Chain" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="created" label="Created" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!captions?.length ? (
              <tr>
                <td colSpan={12} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {activeFilters.length ? "No captions match the current filters." : "No captions found."}
                </td>
              </tr>
            ) : (
              captions.map((caption) => (
                <tr key={caption.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5"><IdCell value={caption.id} /></td>

                  <td className="px-5 py-3.5">
                    {caption.images?.url ? (
                      <a href={caption.images.url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={caption.images.url} alt="" className="h-10 w-10 rounded object-cover bg-zinc-100 dark:bg-zinc-800" />
                      </a>
                    ) : (
                      <div className="h-10 w-10 rounded bg-zinc-100 dark:bg-zinc-800" />
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300">
                    {caption.content ? (
                      <span title={caption.content}>
                        {caption.content.length > 80 ? caption.content.slice(0, 80) + "…" : caption.content}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 tabular-nums text-zinc-700 dark:text-zinc-300">{caption.like_count ?? 0}</td>
                  <td className="px-5 py-3.5"><Flag value={caption.is_public} /></td>
                  <td className="px-5 py-3.5"><Flag value={caption.is_featured} /></td>
                  <td className="px-5 py-3.5"><IdCell value={caption.profile_id} /></td>
                  <td className="px-5 py-3.5"><IdCell value={caption.image_id} /></td>
                  <td className="px-5 py-3.5"><NumCell value={caption.humor_flavor_id} /></td>
                  <td className="px-5 py-3.5"><NumCell value={caption.caption_request_id} /></td>
                  <td className="px-5 py-3.5"><NumCell value={caption.llm_prompt_chain_id} /></td>

                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap" suppressHydrationWarning>
                    {formatDate(caption.created_datetime_utc)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {(count ?? 0).toLocaleString()} total{activeFilters.length ? " matching filters" : ""}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <a href={`?${new URLSearchParams({ ...(q && { q }), ...(image_id && { image_id }), ...(profile_id && { profile_id }), ...(sort !== "created" && { sort }), ...(dir !== "desc" && { dir }), page: String(page - 1) })}`} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">← Prev</a>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">← Prev</span>
            )}
            {page < totalPages ? (
              <a href={`?${new URLSearchParams({ ...(q && { q }), ...(image_id && { image_id }), ...(profile_id && { profile_id }), ...(sort !== "created" && { sort }), ...(dir !== "desc" && { dir }), page: String(page + 1) })}`} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Next →</a>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">Next →</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
