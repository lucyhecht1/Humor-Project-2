import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProvider } from "../actions";
import { ProviderForm } from "../_components/ProviderForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProviderPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();
  const { data: provider } = await supabase
    .from("llm_providers")
    .select("id, name")
    .eq("id", id)
    .single<{ id: number; name: string }>();

  if (!provider) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/llm-providers" className="hover:text-zinc-700 dark:hover:text-zinc-200">LLM Providers</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{provider.name}</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit provider</h1>
      <ProviderForm action={updateProvider} defaultValues={provider} />
    </div>
  );
}
