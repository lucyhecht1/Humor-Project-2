import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import Link from "next/link";
import { createCaptionExample } from "../actions";
import { CaptionExampleForm } from "../_components/CaptionExampleForm";

export default async function NewCaptionExamplePage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/caption-examples" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Caption Examples
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">New</span>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">New caption example</h1>

      <CaptionExampleForm action={createCaptionExample} />
    </div>
  );
}
