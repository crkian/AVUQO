import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export type AvuqoAdminRole = "admin" | "owner";

export async function requireControlCentreAccess() {
  const supabase = await createClient();

  // getUser() performs a server-verified lookup and is safe for authorization.
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/control-centre");
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    roleError ||
    !roleRow ||
    !["admin", "owner"].includes(roleRow.role)
  ) {
    redirect("/unauthorized");
  }

  return {
    user,
    role: roleRow.role as AvuqoAdminRole
  };
}
