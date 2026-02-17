"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppRead } from "@/lib/authz";
import {
  ensureStarterRopesPlanSeed,
  starterRopesPlanHref,
  WORKOUT_STARTER_PLAN_SLUG,
} from "@/lib/workout-ropes";
import { prisma } from "@/prisma";

const saveRoundResultSchema = z.object({
  roundId: z.string().trim().min(1),
  elapsedMs: z.coerce.number().int().min(1).max(21_600_000),
  returnTo: z.string().trim().optional(),
});

function sanitizeReturnTo(path?: string) {
  const fallback = starterRopesPlanHref();
  if (!path) {
    return fallback;
  }

  if (!path.startsWith(`/apps/workout/ropes/plans/${WORKOUT_STARTER_PLAN_SLUG}`)) {
    return fallback;
  }

  return path;
}

export async function saveWorkoutRoundResultAction(formData: FormData) {
  const user = await requireAppRead("WORKOUT");
  await ensureStarterRopesPlanSeed();

  const parsed = saveRoundResultSchema.safeParse({
    roundId: formData.get("roundId"),
    elapsedMs: formData.get("elapsedMs"),
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    redirect(`${starterRopesPlanHref()}?error=invalid`);
  }

  const { roundId, elapsedMs, returnTo } = parsed.data;

  const round = await prisma.workoutRound.findUnique({
    where: { id: roundId },
    select: {
      id: true,
      targetSeconds: true,
      day: {
        select: {
          id: true,
          slug: true,
          plan: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!round || round.day.plan.slug !== WORKOUT_STARTER_PLAN_SLUG) {
    redirect(`${starterRopesPlanHref()}?error=invalid`);
  }

  await prisma.workoutRoundResult.create({
    data: {
      userId: user.id,
      planId: round.day.plan.id,
      dayId: round.day.id,
      roundId: round.id,
      targetSeconds: round.targetSeconds,
      elapsedMs,
    },
  });

  revalidatePath("/apps/workout/ropes");
  revalidatePath(starterRopesPlanHref());
  revalidatePath(`${starterRopesPlanHref()}/${round.day.slug}`);

  const nextPath = sanitizeReturnTo(returnTo);
  const separator = nextPath.includes("?") ? "&" : "?";
  redirect(`${nextPath}${separator}saved=round`);
}
