import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { FlavorMixForm } from "./_components/FlavorMixForm";
import { FlavorMixStats } from "./_components/FlavorMixStats";

interface MixRow {
  id: number;
  caption_count: number;
  humor_flavor_id: number;
  humor_flavors: { slug: string } | null;
}

type Props = {
  searchParams: Promise<{ sort?: string; dir?: string }>;
};

export default async function FlavorMixPage({ searchParams }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { sort = "flavor", dir = "asc" } = await searchParams;

  const columnMap: Record<string, string> = {
    id: "id",
    flavor: "humor_flavor_id",
    count: "caption_count",
  };
  const sortColumn = columnMap[sort] ?? "humor_flavor_id";

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("humor_flavor_mix")
    .select("id, caption_count, humor_flavor_id, humor_flavors(slug)")
    .order(sortColumn, { ascending: dir === "asc" })
    .returns<MixRow[]>();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Humor Flavor Mix
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Configure how many captions each flavor generates per run.
        </p>
      </div>

      <FlavorMixStats />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load flavor mix: {error.message}
        </p>
      )}

      <FlavorMixForm rows={rows ?? []} currentSort={sort} currentDir={dir} />
    </div>
  );
}
