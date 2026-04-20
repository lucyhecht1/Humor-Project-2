import { createClient } from "@/lib/supabase/server";

async function fetchStats() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, superadminRes, recentRes, namedRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_superadmin", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_datetime_utc", thirtyDaysAgo),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("first_name", "is", null),
  ]);

  return {
    total: totalRes.count ?? 0,
    superadmins: superadminRes.count ?? 0,
    recentSignups: recentRes.count ?? 0,
    namedUsers: namedRes.count ?? 0,
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

export async function UserStats() {
  const { total, superadmins, recentSignups, namedUsers } = await fetchStats();

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Total Users" value={total} />
      <StatCard
        label="New (30 days)"
        value={recentSignups}
        sub={total > 0 ? `${Math.round((recentSignups / total) * 100)}% of total` : undefined}
      />
      <StatCard
        label="Named Users"
        value={namedUsers}
        sub={total > 0 ? `${Math.round((namedUsers / total) * 100)}% have a name set` : undefined}
      />
      <StatCard label="Superadmins" value={superadmins} />
    </div>
  );
}
