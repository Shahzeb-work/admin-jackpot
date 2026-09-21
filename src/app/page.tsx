import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";

export default async function Home() {
  const admin = await getCurrentAdmin();
  redirect(admin ? "/tournaments" : "/login");
}
