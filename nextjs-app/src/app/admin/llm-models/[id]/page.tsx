import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateModel } from "../actions";
import { ModelForm } from "../_components/ModelForm";

interface LlmModel {
  id: number;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
}

type Props = { params: Promise<{ id: string }> };

export default async function EditModelPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: model }, { data: providers }] = await Promise.all([
    supabase
      .from("llm_models")
      .select("id, name, llm_provider_id, provider_model_id, is_temperature_supported")
      .eq("id", id)
      .single<LlmModel>(),
    supabase
      .from("llm_providers")
      .select("id, name")
      .order("name")
      .returns<{ id: number; name: string }[]>(),
  ]);

  if (!model) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/llm-models" className="hover:text-zinc-700 dark:hover:text-zinc-200">LLM Models</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{model.name}</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit model</h1>
      <ModelForm action={updateModel} defaultValues={model} providers={providers ?? []} />
    </div>
  );
}
