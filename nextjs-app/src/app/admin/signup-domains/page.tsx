import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { InlineDeleteButton } from "./_components/InlineDeleteButton";
import { LiveSearchInput } from "@/app/admin/_components/LiveSearchInput";
import { SortableHeader } from "@/app/admin/_components/SortableHeader";
import { DomainStats } from "./_components/DomainStats";

interface AllowedSignupDomain {
  id: number;
  apex_domain: string;
  created_datetime_utc: string;
}

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; dir?: string }>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default async function SignupDomainsPage({ searchParams }: Props) {
  "use no memo";
  const result = await requireSuperadmin();
  if (!result.authorized) return null;

  const { q = "", sort = "domain", dir = "asc" } = await searchParams;

  const columnMap: Record<string, string> = {
    id: "id",
    domain: "apex_domain",
    created: "created_datetime_utc",
  };
  const sortColumn = columnMap[sort] ?? "apex_domain";

  const supabase = await createClient();
  let query = supabase
    .from("allowed_signup_domains")
    .select("id, apex_domain, created_datetime_utc", { count: "exact" })
    .order(sortColumn, { ascending: dir === "asc" });

  if (q.trim()) query = query.ilike("apex_domain", `%${q.trim()}%`);

  const { data: domains, error, count } = await query.returns<AllowedSignupDomain[]>();

  const preserveParams = { q };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Allowed Signup Domains</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {(count ?? 0)} domains{q ? " matching" : " total"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveSearchInput defaultValue={q} placeholder="Search domains…" />
          <Link href="/admin/signup-domains/new" className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            + Add domain
          </Link>
        </div>
      </div>

      <DomainStats />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          Failed to load domains: {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <SortableHeader column="id" label="ID" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="domain" label="Domain" currentSort={sort} currentDir={dir} defaultDir="asc" preserveParams={preserveParams} />
              <SortableHeader column="created" label="Added" currentSort={sort} currentDir={dir} defaultDir="desc" preserveParams={preserveParams} />
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!domains?.length ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {q ? `No domains matching "${q}".` : "No domains found."}
                </td>
              </tr>
            ) : (
              domains.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{d.id}</td>
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{d.apex_domain}</td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(d.created_datetime_utc)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/signup-domains/${d.id}`} className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Edit</Link>
                      <InlineDeleteButton id={d.id} label={d.apex_domain} />
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
