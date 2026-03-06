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
      className="cursor-pointer rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-sm font-medium text-orange-500 transition-colors hover:border-orange-300 hover:bg-orange-100 hover:text-orange-600 active:scale-[0.98]"
    >
      The Room Where It Happens
    </button>
  );
}
