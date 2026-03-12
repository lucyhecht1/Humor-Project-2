import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import Link from "next/link";
import { createTerm } from "../actions";
import { TermForm } from "../_components/TermForm";

export default async function NewTermPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/terms" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Terms
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">New</span>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">New term</h1>

      <TermForm action={createTerm} />
    </div>
  );
}
