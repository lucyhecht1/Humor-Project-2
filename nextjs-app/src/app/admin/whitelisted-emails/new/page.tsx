import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import Link from "next/link";
import { createEmail } from "../actions";
import { EmailForm } from "../_components/EmailForm";

export default async function NewEmailPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/whitelisted-emails" className="hover:text-zinc-700 dark:hover:text-zinc-200">Whitelisted Emails</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">New</span>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Add email</h1>
      <EmailForm action={createEmail} />
    </div>
  );
}
