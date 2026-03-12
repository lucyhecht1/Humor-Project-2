"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { CaptionExampleFormState } from "../actions";

interface Defaults {
  id?: number;
  image_description?: string;
  caption?: string;
  explanation?: string;
  priority?: number;
  image_id?: string | null;
}

interface Props {
  action: (prevState: CaptionExampleFormState, formData: FormData) => Promise<CaptionExampleFormState>;
  defaultValues?: Defaults;
}

export function CaptionExampleForm({ action, defaultValues = {} }: Props) {
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

      {/* Image description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Image description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="image_description"
          required
          rows={3}
          defaultValue={defaultValues.image_description ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Describe the image"
        />
      </div>

      {/* Caption */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Caption <span className="text-red-500">*</span>
        </label>
        <textarea
          name="caption"
          required
          rows={3}
          defaultValue={defaultValues.caption ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="The example caption"
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Explanation <span className="text-red-500">*</span>
        </label>
        <textarea
          name="explanation"
          required
          rows={4}
          defaultValue={defaultValues.explanation ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Why this caption works"
        />
      </div>

      {/* Priority + Image ID */}
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
            Image ID
          </label>
          <input
            type="text"
            name="image_id"
            defaultValue={defaultValues.image_id ?? ""}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
            placeholder="UUID (optional)"
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
          href="/admin/caption-examples"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
