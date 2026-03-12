import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import Link from "next/link";
import { createProvider } from "../actions";
import { ProviderForm } from "../_components/ProviderForm";

export default async function NewProviderPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/llm-providers" className="hover:text-zinc-700 dark:hover:text-zinc-200">LLM Providers</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">New</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">New provider</h1>
      <ProviderForm action={createProvider} />
    </div>
  );
}
