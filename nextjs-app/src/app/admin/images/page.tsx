import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteButton } from "./_components/DeleteButton";

interface Image {
  id: string;
  url: string;
  profile_id: string | null;
  is_public: boolean;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
}

type Props = {
  searchParams: Promise<{ page?: string; q?: string; filter?: string }>;
};

const PAGE_SIZE = 30;

function formatDateShort(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ImagesPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { page: pageParam = "1", q = "", filter = "all" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("images")
    .select("id, url, profile_id, is_public, created_datetime_utc, modified_datetime_utc", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (q.trim()) query = query.ilike("url", `%${q.trim()}%`);
  if (filter === "public") query = query.eq("is_public", true);

  const { data: images, error, count } = await query.returns<Image[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function filterHref(f: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (f !== "all") params.set("filter", f);
    const qs = params.toString();
    return `/admin/images${qs ? `?${qs}` : ""}`;
  }

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filter !== "all") params.set("filter", filter);
    params.set("page", String(p));
    return `/admin/images?${params.toString()}`;
  }

  const filters = [
    { key: "all", label: "All" },
    { key: "public", label: "Public" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Images</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {(count ?? 0).toLocaleString("en-US")} images total
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form action="/admin/images" method="GET" className="relative">
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search images..."
              className="h-10 w-56 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 shadow-sm placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </form>

          {/* Filter tabs */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            {filters.map(({ key, label }) => {
              const active = filter === key;
              return (
                <Link
                  key={key}
                  href={filterHref(key)}
                  className={
                    active
                      ? "cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-zinc-900 bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-50"
                      : "cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Upload */}
          <Link
            href="/admin/images/new"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            + Upload
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load images: {error.message}
        </p>
      )}

      {/* Grid */}
      {!images?.length ? (
        <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No images found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              {/* Badges */}
              {img.is_public && (
                <div className="absolute left-2 top-2 flex gap-1">
                  <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-blue-500 text-white leading-tight">
                    Public
                  </span>
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-950/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <Link
                  href={`/admin/images/${img.id}`}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow hover:bg-zinc-100"
                >
                  Edit
                </Link>
                <DeleteButton id={img.id} />
              </div>

              {/* Date */}
              <div className="px-2 py-2" suppressHydrationWarning>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDateShort(img.created_datetime_utc)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                ← Prev
              </Link>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">
                ← Prev
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Next →
              </Link>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">
                Next →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
