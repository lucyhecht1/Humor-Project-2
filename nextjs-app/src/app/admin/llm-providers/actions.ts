"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ProviderFormState = { error: string } | null;

export async function createProvider(
  _prevState: ProviderFormState,
  formData: FormData
): Promise<ProviderFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const name = (formData.get("name") as string).trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").insert({
    name,
    created_by_user_id: result.profile.id,
    modified_by_user_id: result.profile.id,
  });
  if (error) return { error: error.message };

  redirect("/admin/llm-providers");
}

export async function updateProvider(
  _prevState: ProviderFormState,
  formData: FormData
): Promise<ProviderFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing ID." };

  const name = (formData.get("name") as string).trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("llm_providers")
    .update({ name, modified_by_user_id: result.profile.id })
    .eq("id", id);
  if (error) return { error: error.message };

  redirect("/admin/llm-providers");
}

export async function deleteProvider(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/llm-providers");
}
