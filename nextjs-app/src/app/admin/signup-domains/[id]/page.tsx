import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateDomain } from "../actions";
import { DomainForm } from "../_components/DomainForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditDomainPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();
  const { data: domain } = await supabase
    .from("allowed_signup_domains")
    .select("id, apex_domain")
    .eq("id", id)
    .single<{ id: number; apex_domain: string }>();

  if (!domain) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/signup-domains" className="hover:text-zinc-700 dark:hover:text-zinc-200">Signup Domains</Link>
        <span>/</span>
        <span className="font-mono text-zinc-900 dark:text-zinc-50">{domain.apex_domain}</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit domain</h1>
      <DomainForm action={updateDomain} defaultValues={domain} />
    </div>
  );
}
