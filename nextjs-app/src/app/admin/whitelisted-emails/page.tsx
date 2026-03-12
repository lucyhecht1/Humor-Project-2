import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteEmailButton } from "./_components/DeleteEmailButton";

interface WhitelistedEmail {
  id: number;
  email_address: string;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function WhitelistedEmailsPage() {
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const supabase = await createClient();
  const { data: emails, error } = await supabase
    .from("whitelist_email_addresses")
    .select("id, email_address, created_datetime_utc, modified_datetime_utc")
    .order("email_address")
    .returns<WhitelistedEmail[]>();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Whitelisted Emails</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{(emails?.length ?? 0)} addresses total</p>
        </div>
        <Link href="/admin/whitelisted-emails/new" className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          + Add email
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load emails: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">ID</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Added</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Modified</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!emails?.length ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">No whitelisted emails found.</td>
              </tr>
            ) : (
              emails.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{e.id}</td>
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{e.email_address}</td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(e.created_datetime_utc)}</td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {e.modified_datetime_utc ? formatDate(e.modified_datetime_utc) : <span className="text-zinc-400 dark:text-zinc-500">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/whitelisted-emails/${e.id}`} className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Edit</Link>
                      <DeleteEmailButton id={e.id} email={e.email_address} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
