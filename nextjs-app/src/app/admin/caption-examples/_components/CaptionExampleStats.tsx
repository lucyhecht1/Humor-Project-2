import { createClient } from "@/lib/supabase/server";

async function fetchStats() {
  const supabase = await createClient();
  const [totalRes, withImageRes] = await Promise.all([
    supabase.from("caption_examples").select("*", { count: "exact", head: true }),
    supabase.from("caption_examples").select("*", { count: "exact", head: true }).not("image_id", "is", null),
  ]);
  const total = totalRes.count ?? 0;
  const withImage = withImageRes.count ?? 0;
  return { total, withImage };
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

export async function CaptionExampleStats() {
  const { total, withImage } = await fetchStats();
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <StatCard label="Total Examples" value={total} />
      <StatCard
        label="With Image"
        value={withImage}
        sub={total > 0 ? `${Math.round((withImage / total) * 100)}% linked` : undefined}
      />
      <StatCard
        label="No Image"
        value={total - withImage}
        sub={total > 0 ? `${Math.round(((total - withImage) / total) * 100)}% unlinked` : undefined}
      />
    </div>
  );
}
