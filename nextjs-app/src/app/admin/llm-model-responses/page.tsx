import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LiveSearchInput } from "@/app/admin/_components/LiveSearchInput";
import { SortableHeader } from "@/app/admin/_components/SortableHeader";

interface LlmModelResponse {
  id: string;
  created_datetime_utc: string;
  llm_model_id: number;
  humor_flavor_id: number;
  processing_time_seconds: number;
  llm_temperature: number | null;
  profile_id: string;
  caption_request_id: number;
  llm_prompt_chain_id: number | null;
  humor_flavor_step_id: number | null;
  llm_model_response: string | null;
}

type Props = {
  searchParams: Promise<{ page?: string; request_id?: string; sort?: string; dir?: string }>;
};

const PAGE_SIZE = 50;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "UTC", timeZoneName: "short",
  });
}

export default async function LlmModelResponsesPage({ searchParams }: Props) {
  "use no memo";
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { page: pageParam = "1", request_id = "", sort = "created", dir = "desc" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const columnMap: Record<string, string> = {
    id: "id",
    model: "llm_model_id",
    flavor: "humor_flavor_id",
    step: "humor_flavor_step_id",
    request: "caption_request_id",
    chain: "llm_prompt_chain_id",
    time: "processing_time_seconds",
    temp: "llm_temperature",
    profile: "profile_id",
    created: "created_datetime_utc",
  };
  const sortColumn = columnMap[sort] ?? "created_datetime_utc";

  const supabase = await createClient();
  let query = supabase
    .from("llm_model_responses")
    .select(
      "id, created_datetime_utc, llm_model_id, humor_flavor_id, processing_time_seconds, llm_temperature, profile_id, caption_request_id, llm_prompt_chain_id, humor_flavor_step_id, llm_model_response",
      { count: "exact" }
    )
    .order(sortColumn, { ascending: dir === "asc" })
    .range(from, to);

  if (request_id.trim()) query = query.eq("caption_request_id", request_id.trim());

  const { data: responses, error, count } = await query.returns<LlmModelResponse[]>();
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (request_id) params.set("request_id", request_id);
    if (sort !== "created") params.set("sort", sort);
    if (dir !== "desc") params.set("dir", dir);
    params.set("page", String(p));
    return `/admin/llm-model-responses?${params.toString()}`;
  }

  const preserveParams = { request_id };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">LLM Model Responses</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {(count ?? 0).toLocaleString()} responses total
          </p>
        </div>
        <LiveSearchInput defaultValue={request_id} placeholder="Filter by request ID…" paramName="request_id" />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load responses: {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <SortableHeader column="id" label="ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="model" label="Model" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="flavor" label="Flavor" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="step" label="Step" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="request" label="Request" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="chain" label="Chain" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="time" label="Time (s)" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <SortableHeader column="temp" label="Temp" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="profile" label="Profile" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Response</th>
              <SortableHeader column="created" label="Created" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!responses?.length ? (
              <tr>
                <td colSpan={12} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {request_id ? `No responses for request ${request_id}.` : "No responses found."}
                </td>
              </tr>
            ) : (
              responses.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5">
                    <span title={r.id} className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.id.slice(0, 8)}…</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.llm_model_id}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.humor_flavor_id}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {r.humor_flavor_step_id ?? <span className="text-zinc-400 dark:text-zinc-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.caption_request_id}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {r.llm_prompt_chain_id ?? <span className="text-zinc-400 dark:text-zinc-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-zinc-700 dark:text-zinc-300">{r.processing_time_seconds}</td>
                  <td className="px-5 py-3.5 tabular-nums text-zinc-700 dark:text-zinc-300">
                    {r.llm_temperature ?? <span className="text-zinc-400 dark:text-zinc-500">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span title={r.profile_id} className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.profile_id.slice(0, 8)}…</span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {r.llm_model_response ? (
                      <span title={r.llm_model_response}>
                        {r.llm_model_response.length > 60 ? r.llm_model_response.slice(0, 60) + "…" : r.llm_model_response}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap" suppressHydrationWarning>
                    {formatDate(r.created_datetime_utc)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/llm-model-responses/${r.id}`}
                      className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {(count ?? 0).toLocaleString()} total{request_id ? ` for request ${request_id}` : ""}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">← Prev</Link>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">← Prev</span>
            )}
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Next →</Link>
            ) : (
              <span className="rounded-lg border border-zinc-100 px-3 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-700 dark:text-zinc-600">Next →</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
