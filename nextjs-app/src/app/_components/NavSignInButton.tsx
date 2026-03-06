"use client";

import { createClient } from "@/lib/supabase/client";

export function NavSignInButton() {
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer rounded-full border border-green-200 bg-green-50/80 px-4 py-1.5 text-sm font-medium text-green-700 transition-colors hover:border-green-300 hover:bg-green-100 active:scale-[0.98]"
    >
      The Room Where It Happens
    </button>
  );
}
