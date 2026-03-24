"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type TermFormState = { error: string } | null;

function parseFormData(formData: FormData) {
  return {
    term: (formData.get("term") as string).trim(),
    definition: (formData.get("definition") as string).trim(),
    example: (formData.get("example") as string).trim(),
    priority: parseInt(formData.get("priority") as string, 10),
    term_type_id: parseInt(formData.get("term_type_id") as string, 10) || null,
  };
}

export async function createTerm(
  _prevState: TermFormState,
  formData: FormData
): Promise<TermFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const payload = parseFormData(formData);
  if (!payload.term) return { error: "Term is required." };
  if (!payload.definition) return { error: "Definition is required." };
  if (!payload.example) return { error: "Example is required." };
  if (isNaN(payload.priority)) return { error: "Priority is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("terms").insert({
    ...payload,
    created_by_user_id: result.profile.id,
    modified_by_user_id: result.profile.id,
  });
  if (error) return { error: error.message };

  redirect("/admin/terms");
}

export async function updateTerm(
  _prevState: TermFormState,
  formData: FormData
): Promise<TermFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing term ID." };

  const payload = parseFormData(formData);
  if (!payload.term) return { error: "Term is required." };
  if (!payload.definition) return { error: "Definition is required." };
  if (!payload.example) return { error: "Example is required." };
  if (isNaN(payload.priority)) return { error: "Priority is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("terms")
    .update({ ...payload, modified_by_user_id: result.profile.id })
    .eq("id", id);
  if (error) return { error: error.message };

  redirect("/admin/terms");
}

export async function deleteTerm(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing term ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/terms");
}
