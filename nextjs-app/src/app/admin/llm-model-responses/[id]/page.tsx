import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LlmModelResponse {
  id: string;
  created_datetime_utc: string;
  llm_model_id: number;
  humor_flavor_id: number;
  humor_flavor_step_id: number | null;
  processing_time_seconds: number;
  llm_temperature: number | null;
  profile_id: string;
  caption_request_id: number;
  llm_prompt_chain_id: number | null;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_model_response: string | null;
}

type Props = { params: Promise<{ id: string }> };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "UTC", timeZoneName: "short",
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm text-zinc-800 dark:text-zinc-200">{value}</dd>
    </div>
  );
}

function PromptBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</p>
      <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {value}
      </pre>
    </div>
  );
}

export default async function LlmModelResponseDetailPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const { data: response } = await supabase
    .from("llm_model_responses")
    .select("id, created_datetime_utc, llm_model_id, humor_flavor_id, humor_flavor_step_id, processing_time_seconds, llm_temperature, profile_id, caption_request_id, llm_prompt_chain_id, llm_system_prompt, llm_user_prompt, llm_model_response")
    .eq("id", id)
    .single<LlmModelResponse>();

  if (!response) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/llm-model-responses" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          LLM Model Responses
        </Link>
        <span>/</span>
        <span className="font-mono text-zinc-900 dark:text-zinc-50">{response.id.slice(0, 8)}…</span>
      </div>

      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Response detail</h1>

      {/* Metadata */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="ID" value={<span className="font-mono text-xs" title={response.id}>{response.id.slice(0, 16)}…</span>} />
          <Field label="Created" value={<span suppressHydrationWarning>{formatDate(response.created_datetime_utc)}</span>} />
          <Field label="Model ID" value={response.llm_model_id} />
          <Field label="Flavor ID" value={response.humor_flavor_id} />
          <Field label="Step ID" value={response.humor_flavor_step_id ?? "—"} />
          <Field label="Request ID" value={response.caption_request_id} />
          <Field label="Chain ID" value={response.llm_prompt_chain_id ?? "—"} />
          <Field label="Processing time" value={`${response.processing_time_seconds}s`} />
          <Field label="Temperature" value={response.llm_temperature ?? "—"} />
          <Field label="Profile" value={<span className="font-mono text-xs" title={response.profile_id}>{response.profile_id.slice(0, 16)}…</span>} />
        </dl>
      </div>

      {/* Prompts + response */}
      <div className="space-y-5">
        <PromptBlock label="System prompt" value={response.llm_system_prompt} />
        <PromptBlock label="User prompt" value={response.llm_user_prompt} />
        <PromptBlock label="Model response" value={response.llm_model_response ?? "(empty)"} />
      </div>
    </div>
  );
}
