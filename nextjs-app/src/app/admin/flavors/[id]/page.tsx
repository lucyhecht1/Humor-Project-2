import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface HumorFlavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

interface HumorFlavorStep {
  id: number;
  order_by: number;
  description: string | null;
  humor_flavor_step_type_id: number;
  llm_model_id: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_temperature: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  created_datetime_utc: string;
}

type Props = { params: Promise<{ id: string }> };

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function Prompt({ label, value }: { label: string; value: string | null }) {
  if (!value) return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">—</p>
    </div>
  );
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {value}
      </pre>
    </div>
  );
}

export default async function FlavorDetailPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const flavorId = parseInt(id, 10);
  if (isNaN(flavorId)) notFound();

  const supabase = await createClient();

  const [{ data: flavor }, { data: steps }] = await Promise.all([
    supabase
      .from("humor_flavors")
      .select("id, slug, description, created_datetime_utc")
      .eq("id", flavorId)
      .single<HumorFlavor>(),
    supabase
      .from("humor_flavor_steps")
      .select("id, order_by, description, humor_flavor_step_type_id, llm_model_id, llm_input_type_id, llm_output_type_id, llm_temperature, llm_system_prompt, llm_user_prompt, created_datetime_utc")
      .eq("humor_flavor_id", flavorId)
      .order("order_by")
      .returns<HumorFlavorStep[]>(),
  ]);

  if (!flavor) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/flavors" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Flavors
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{flavor.slug}</span>
      </div>

      {/* Flavor info */}
      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {flavor.slug}
        </h1>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">ID</dt>
            <dd className="mt-1 font-mono text-sm text-zinc-700 dark:text-zinc-300">{flavor.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Created</dt>
            <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{formatDate(flavor.created_datetime_utc)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Description</dt>
            <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              {flavor.description ?? <span className="text-zinc-400 dark:text-zinc-500">—</span>}
            </dd>
          </div>
        </dl>
      </div>

      {/* Steps */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Steps{" "}
          <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-sm font-normal text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {steps?.length ?? 0}
          </span>
        </h2>

        {!steps?.length ? (
          <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No steps for this flavor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Step header */}
                <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {step.order_by}
                  </span>
                  {step.description && (
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {step.description}
                    </span>
                  )}
                  <div className="ml-auto flex flex-wrap gap-2">
                    <Badge label="Step type" value={step.humor_flavor_step_type_id} />
                    <Badge label="Model" value={step.llm_model_id} />
                    <Badge label="In" value={step.llm_input_type_id} />
                    <Badge label="Out" value={step.llm_output_type_id} />
                    {step.llm_temperature != null && (
                      <Badge label="Temp" value={step.llm_temperature} />
                    )}
                  </div>
                </div>

                {/* Prompts */}
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <Prompt label="System prompt" value={step.llm_system_prompt} />
                  <Prompt label="User prompt" value={step.llm_user_prompt} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      <span className="font-medium">{label}</span>
      <span className="font-mono">{value}</span>
    </span>
  );
}
