"use client";

import { useActionState } from "react";
import { updateFlavorMix, type MixFormState } from "../actions";

interface MixRow {
  id: number;
  caption_count: number;
  humor_flavor_id: number;
  humor_flavors: { slug: string } | null;
}

export function FlavorMixForm({ rows }: { rows: MixRow[] }) {
  const [state, formAction, isPending] = useActionState<MixFormState, FormData>(
    updateFlavorMix,
    null
  );

  const total = rows.reduce((sum, r) => sum + r.caption_count, 0);

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400">
          Mix updated successfully.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                ID
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Flavor
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Caption Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!rows.length ? (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No mix entries found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {row.id}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">
                    {row.humor_flavors?.slug ?? (
                      <span className="font-normal text-zinc-400 dark:text-zinc-500">
                        flavor #{row.humor_flavor_id}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <input
                      type="number"
                      name={`caption_count_${row.id}`}
                      defaultValue={row.caption_count}
                      min={0}
                      required
                      className="w-24 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 tabular-nums focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
                <td colSpan={2} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Total
                </td>
                <td className="px-5 py-3 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {total}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {rows.length > 0 && (
        <div className="mt-4">
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </form>
  );
}
