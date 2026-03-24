"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ImageFormState } from "../actions";

interface ProfileOption {
  id: string;
  email: string;
}

interface ImageDefaults {
  id?: string;
  url?: string;
  profile_id?: string | null;
  is_public?: boolean;
  is_common_use?: boolean;
  additional_context?: string | null;
  image_description?: string | null;
}

interface Props {
  action: (prevState: ImageFormState, formData: FormData) => Promise<ImageFormState>;
  defaultValues?: ImageDefaults;
  profiles: ProfileOption[];
  onSuccess?: () => void;
}

export function ImageForm({ action, defaultValues = {}, profiles, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [inputMode, setInputMode] = useState<"url" | "file">("url");
  const [previewUrl, setPreviewUrl] = useState(defaultValues.url ?? "");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const router = useRouter();

  const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

  useEffect(() => {
    if (state && "success" in state) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/images");
      }
    }
  }, [state, onSuccess, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_BYTES) {
        setFileSizeError("Image is too big — please try a smaller file (under 4 MB).");
        setFilePreview(null);
        e.target.value = "";
        return;
      }
      setFileSizeError(null);
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(objectUrl);
    } else {
      setFileSizeError(null);
      setFilePreview(null);
    }
  }

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {/* Hidden id for update */}
      {defaultValues.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {state && "error" in state && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      )}

      {/* Input mode tabs */}
      <div>
        <div className="mb-3 flex w-fit rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setInputMode("url")}
            className={
              inputMode === "url"
                ? "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-zinc-900 bg-white shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }
          >
            Enter URL
          </button>
          <button
            type="button"
            onClick={() => setInputMode("file")}
            className={
              inputMode === "file"
                ? "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-zinc-900 bg-white shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }
          >
            Upload File
          </button>
        </div>

        {inputMode === "url" ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="url"
              required
              defaultValue={defaultValues.url ?? ""}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="https://example.com/image.jpg"
            />
            {previewUrl && (
              <div className="mt-2 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-40 w-full object-contain bg-zinc-50 dark:bg-zinc-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Image file <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="file"
              required
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:file:bg-zinc-800 dark:file:text-zinc-300"
            />
            {fileSizeError && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fileSizeError}</p>
            )}
            {filePreview && (
              <div className="mt-2 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filePreview}
                  alt="Preview"
                  className="h-40 w-full object-contain bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Profile
        </label>
        <select
          name="profile_id"
          defaultValue={defaultValues.profile_id ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">— None —</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.email} ({p.id.slice(0, 8)}…)
            </option>
          ))}
        </select>
      </div>

      {/* Checkboxes */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Flags
        </legend>
        <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={defaultValues.is_public ?? false}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-50"
          />
          Public
        </label>
        <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="is_common_use"
            defaultChecked={defaultValues.is_common_use ?? false}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-50"
          />
          Common use
        </label>
      </fieldset>

      {/* Additional context */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Additional context
        </label>
        <input
          type="text"
          name="additional_context"
          defaultValue={defaultValues.additional_context ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Optional"
        />
      </div>

      {/* Image description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Image description
        </label>
        <textarea
          name="image_description"
          rows={4}
          defaultValue={defaultValues.image_description ?? ""}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Optional"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !!fileSizeError}
          className="cursor-pointer rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {onSuccess ? (
          <button
            type="button"
            onClick={onSuccess}
            className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Cancel
          </button>
        ) : (
          <Link
            href="/admin/images"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
