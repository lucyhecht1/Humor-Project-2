"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ModelFormState } from "../actions";

interface Provider {
  id: number;
  name: string;
}

interface Defaults {
  id?: number;
  name?: string;
  llm_provider_id?: number;
  provider_model_id?: string;
  is_temperature_supported?: boolean;
}

interface Props {
  action: (prevState: ModelFormState, formData: FormData) => Promise<ModelFormState>;
  defaultValues?: Defaults;
  providers: Provider[];
}

export function ModelForm({ action, defaultValues = {}, providers }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      )}

      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaultValues.name ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="e.g. GPT-4o"
        />
      </div>

      {/* Provider */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Provider <span className="text-red-500">*</span>
        </label>
        <select
          name="llm_provider_id"
          required
          defaultValue={defaultValues.llm_provider_id ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">— Select provider —</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Provider model ID */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Provider model ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="provider_model_id"
          required
          defaultValue={defaultValues.provider_model_id ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 font-mono placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="e.g. gpt-4o-2024-08-06"
        />
      </div>

      {/* Temperature */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Flags</legend>
        <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="is_temperature_supported"
            defaultChecked={defaultValues.is_temperature_supported ?? false}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-50"
          />
          Temperature supported
        </label>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <Link href="/admin/llm-models" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          Cancel
        </Link>
      </div>
    </form>
  );
}
