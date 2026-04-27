import { createClient } from "@/lib/supabase/server";

async function fetchStats() {
  const supabase = await createClient();
  const [totalRes, withDescRes] = await Promise.all([
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }).not("description", "is", null),
  ]);
  const total = totalRes.count ?? 0;
  const withDesc = withDescRes.count ?? 0;
  return { total, withDesc };
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

export async function FlavorStats() {
  const { total, withDesc } = await fetchStats();
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <StatCard label="Total Flavors" value={total} />
      <StatCard
        label="With Description"
        value={withDesc}
        sub={total > 0 ? `${Math.round((withDesc / total) * 100)}% described` : undefined}
      />
      <StatCard
        label="No Description"
        value={total - withDesc}
        sub={total > 0 ? `${Math.round(((total - withDesc) / total) * 100)}% missing` : undefined}
      />
    </div>
  );
}
