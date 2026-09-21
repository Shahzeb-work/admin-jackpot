"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/session";

export type AuthActionResult = { ok: true } | { ok: false; error: string };

export async function adminSignInAction(input: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const email = input.email.trim().toLowerCase();

  if (!email || !input.password) {
    return { ok: false, error: "Enter your email and password." };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return { ok: false, error: "Invalid credentials." };
  }

  const valid = await bcrypt.compare(input.password, admin.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid credentials." };
  }

  await createAdminSession(admin.id);
  return { ok: true };
}

export async function adminSignOutAction(): Promise<void> {
  await destroyAdminSession();
}
