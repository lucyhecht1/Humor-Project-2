"use client";

import { usePathname } from "next/navigation";

export const thClass = "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";

interface Props {
  column: string;
  label: string;
  currentSort: string;
  currentDir: string;
  defaultDir?: "asc" | "desc";
  /** Any extra URL params to preserve (e.g. search query, filters) */
  preserveParams?: Record<string, string>;
}

export function SortableHeader({ column, label, currentSort, currentDir, defaultDir = "asc", preserveParams }: Props) {
  "use no memo";
  const pathname = usePathname();

  const isActive = currentSort === column;
  const nextDir: "asc" | "desc" = isActive
    ? currentDir === "asc" ? "desc" : "asc"
    : defaultDir;

  const params = new URLSearchParams();
  if (preserveParams) {
    for (const [key, value] of Object.entries(preserveParams)) {
      if (value) params.set(key, value);
    }
  }
  params.set("sort", column);
  params.set("dir", nextDir);
  const href = `${pathname}?${params.toString()}`;

  return (
    <th className={thClass}>
      <a href={href} className="inline-flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
        {label}
        <span className="text-[10px] leading-none">
          {isActive
            ? currentDir === "asc" ? "▲" : "▼"
            : <span className="opacity-30">▲</span>}
        </span>
      </a>
    </th>
  );
}
