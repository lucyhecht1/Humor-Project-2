import { createClient } from "@/lib/supabase/server";

async function fetchStats() {
  const supabase = await createClient();
  const [totalRes, withTypeRes] = await Promise.all([
    supabase.from("terms").select("*", { count: "exact", head: true }),
    supabase.from("terms").select("*", { count: "exact", head: true }).not("term_type_id", "is", null),
  ]);
  const total = totalRes.count ?? 0;
  const withType = withTypeRes.count ?? 0;
  return { total, withType };
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

export async function TermStats() {
  const { total, withType } = await fetchStats();
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <StatCard label="Total Terms" value={total} />
      <StatCard
        label="With Type"
        value={withType}
        sub={total > 0 ? `${Math.round((withType / total) * 100)}% typed` : undefined}
      />
      <StatCard
        label="Untyped"
        value={total - withType}
        sub={total > 0 ? `${Math.round(((total - withType) / total) * 100)}% untyped` : undefined}
      />
    </div>
  );
}
