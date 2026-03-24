"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type DomainFormState = { error: string } | null;

export async function createDomain(
  _prevState: DomainFormState,
  formData: FormData
): Promise<DomainFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const apex_domain = (formData.get("apex_domain") as string).trim().toLowerCase();
  if (!apex_domain) return { error: "Domain is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("allowed_signup_domains").insert({
    apex_domain,
    created_by_user_id: result.profile.id,
    modified_by_user_id: result.profile.id,
  });
  if (error) return { error: error.message };

  redirect("/admin/signup-domains");
}

export async function updateDomain(
  _prevState: DomainFormState,
  formData: FormData
): Promise<DomainFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing ID." };

  const apex_domain = (formData.get("apex_domain") as string).trim().toLowerCase();
  if (!apex_domain) return { error: "Domain is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("allowed_signup_domains")
    .update({ apex_domain, modified_by_user_id: result.profile.id })
    .eq("id", id);
  if (error) return { error: error.message };

  redirect("/admin/signup-domains");
}

export async function deleteDomain(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/signup-domains");
}
