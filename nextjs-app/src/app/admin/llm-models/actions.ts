"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ModelFormState = { error: string } | null;

function parseFormData(formData: FormData) {
  return {
    name: (formData.get("name") as string).trim(),
    llm_provider_id: parseInt(formData.get("llm_provider_id") as string, 10),
    provider_model_id: (formData.get("provider_model_id") as string).trim(),
    is_temperature_supported: formData.get("is_temperature_supported") === "on",
  };
}

export async function createModel(
  _prevState: ModelFormState,
  formData: FormData
): Promise<ModelFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const payload = parseFormData(formData);
  if (!payload.name) return { error: "Name is required." };
  if (isNaN(payload.llm_provider_id)) return { error: "Provider is required." };
  if (!payload.provider_model_id) return { error: "Provider model ID is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").insert(payload);
  if (error) return { error: error.message };

  redirect("/admin/llm-models");
}

export async function updateModel(
  _prevState: ModelFormState,
  formData: FormData
): Promise<ModelFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing ID." };

  const payload = parseFormData(formData);
  if (!payload.name) return { error: "Name is required." };
  if (isNaN(payload.llm_provider_id)) return { error: "Provider is required." };
  if (!payload.provider_model_id) return { error: "Provider model ID is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").update(payload).eq("id", id);
  if (error) return { error: error.message };

  redirect("/admin/llm-models");
}

export async function deleteModel(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/llm-models");
}
