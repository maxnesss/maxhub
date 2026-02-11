"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signOut } from "@/auth";
import { requireUserContext } from "@/lib/authz";
import { prisma } from "@/prisma";

const profileUpdateSchema = z.object({
  nickname: z.string().trim().max(40).optional(),
});

export async function updateProfileAction(formData: FormData) {
  const user = await requireUserContext();

  const parsed = profileUpdateSchema.safeParse({
    nickname: formData.get("nickname") || "",
  });

  if (!parsed.success) {
    redirect("/profile?edit=1&error=1");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      nickname: parsed.data.nickname || null,
    },
  });

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}
