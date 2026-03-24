"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ImageFormState = { error: string } | { success: true } | null;

const STORAGE_BUCKET = "images";

async function resolveUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
    if (error) return { error: `Upload failed: ${error.message}` };
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  }
  const url = ((formData.get("url") as string) ?? "").trim();
  if (!url) return { error: "Please enter a URL or upload an image file." };
  return { url };
}

function parseFormData(formData: FormData, url: string) {
  return {
    url,
    profile_id: (formData.get("profile_id") as string) || null,
    is_public: formData.get("is_public") === "on",
    is_common_use: formData.get("is_common_use") === "on",
    additional_context: ((formData.get("additional_context") as string) ?? "").trim() || null,
    image_description: ((formData.get("image_description") as string) ?? "").trim() || null,
  };
}

export async function createImage(
  _prevState: ImageFormState,
  formData: FormData
): Promise<ImageFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const supabase = await createClient();
  const urlResult = await resolveUrl(supabase, formData);
  if ("error" in urlResult) return { error: urlResult.error };

  const payload = parseFormData(formData, urlResult.url);
  // RLS requires profile_id = auth.uid() for inserts
  payload.profile_id = result.user.id;
  const { error } = await supabase.from("images").insert({
    ...payload,
    created_by_user_id: result.profile.id,
    modified_by_user_id: result.profile.id,
  });
  if (error) return { error: error.message };

  redirect("/admin/images");
}

export async function updateImage(
  _prevState: ImageFormState,
  formData: FormData
): Promise<ImageFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing image ID." };

  const supabase = await createClient();
  const urlResult = await resolveUrl(supabase, formData);
  if ("error" in urlResult) return { error: urlResult.error };

  const payload = parseFormData(formData, urlResult.url);
  const { error } = await supabase
    .from("images")
    .update({ ...payload, modified_by_user_id: result.profile.id })
    .eq("id", id);
  if (error) return { error: error.message };

  return { success: true as const };
}

export async function deleteImage(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing image ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/images");
}
