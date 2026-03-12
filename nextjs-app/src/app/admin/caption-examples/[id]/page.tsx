import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCaptionExample } from "../actions";
import { CaptionExampleForm } from "../_components/CaptionExampleForm";

interface CaptionExample {
  id: number;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
}

type Props = { params: Promise<{ id: string }> };

export default async function EditCaptionExamplePage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();

  const { data: example } = await supabase
    .from("caption_examples")
    .select("id, image_description, caption, explanation, priority, image_id")
    .eq("id", id)
    .single<CaptionExample>();

  if (!example) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/caption-examples" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Caption Examples
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">#{example.id}</span>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit caption example</h1>

      <CaptionExampleForm action={updateCaptionExample} defaultValues={example} />
    </div>
  );
}
