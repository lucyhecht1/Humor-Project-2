"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

interface Props {
  imageId: string;
  profileId: string;
}

export function FilterBar({ imageId, profileId }: Props) {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const img = imageRef.current?.value.trim() ?? "";
    const prof = profileRef.current?.value.trim() ?? "";
    if (img) params.set("image_id", img);
    if (prof) params.set("profile_id", prof);
    const qs = params.toString();
    router.push(qs ? `/admin/captions?${qs}` : "/admin/captions");
  }

  function handleClear() {
    router.push("/admin/captions");
  }

  const hasFilters = imageId || profileId;

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        ref={imageRef}
        type="text"
        defaultValue={imageId}
        placeholder="Filter by image ID…"
        className="h-10 w-64 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
      />
      <input
        ref={profileRef}
        type="text"
        defaultValue={profileId}
        placeholder="Filter by profile ID…"
        className="h-10 w-64 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
      />
      <button
        type="submit"
        className="h-10 cursor-pointer rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Filter
      </button>
      <button
        type="button"
        onClick={handleClear}
        className={`h-10 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${hasFilters ? "" : "pointer-events-none invisible"}`}
      >
        Clear
      </button>
    </form>
  );
}
