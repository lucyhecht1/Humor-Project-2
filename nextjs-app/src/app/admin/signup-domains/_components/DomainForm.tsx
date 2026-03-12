"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { DomainFormState } from "../actions";

interface Props {
  action: (prevState: DomainFormState, formData: FormData) => Promise<DomainFormState>;
  defaultValues?: { id?: number; apex_domain?: string };
}

export function DomainForm({ action, defaultValues = {} }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-sm space-y-6">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">{state.error}</p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Apex domain <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="apex_domain"
          required
          defaultValue={defaultValues.apex_domain ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 font-mono placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="example.com"
        />
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">Enter without http:// or www. prefix.</p>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className="cursor-pointer rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          {isPending ? "Saving…" : "Save"}
        </button>
        <Link href="/admin/signup-domains" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Cancel</Link>
      </div>
    </form>
  );
}
