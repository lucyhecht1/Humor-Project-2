import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import Link from "next/link";
import { createDomain } from "../actions";
import { DomainForm } from "../_components/DomainForm";

export default async function NewDomainPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/signup-domains" className="hover:text-zinc-700 dark:hover:text-zinc-200">Signup Domains</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">New</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Add domain</h1>
      <DomainForm action={createDomain} />
    </div>
  );
}
