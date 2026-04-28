"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Props {
  imageId: string;
  profileId: string;
}

export function FilterBar({ imageId, profileId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const imageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imageVal, setImageVal] = useState(imageId);
  const [profileVal, setProfileVal] = useState(profileId);

  function pushParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v.trim()) params.set(k, v.trim());
      else params.delete(k);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setImageVal(val);
    if (imageTimer.current) clearTimeout(imageTimer.current);
    imageTimer.current = setTimeout(() => {
      if (!val || UUID_RE.test(val)) pushParams({ image_id: val });
    }, 300);
  }

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setProfileVal(val);
    if (profileTimer.current) clearTimeout(profileTimer.current);
    profileTimer.current = setTimeout(() => {
      if (!val || UUID_RE.test(val)) pushParams({ profile_id: val });
    }, 300);
  }

  function handleClear() {
    setImageVal("");
    setProfileVal("");
    router.push(pathname, { scroll: false });
  }

  const hasFilters = imageVal || profileVal;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={imageVal}
        onChange={handleImageChange}
        placeholder="Image UUID (full ID required)"
        className="h-10 w-72 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
      />
      <input
        type="text"
        value={profileVal}
        onChange={handleProfileChange}
        placeholder="Profile UUID (full ID required)"
        className="h-10 w-72 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
      />
      <button
        type="button"
        onClick={handleClear}
        className={`h-10 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${hasFilters ? "" : "pointer-events-none invisible"}`}
      >
        Clear
      </button>
    </div>
  );
}
