import { createClient } from "@/lib/supabase/server";
import { VisibilityDonutChart } from "@/app/_components/charts/VisibilityDonutChart";

async function fetchStats() {
  const supabase = await createClient();

  const [totalRes, publicRes, commonUseRes, withDescRes, topImagesRes] = await Promise.all([
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),
    supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .eq("is_common_use", true),
    supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .not("image_description", "is", null),
    // top 5 images by caption count
    supabase
      .from("captions")
      .select("image_id")
      .not("image_id", "is", null),
  ]);

  const total = totalRes.count ?? 0;
  const publicCount = publicRes.count ?? 0;
  const commonUseCount = commonUseRes.count ?? 0;
  const withDescCount = withDescRes.count ?? 0;

  // aggregate caption counts per image
  const captionsByImage = new Map<string, number>();
  for (const c of topImagesRes.data ?? []) {
    if (c.image_id)
      captionsByImage.set(c.image_id, (captionsByImage.get(c.image_id) ?? 0) + 1);
  }
  const topImageIds = [...captionsByImage.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));

  const { data: imageRows } = await supabase
    .from("images")
    .select("id, url")
    .in("id", topImageIds.map((r) => r.id));

  const imageUrlMap = new Map((imageRows ?? []).map((r) => [r.id, r.url as string]));
  const topImages = topImageIds
    .map((r) => ({ ...r, url: imageUrlMap.get(r.id) ?? null }))
    .filter((r) => r.url);

  return { total, publicCount, commonUseCount, withDescCount, topImages };
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

export async function ImageStats() {
  const { total, publicCount, commonUseCount, withDescCount, topImages } =
    await fetchStats();

  return (
    <div className="mb-8 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Images" value={total} />
        <StatCard
          label="Public"
          value={publicCount}
          sub={total > 0 ? `${Math.round((publicCount / total) * 100)}% of total` : undefined}
        />
        <StatCard
          label="Common Use"
          value={commonUseCount}
          sub={total > 0 ? `${Math.round((commonUseCount / total) * 100)}% of total` : undefined}
        />
        <StatCard
          label="With Description"
          value={withDescCount}
          sub={total > 0 ? `${Math.round((withDescCount / total) * 100)}% described` : undefined}
        />
      </div>

      {/* Visibility donut + top images by caption count */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col items-center justify-center">
          <VisibilityDonutChart
            data={[
              { name: "Public", value: publicCount },
              { name: "Private", value: total - publicCount },
            ]}
            title="Visibility"
          />
        </div>

        {topImages.length > 0 && (
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Most captioned images
              </p>
            </div>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {topImages.map((img, i) => (
                <li key={img.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-5 flex-shrink-0 text-center text-xs font-bold text-zinc-400">
                    #{i + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url!}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 rounded object-cover bg-zinc-100 dark:bg-zinc-800"
                  />
                  <p className="flex-1 truncate font-mono text-xs text-zinc-400">
                    {img.id.slice(0, 8)}…
                  </p>
                  <span className="flex-shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {img.count.toLocaleString()} captions
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
