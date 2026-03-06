import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { FilterBar } from "./_components/FilterBar";

interface Caption {
  id: string;
  content: string | null;
  like_count: number | null;
  is_public: boolean;
  is_featured: boolean;
  created_datetime_utc: string | null;
  profile_id: string | null;
  image_id: string | null;
  images: { url: string } | null;
}

type Props = {
  searchParams: Promise<{ image_id?: string; profile_id?: string; page?: string }>;
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

export default async function CaptionsPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { image_id = "", profile_id = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("captions")
    .select(
      "id, content, like_count, is_public, is_featured, created_datetime_utc, profile_id, image_id, images(url)",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (image_id.trim()) query = query.eq("image_id", image_id.trim());
  if (profile_id.trim()) query = query.eq("profile_id", profile_id.trim());

  const { data: captions, error, count } = await query.returns<Caption[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const activeFilters = [
    image_id && `image: ${image_id.slice(0, 8)}…`,
    profile_id && `profile: ${profile_id.slice(0, 8)}…`,
  ].filter(Boolean);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Captions</h1>
      </div>

      <div className="mb-6">
        <FilterBar imageId={image_id} profileId={profile_id} />
        {activeFilters.length > 0 && (
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Filtering by {activeFilters.join(", ")}
          </p>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          Failed to load captions: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">ID</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Image</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Content</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Likes</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Public</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Featured</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Profile</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Image ID</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!captions?.length ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500"
                >
                  {activeFilters.length
                    ? "No captions match the current filters."
                    : "No captions found."}
                </td>
              </tr>
            ) : (
              captions.map((caption) => (
                <tr
                  key={caption.id}
                  className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  {/* ID */}
                  <td className="px-4 py-3">
                    <span
                      title={caption.id}
                      className="font-mono text-xs text-zinc-400 dark:text-zinc-500"
                    >
                      {caption.id.slice(0, 8)}…
                    </span>
                  </td>

                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    {caption.images?.url ? (
                      <a
                        href={caption.images.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={caption.images.url}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={caption.images.url}
                          alt=""
                          className="h-10 w-10 rounded object-cover bg-zinc-100 dark:bg-zinc-800"
                        />
                      </a>
                    ) : (
                      <div className="h-10 w-10 rounded bg-zinc-100 dark:bg-zinc-800" />
                    )}
                  </td>

                  {/* Content */}
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {caption.content ? (
                      <span title={caption.content}>
                        {caption.content.length > 80
                          ? caption.content.slice(0, 80) + "…"
                          : caption.content}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>

                  {/* Likes */}
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                    {caption.like_count ?? 0}
                  </td>

                  {/* Flags */}
                  <td className="px-4 py-3">
                    <Flag value={caption.is_public} />
                  </td>
                  <td className="px-4 py-3">
                    <Flag value={caption.is_featured} />
                  </td>

                  {/* Profile ID */}
                  <td className="px-4 py-3">
                    {caption.profile_id ? (
                      <span
                        title={caption.profile_id}
                        className="font-mono text-xs text-zinc-500 dark:text-zinc-400"
                      >
                        {caption.profile_id.slice(0, 8)}…
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>

                  {/* Image ID */}
                  <td className="px-4 py-3">
                    {caption.image_id ? (
                      <span
                        title={caption.image_id}
                        className="font-mono text-xs text-zinc-500 dark:text-zinc-400"
                      >
                        {caption.image_id.slice(0, 8)}…
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
                    {formatDate(caption.created_datetime_utc)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {(count ?? 0).toLocaleString()} total{activeFilters.length ? " matching filters" : ""}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <a
                href={`?${new URLSearchParams({ ...(image_id && { image_id }), ...(profile_id && { profile_id }), page: String(page - 1) })}`}
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
                href={`?${new URLSearchParams({ ...(image_id && { image_id }), ...(profile_id && { profile_id }), page: String(page + 1) })}`}
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
