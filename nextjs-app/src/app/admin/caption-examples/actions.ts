"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type CaptionExampleFormState = { error: string } | null;

function parseFormData(formData: FormData) {
  const image_id = (formData.get("image_id") as string).trim() || null;
  return {
    image_description: (formData.get("image_description") as string).trim(),
    caption: (formData.get("caption") as string).trim(),
    explanation: (formData.get("explanation") as string).trim(),
    priority: parseInt(formData.get("priority") as string, 10),
    image_id,
  };
}

export async function createCaptionExample(
  _prevState: CaptionExampleFormState,
  formData: FormData
): Promise<CaptionExampleFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const payload = parseFormData(formData);
  if (!payload.image_description) return { error: "Image description is required." };
  if (!payload.caption) return { error: "Caption is required." };
  if (!payload.explanation) return { error: "Explanation is required." };
  if (isNaN(payload.priority)) return { error: "Priority is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("caption_examples").insert(payload);
  if (error) return { error: error.message };

  redirect("/admin/caption-examples");
}

export async function updateCaptionExample(
  _prevState: CaptionExampleFormState,
  formData: FormData
): Promise<CaptionExampleFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing ID." };

  const payload = parseFormData(formData);
  if (!payload.image_description) return { error: "Image description is required." };
  if (!payload.caption) return { error: "Caption is required." };
  if (!payload.explanation) return { error: "Explanation is required." };
  if (isNaN(payload.priority)) return { error: "Priority is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("caption_examples")
    .update({ ...payload, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  redirect("/admin/caption-examples");
}

export async function deleteCaptionExample(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/caption-examples");
}
