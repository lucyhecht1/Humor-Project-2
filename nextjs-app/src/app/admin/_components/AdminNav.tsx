"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Content",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
    ],
  },
  {
    label: "Humor",
    links: [
      { href: "/admin/flavors", label: "Flavors" },
      { href: "/admin/flavor-mix", label: "Flavor Mix" },
      { href: "/admin/terms", label: "Terms" },
      { href: "/admin/caption-requests", label: "Caption Requests" },
      { href: "/admin/caption-examples", label: "Caption Examples" },
    ],
  },
  {
    label: "LLM",
    links: [
      { href: "/admin/llm-providers", label: "Providers" },
      { href: "/admin/llm-models", label: "Models" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-model-responses", label: "Responses" },
    ],
  },
  {
    label: "Access",
    links: [
      { href: "/admin/signup-domains", label: "Signup Domains" },
      { href: "/admin/whitelisted-emails", label: "Whitelisted Emails" },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 py-3" aria-label="Admin navigation">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "flex items-center gap-2.5 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white"
                      : "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
                  }
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70 flex-shrink-0" />
                  )}
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
