"use server";

import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { APP_CODES, parseAppCodes } from "@/lib/apps";
import { requireAdminUser } from "@/lib/authz";
import { prisma } from "@/prisma";
import { isRoleValue } from "@/lib/value-helps";

export async function updateUserPermissionsAction(formData: FormData) {
  await requireAdminUser();

  const userId = String(formData.get("userId") || "").trim();
  const roleValue = String(formData.get("role") || "USER").toUpperCase();

  if (!userId) {
    throw new Error("User ID is required");
  }

  const role: Role = isRoleValue(roleValue) ? roleValue : "USER";

  const readApps = parseAppCodes(
    formData
      .getAll("readApps")
      .map((value) => String(value))
      .filter(Boolean),
  );
  const editApps = parseAppCodes(
    formData
      .getAll("editApps")
      .map((value) => String(value))
      .filter(Boolean),
  );

  const readSet = new Set([...readApps, ...editApps]);
  const editSet = new Set(editApps);

  const permissionRows = APP_CODES.filter((app) => readSet.has(app)).map((app) => ({
    userId,
    app,
    canRead: true,
    canEdit: editSet.has(app),
  }));

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        role,
      },
    });

    await tx.userAppPermission.deleteMany({
      where: { userId },
    });

    if (permissionRows.length > 0) {
      await tx.userAppPermission.createMany({
        data: permissionRows,
      });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/apps");

  redirect(`/admin/users/${userId}?saved=1`);
}
