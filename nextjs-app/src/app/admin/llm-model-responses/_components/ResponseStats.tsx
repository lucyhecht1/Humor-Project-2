import { createClient } from "@/lib/supabase/server";

async function fetchStats() {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [totalRes, last30Res, last7Res, timingRes] = await Promise.all([
    supabase.from("llm_model_responses").select("*", { count: "exact", head: true }),
    supabase.from("llm_model_responses").select("*", { count: "exact", head: true }).gte("created_datetime_utc", thirtyDaysAgo),
    supabase.from("llm_model_responses").select("*", { count: "exact", head: true }).gte("created_datetime_utc", sevenDaysAgo),
    supabase.from("llm_model_responses").select("processing_time_seconds").limit(500).order("created_datetime_utc", { ascending: false }),
  ]);
  const times = (timingRes.data ?? []).map((r) => r.processing_time_seconds as number).filter(Boolean);
  const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : null;
  return {
    total: totalRes.count ?? 0,
    last30: last30Res.count ?? 0,
    last7: last7Res.count ?? 0,
    avgTime,
  };
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

export async function ResponseStats() {
  const { total, last30, last7, avgTime } = await fetchStats();
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Total Responses" value={total} />
      <StatCard label="Last 30 Days" value={last30} sub={total > 0 ? `${Math.round((last30 / total) * 100)}% of total` : undefined} />
      <StatCard label="Last 7 Days" value={last7} />
      {avgTime && <StatCard label="Avg Time (s)" value={avgTime} sub="last 500 responses" />}
    </div>
  );
}
