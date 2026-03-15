import { redirect } from "next/navigation";

// /vault with no token — redirect to login
export default function VaultIndexPage() {
  redirect("/login?hint=vault");
}
