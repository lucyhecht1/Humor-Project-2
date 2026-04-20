import { createClient } from "@/lib/supabase/server";
import { DistributionBarChart } from "@/app/_components/charts/DistributionBarChart";
import { VisibilityDonutChart } from "@/app/_components/charts/VisibilityDonutChart";

async function fetchStats() {
  const supabase = await createClient();

  const [totalRes, publicRes, featuredRes, likedRes, bucketResults, topCaptionsRes] =
    await Promise.all([
      supabase.from("captions").select("*", { count: "exact", head: true }),
      supabase
        .from("captions")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true),
      supabase
        .from("captions")
        .select("*", { count: "exact", head: true })
        .eq("is_featured", true),
      supabase
        .from("captions")
        .select("*", { count: "exact", head: true })
        .gt("like_count", 0),
      Promise.all([
        supabase
          .from("captions")
          .select("*", { count: "exact", head: true })
          .eq("like_count", 0),
        supabase
          .from("captions")
          .select("*", { count: "exact", head: true })
          .gte("like_count", 1)
          .lte("like_count", 2),
        supabase
          .from("captions")
          .select("*", { count: "exact", head: true })
          .gte("like_count", 3)
          .lte("like_count", 5),
        supabase
          .from("captions")
          .select("*", { count: "exact", head: true })
          .gte("like_count", 6)
          .lte("like_count", 10),
        supabase
          .from("captions")
          .select("*", { count: "exact", head: true })
          .gte("like_count", 11)
          .lte("like_count", 25),
        supabase
          .from("captions")
          .select("*", { count: "exact", head: true })
          .gt("like_count", 25),
      ]),
      supabase
        .from("captions")
        .select("id, content, like_count, image_id, images(url)")
        .gt("like_count", 0)
        .order("like_count", { ascending: false })
        .limit(5),
    ]);

  const total = totalRes.count ?? 0;
  const publicCount = publicRes.count ?? 0;
  const featuredCount = featuredRes.count ?? 0;
  const likedCount = likedRes.count ?? 0;

  const distribution = [
    { bucket: "0", count: bucketResults[0].count ?? 0 },
    { bucket: "1–2", count: bucketResults[1].count ?? 0 },
    { bucket: "3–5", count: bucketResults[2].count ?? 0 },
    { bucket: "6–10", count: bucketResults[3].count ?? 0 },
    { bucket: "11–25", count: bucketResults[4].count ?? 0 },
    { bucket: "26+", count: bucketResults[5].count ?? 0 },
  ];

  type TopCaption = {
    id: string;
    content: string | null;
    like_count: number | null;
    image_id: string | null;
    images: { url: string } | { url: string }[] | null;
  };
  const topCaptions = (topCaptionsRes.data ?? []) as unknown as TopCaption[];

  return {
    total,
    publicCount,
    featuredCount,
    likedCount,
    distribution,
    topCaptions,
  };
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
      )}
    </div>
  );
}

export async function CaptionStats() {
  const { total, publicCount, featuredCount, likedCount, distribution, topCaptions } =
    await fetchStats();

  const ratedPct = total > 0 ? Math.round((likedCount / total) * 100) : 0;

  return (
    <div className="mb-8 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Captions" value={total} />
        <StatCard
          label="Rated"
          value={likedCount}
          sub={`${ratedPct}% have ≥1 like`}
        />
        <StatCard label="Public" value={publicCount} sub={`${total > 0 ? Math.round((publicCount / total) * 100) : 0}% of total`} />
        <StatCard label="Featured" value={featuredCount} sub={`${total > 0 ? Math.round((featuredCount / total) * 100) : 0}% of total`} />
      </div>

      {/* Charts + Top rated */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Like count distribution */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Like-count distribution
          </p>
          <DistributionBarChart data={distribution} color="#6366f1" />
        </div>

        {/* Visibility donut */}
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col items-center justify-center">
          <VisibilityDonutChart
            data={[
              { name: "Public", value: publicCount },
              { name: "Private", value: total - publicCount },
            ]}
            title="Visibility"
          />
        </div>
      </div>

      {/* Top captions by like count */}
      {topCaptions.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Top captions by total likes
            </p>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {topCaptions.map((c, i) => {
              const img = Array.isArray(c.images) ? c.images[0] : c.images;
              return (
                <li key={c.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-5 flex-shrink-0 text-center text-xs font-bold text-zinc-400">
                    #{i + 1}
                  </span>
                  {img?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt="" className="h-10 w-10 flex-shrink-0 rounded object-cover bg-zinc-100 dark:bg-zinc-800" />
                  ) : (
                    <div className="h-10 w-10 flex-shrink-0 rounded bg-zinc-100 dark:bg-zinc-800" />
                  )}
                  <p className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                    {c.content ?? <span className="text-zinc-400">—</span>}
                  </p>
                  <span className="flex-shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {c.like_count?.toLocaleString()} likes
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
