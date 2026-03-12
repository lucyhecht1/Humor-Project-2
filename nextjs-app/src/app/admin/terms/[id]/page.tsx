import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTerm } from "../actions";
import { TermForm } from "../_components/TermForm";

interface Term {
  id: number;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
}

type Props = { params: Promise<{ id: string }> };

export default async function EditTermPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const { data: term } = await supabase
    .from("terms")
    .select("id, term, definition, example, priority, term_type_id")
    .eq("id", id)
    .single<Term>();

  if (!term) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/terms" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Terms
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{term.term}</span>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit term</h1>

      <TermForm action={updateTerm} defaultValues={term} />
    </div>
  );
}
