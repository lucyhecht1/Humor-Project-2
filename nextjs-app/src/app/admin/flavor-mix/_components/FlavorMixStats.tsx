import { createClient } from "@/lib/supabase/server";

async function fetchStats() {
  const supabase = await createClient();
  const { data } = await supabase.from("humor_flavor_mix").select("caption_count");
  const rows = data ?? [];
  const total = rows.length;
  const totalCaptions = rows.reduce((sum, r) => sum + (r.caption_count ?? 0), 0);
  const avg = total > 0 ? Math.round(totalCaptions / total) : 0;
  return { total, totalCaptions, avg };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

export async function FlavorMixStats() {
  const { total, totalCaptions, avg } = await fetchStats();
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <StatCard label="Flavor Entries" value={total} sub="configured flavors" />
      <StatCard label="Total Captions" value={totalCaptions} sub="sum of caption counts" />
      <StatCard label="Avg per Flavor" value={avg} sub="captions per flavor" />
    </div>
  );
}
