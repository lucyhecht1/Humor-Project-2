import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteModelButton } from "./_components/DeleteModelButton";
import { LiveSearchInput } from "@/app/admin/_components/LiveSearchInput";
import { SortableHeader } from "@/app/admin/_components/SortableHeader";
import { ModelStats } from "./_components/ModelStats";

interface LlmModel {
  id: number;
  name: string;
  provider_model_id: string;
  is_temperature_supported: boolean;
  created_datetime_utc: string;
  llm_providers: { name: string } | null;
}

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; dir?: string }>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function LlmModelsPage({ searchParams }: Props) {
  "use no memo";
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { q = "", sort = "id", dir = "asc" } = await searchParams;

  const columnMap: Record<string, string> = {
    id: "id",
    name: "name",
    model_id: "provider_model_id",
    temp: "is_temperature_supported",
    created: "created_datetime_utc",
  };
  const sortColumn = columnMap[sort] ?? "id";

  const supabase = await createClient();
  let query = supabase
    .from("llm_models")
    .select("id, name, provider_model_id, is_temperature_supported, created_datetime_utc, llm_providers(name)", { count: "exact" })
    .order(sortColumn, { ascending: dir === "asc" });

  if (q.trim()) query = query.or(`name.ilike.%${q.trim()}%,provider_model_id.ilike.%${q.trim()}%`);

  const { data: models, error, count } = await query.returns<LlmModel[]>();

  const preserveParams = { q };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">LLM Models</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {(count ?? 0)} models{q ? " matching" : " total"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveSearchInput defaultValue={q} placeholder="Search name or model ID…" />
          <Link href="/admin/llm-models/new" className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            + New model
          </Link>
        </div>
      </div>

      <ModelStats />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load models: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <SortableHeader column="id" label="ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="name" label="Name" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Provider</th>
              <SortableHeader column="model_id" label="Provider model ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="temp" label="Temp" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="created" label="Created" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!models?.length ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {q ? `No models matching "${q}".` : "No models found."}
                </td>
              </tr>
            ) : (
              models.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{m.id}</td>
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{m.name}</td>
                  <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {m.llm_providers?.name ?? <span className="text-zinc-400 dark:text-zinc-500">—</span>}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">{m.provider_model_id}</td>
                  <td className="px-5 py-3.5">
                    {m.is_temperature_supported ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">Yes</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">No</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(m.created_datetime_utc)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/llm-models/${m.id}`} className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Edit</Link>
                      <DeleteModelButton id={m.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
