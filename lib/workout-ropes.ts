import "server-only";

import { prisma } from "@/prisma";

export const WORKOUT_STARTER_PLAN_SLUG = "starter-7-day";

export type WorkoutPlanSeedRound = {
  roundNumber: number;
  title: string;
  targetSeconds: number;
  restSeconds: number;
  notes?: string;
};

export type WorkoutPlanSeedDay = {
  dayNumber: number;
  slug: string;
  title: string;
  summary: string;
  totalLabel: string;
  focus?: string;
  tip?: string;
  finisher?: string;
  options?: string;
  rounds: WorkoutPlanSeedRound[];
};

function createRounds(
  count: number,
  targetSeconds: number,
  restSeconds: number,
  noteBuilder?: (index: number) => string | undefined,
) {
  return Array.from({ length: count }, (_, index) => ({
    roundNumber: index + 1,
    title: `Round ${index + 1}`,
    targetSeconds,
    restSeconds,
    notes: noteBuilder?.(index),
  }));
}

export const STARTER_ROPES_PLAN = {
  slug: WORKOUT_STARTER_PLAN_SLUG,
  title: "7-day starter plan",
  description:
    "Progressive rope plan with intervals, recovery, and a mini challenge finish.",
  days: [
    {
      dayNumber: 1,
      slug: "day-1",
      title: "Just get comfortable",
      summary: "5 rounds. Jump 20 sec, rest 40 sec.",
      totalLabel: "~8-10 min jumping",
      focus: "Timing + relaxed shoulders",
      tip: "Do not chase speed yet. Keep smooth bouncing.",
      rounds: createRounds(5, 20, 40),
    },
    {
      dayNumber: 2,
      slug: "day-2",
      title: "Build rhythm",
      summary: "6 rounds. Jump 25 sec, rest 35 sec.",
      totalLabel: "~10-12 min",
      finisher: "Optional finisher: 2 min easy walking.",
      rounds: createRounds(6, 25, 35),
    },
    {
      dayNumber: 3,
      slug: "day-3",
      title: "Endurance starter",
      summary: "5 rounds. Jump 40 sec, rest 40 sec.",
      totalLabel: "~12-15 min",
      finisher: "Then 3 min brisk walk or light jog.",
      rounds: createRounds(5, 40, 40),
    },
    {
      dayNumber: 4,
      slug: "day-4",
      title: "Active recovery",
      summary: "Recovery-focused day. Easy effort only.",
      totalLabel: "No hard jumping",
      options:
        "Choose one: 10 min easy jumping (slow, relaxed) OR walk + stretch calves + ankles.",
      tip: "Recovery = faster progress.",
      rounds: createRounds(5, 60, 30, () => "Easy pace"),
    },
    {
      dayNumber: 5,
      slug: "day-5",
      title: "Longer intervals",
      summary: "6 rounds. Jump 45 sec, rest 30 sec.",
      totalLabel: "~15 min",
      tip: "If you feel good, add 2 extra rounds.",
      rounds: createRounds(6, 45, 30),
    },
    {
      dayNumber: 6,
      slug: "day-6",
      title: "Fun skill day",
      summary: "8 rounds. Jump 30 sec, rest 30 sec.",
      totalLabel: "~15-18 min",
      options:
        "Mix in high knees (5 sec), side-to-side hops, or one-foot jumps if comfortable.",
      tip: "Keep it playful.",
      rounds: createRounds(8, 30, 30),
    },
    {
      dayNumber: 7,
      slug: "day-7",
      title: "Mini challenge day",
      summary: "10 rounds. Jump 60 sec, rest 30 sec.",
      totalLabel: "~20 min",
      tip: "That is 10 minutes of jumping total. Huge progress.",
      finisher: "Finish with calf stretch + deep breathing.",
      rounds: createRounds(10, 60, 30),
    },
  ] satisfies WorkoutPlanSeedDay[],
};

export function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatElapsedMs(ms: number) {
  const safe = Math.max(0, ms);
  const totalCentiseconds = Math.floor(safe / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export async function ensureStarterRopesPlanSeed() {
  await prisma.$transaction(async (tx) => {
    const plan = await tx.workoutPlan.upsert({
      where: { slug: STARTER_ROPES_PLAN.slug },
      update: {
        title: STARTER_ROPES_PLAN.title,
        description: STARTER_ROPES_PLAN.description,
      },
      create: {
        slug: STARTER_ROPES_PLAN.slug,
        title: STARTER_ROPES_PLAN.title,
        description: STARTER_ROPES_PLAN.description,
      },
      select: { id: true },
    });

    for (const daySeed of STARTER_ROPES_PLAN.days) {
      const day = await tx.workoutDay.upsert({
        where: {
          planId_dayNumber: {
            planId: plan.id,
            dayNumber: daySeed.dayNumber,
          },
        },
        update: {
          slug: daySeed.slug,
          title: daySeed.title,
          summary: daySeed.summary,
          totalLabel: daySeed.totalLabel,
          focus: daySeed.focus ?? null,
          tip: daySeed.tip ?? null,
          finisher: daySeed.finisher ?? null,
          options: daySeed.options ?? null,
        },
        create: {
          planId: plan.id,
          dayNumber: daySeed.dayNumber,
          slug: daySeed.slug,
          title: daySeed.title,
          summary: daySeed.summary,
          totalLabel: daySeed.totalLabel,
          focus: daySeed.focus ?? null,
          tip: daySeed.tip ?? null,
          finisher: daySeed.finisher ?? null,
          options: daySeed.options ?? null,
        },
        select: { id: true },
      });

      for (const roundSeed of daySeed.rounds) {
        await tx.workoutRound.upsert({
          where: {
            dayId_roundNumber: {
              dayId: day.id,
              roundNumber: roundSeed.roundNumber,
            },
          },
          update: {
            title: roundSeed.title,
            targetSeconds: roundSeed.targetSeconds,
            restSeconds: roundSeed.restSeconds,
            notes: roundSeed.notes ?? null,
          },
          create: {
            dayId: day.id,
            roundNumber: roundSeed.roundNumber,
            title: roundSeed.title,
            targetSeconds: roundSeed.targetSeconds,
            restSeconds: roundSeed.restSeconds,
            notes: roundSeed.notes ?? null,
          },
        });
      }
    }
  });
}

export function starterRopesPlanHref() {
  return `/apps/workout/ropes/plans/${WORKOUT_STARTER_PLAN_SLUG}`;
}

export function starterRopesDayHref(daySlug: string) {
  return `/apps/workout/ropes/plans/${WORKOUT_STARTER_PLAN_SLUG}/${daySlug}`;
}
