"use server";

import { hash } from "bcryptjs";
import { Prisma, type Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/authz";
import { prisma } from "@/prisma";

const createUserSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().trim().max(80).optional(),
  nickname: z.string().trim().max(40).optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

type CreateUserState = {
  error: string | null;
  success: string | null;
};

export async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireAdminUser();

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || "",
    nickname: formData.get("nickname") || "",
    role: formData.get("role") || "USER",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid user input.",
      success: null,
    };
  }

  const payload = parsed.data;

  try {
    const passwordHash = await hash(payload.password, 12);
    const role: Role = payload.role;

    await prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        passwordHash,
        name: payload.name || null,
        nickname: payload.nickname || null,
        role,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return {
      error: null,
      success: "User created successfully.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "A user with this email already exists.",
        success: null,
      };
    }

    return {
      error: "Unable to create user right now.",
      success: null,
    };
  }
}
