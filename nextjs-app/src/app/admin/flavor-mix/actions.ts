"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MixFormState = { error?: string; success?: boolean } | null;

export async function updateFlavorMix(
  _prevState: MixFormState,
  formData: FormData
): Promise<MixFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const supabase = await createClient();

  const updates: { id: number; caption_count: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("caption_count_")) {
      const id = parseInt(key.replace("caption_count_", ""), 10);
      const caption_count = parseInt(value as string, 10);
      if (!isNaN(id) && !isNaN(caption_count) && caption_count >= 0) {
        updates.push({ id, caption_count });
      }
    }
  }

  for (const { id, caption_count } of updates) {
    const { error } = await supabase
      .from("humor_flavor_mix")
      .update({ caption_count })
      .eq("id", id);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/flavor-mix");
  return { success: true };
}
