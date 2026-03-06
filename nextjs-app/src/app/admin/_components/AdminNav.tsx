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
    <nav className="flex flex-col gap-0.5 py-2" aria-label="Admin sections">
      <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
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
                ? "flex items-center rounded-lg border-l-2 border-white bg-zinc-800 py-2.5 pl-3 pr-3 text-sm font-medium text-white"
                : "flex items-center rounded-lg border-l-2 border-transparent py-2.5 pl-3 pr-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
