import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { APP_CODES, APP_DEFINITIONS, type AppCode } from "@/lib/apps";
import { prisma } from "@/prisma";

export type UserContext = {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  role: "ADMIN" | "USER";
  appPermissions: { app: AppCode; canRead: boolean; canEdit: boolean }[];
};

export function canReadApp(user: UserContext, app: AppCode) {
  if (user.role === "ADMIN") {
    return true;
  }

  const permission = user.appPermissions.find((item) => item.app === app);
  return Boolean(permission?.canRead);
}

export function canEditApp(user: UserContext, app: AppCode) {
  if (user.role === "ADMIN") {
    return true;
  }

  const permission = user.appPermissions.find((item) => item.app === app);
  return Boolean(permission?.canEdit);
}

export async function getCurrentUserContext(): Promise<UserContext | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      role: true,
      appPermissions: {
        select: {
          app: true,
          canRead: true,
          canEdit: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const normalizedPermissions = user.appPermissions
    .filter((item) => APP_CODES.includes(item.app as AppCode))
    .map((item) => ({
      app: item.app as AppCode,
      canRead: item.canRead,
      canEdit: item.canEdit,
    }));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    role: user.role,
    appPermissions: normalizedPermissions,
  };
}

export async function requireUserContext() {
  const user = await getCurrentUserContext();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireUserContext();
  if (user.role !== "ADMIN") {
    redirect("/apps");
  }

  return user;
}

export async function requireAppRead(app: AppCode) {
  const user = await requireUserContext();
  if (!canReadApp(user, app)) {
    redirect("/apps");
  }

  return user;
}

export async function requireAppEdit(app: AppCode) {
  const user = await requireUserContext();
  if (!canEditApp(user, app)) {
    redirect(APP_DEFINITIONS[app].href ?? "/apps");
  }

  return user;
}
