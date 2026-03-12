"use server";

import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type EmailFormState = { error: string } | null;

export async function createEmail(
  _prevState: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const email_address = (formData.get("email_address") as string).trim().toLowerCase();
  if (!email_address) return { error: "Email address is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("whitelist_email_addresses").insert({ email_address });
  if (error) return { error: error.message };

  redirect("/admin/whitelisted-emails");
}

export async function updateEmail(
  _prevState: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  const result = await requireSuperadmin();
  if (!result.authorized) return { error: "Forbidden" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing ID." };

  const email_address = (formData.get("email_address") as string).trim().toLowerCase();
  if (!email_address) return { error: "Email address is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_email_addresses")
    .update({ email_address, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  redirect("/admin/whitelisted-emails");
}

export async function deleteEmail(formData: FormData) {
  const result = await requireSuperadmin();
  if (!result.authorized) throw new Error("Forbidden");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing ID.");

  const supabase = await createClient();
  const { error } = await supabase.from("whitelist_email_addresses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/admin/whitelisted-emails");
}
