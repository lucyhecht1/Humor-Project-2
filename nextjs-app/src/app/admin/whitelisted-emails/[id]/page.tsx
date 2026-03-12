import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateEmail } from "../actions";
import { EmailForm } from "../_components/EmailForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditEmailPage({ params }: Props) {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { id } = await params;
  const supabase = await createClient();
  const { data: email } = await supabase
    .from("whitelist_email_addresses")
    .select("id, email_address")
    .eq("id", id)
    .single<{ id: number; email_address: string }>();

  if (!email) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/whitelisted-emails" className="hover:text-zinc-700 dark:hover:text-zinc-200">Whitelisted Emails</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{email.email_address}</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit email</h1>
      <EmailForm action={updateEmail} defaultValues={email} />
    </div>
  );
}
