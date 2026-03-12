import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createModel } from "../actions";
import { ModelForm } from "../_components/ModelForm";

export default async function NewModelPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: providers } = await supabase
    .from("llm_providers")
    .select("id, name")
    .order("name")
    .returns<{ id: number; name: string }[]>();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/llm-models" className="hover:text-zinc-700 dark:hover:text-zinc-200">LLM Models</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">New</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">New model</h1>
      <ModelForm action={createModel} providers={providers ?? []} />
    </div>
  );
}
