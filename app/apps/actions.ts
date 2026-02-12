"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { APP_CODES, APP_DEFINITIONS } from "@/lib/apps";
import { canReadApp, requireUserContext } from "@/lib/authz";
import { prisma } from "@/prisma";

const toggleFavoriteSchema = z.object({
  appCode: z.enum(APP_CODES),
});

export async function toggleFavoriteAppAction(formData: FormData) {
  const user = await requireUserContext();

  const parsed = toggleFavoriteSchema.safeParse({
    appCode: formData.get("appCode"),
  });

  if (!parsed.success) {
    redirect("/apps");
  }

  const { appCode } = parsed.data;

  if (!APP_DEFINITIONS[appCode].href) {
    redirect("/apps");
  }

  if (!canReadApp(user, appCode)) {
    redirect("/apps");
  }

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { favoriteApps: true },
  });

  if (!current) {
    redirect("/apps");
  }

  const isFavorite = current.favoriteApps.includes(appCode);
  const nextFavorites = isFavorite
    ? current.favoriteApps.filter((favorite) => favorite !== appCode)
    : [...current.favoriteApps, appCode];

  await prisma.user.update({
    where: { id: user.id },
    data: { favoriteApps: nextFavorites },
  });

  revalidatePath("/apps");
  redirect("/apps");
}
