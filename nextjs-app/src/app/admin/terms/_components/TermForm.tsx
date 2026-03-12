"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { TermFormState } from "../actions";

interface TermDefaults {
  id?: number;
  term?: string;
  definition?: string;
  example?: string;
  priority?: number;
  term_type_id?: number | null;
}

interface Props {
  action: (prevState: TermFormState, formData: FormData) => Promise<TermFormState>;
  defaultValues?: TermDefaults;
}

export function TermForm({ action, defaultValues = {} }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {defaultValues.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      )}

      {/* Term */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Term <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="term"
          required
          defaultValue={defaultValues.term ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="e.g. Sarcasm"
        />
      </div>

      {/* Definition */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Definition <span className="text-red-500">*</span>
        </label>
        <textarea
          name="definition"
          required
          rows={4}
          defaultValue={defaultValues.definition ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="What does this term mean?"
        />
      </div>

      {/* Example */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Example <span className="text-red-500">*</span>
        </label>
        <textarea
          name="example"
          required
          rows={3}
          defaultValue={defaultValues.example ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="A usage example"
        />
      </div>

      {/* Priority + Term type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Priority <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="priority"
            required
            defaultValue={defaultValues.priority ?? ""}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Term type ID
          </label>
          <input
            type="number"
            name="term_type_id"
            defaultValue={defaultValues.term_type_id ?? ""}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <Link
          href="/admin/terms"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
