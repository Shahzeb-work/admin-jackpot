import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth/session";

export type SafeAdmin = {
  id: string;
  email: string;
  name: string | null;
};

export async function getCurrentAdmin(): Promise<SafeAdmin | null> {
  const adminId = await getSessionAdminId();
  if (!adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true },
  });

  return admin;
}
