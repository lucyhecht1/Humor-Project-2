"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/captions", label: "Captions" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Admin sections">
      <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Sections
      </p>
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "rounded-lg bg-zinc-100 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
