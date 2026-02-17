import Link from "next/link";
import { notFound } from "next/navigation";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import {
  ensureStarterRopesPlanSeed,
  formatElapsedMs,
  formatSeconds,
  starterRopesDayHref,
  starterRopesPlanHref,
  WORKOUT_STARTER_PLAN_SLUG,
} from "@/lib/workout-ropes";
import { prisma } from "@/prisma";

function progressPercent(done: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((done / total) * 100);
}

export default async function StarterRopesPlanPage() {
  const user = await requireAppRead("WORKOUT");
  await ensureStarterRopesPlanSeed();

  const plan = await prisma.workoutPlan.findUnique({
    where: { slug: WORKOUT_STARTER_PLAN_SLUG },
    select: {
      id: true,
      title: true,
      description: true,
      days: {
        orderBy: { dayNumber: "asc" },
        select: {
          id: true,
          dayNumber: true,
          slug: true,
          title: true,
          summary: true,
          totalLabel: true,
          _count: {
            select: {
              rounds: true,
            },
          },
          rounds: {
            select: {
              id: true,
              targetSeconds: true,
            },
          },
        },
      },
    },
  });

  if (!plan) {
    notFound();
  }

  const [userRoundResults, recentResults] = await Promise.all([
    prisma.workoutRoundResult.findMany({
      where: {
        userId: user.id,
        planId: plan.id,
      },
      orderBy: { completedAt: "desc" },
      select: {
        dayId: true,
        roundId: true,
        elapsedMs: true,
        targetSeconds: true,
        completedAt: true,
      },
    }),
    prisma.workoutRoundResult.findMany({
      where: { planId: plan.id },
      orderBy: { completedAt: "desc" },
      take: 60,
      select: {
        id: true,
        elapsedMs: true,
        targetSeconds: true,
        completedAt: true,
        day: {
          select: {
            dayNumber: true,
            title: true,
          },
        },
        round: {
          select: {
            roundNumber: true,
            title: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
            nickname: true,
          },
        },
      },
    }),
  ]);

  const achievedRoundIds = new Set<string>();
  const latestByRound = new Map<
    string,
    {
      elapsedMs: number;
      completedAt: Date;
    }
  >();

  for (const result of userRoundResults) {
    if (!latestByRound.has(result.roundId)) {
      latestByRound.set(result.roundId, {
        elapsedMs: result.elapsedMs,
        completedAt: result.completedAt,
      });
    }

    if (result.elapsedMs >= result.targetSeconds * 1000) {
      achievedRoundIds.add(result.roundId);
    }
  }

  const doneByDay = new Map<string, number>();
  for (const day of plan.days) {
    const dayDone = day.rounds.filter((round) => achievedRoundIds.has(round.id)).length;
    doneByDay.set(day.id, dayDone);
  }

  const totalRounds = plan.days.reduce((sum, day) => sum + day._count.rounds, 0);
  const totalTargetSeconds = plan.days.reduce(
    (sum, day) => sum + day.rounds.reduce((roundSum, round) => roundSum + round.targetSeconds, 0),
    0,
  );
  const totalJumpingMs = [...latestByRound.values()].reduce(
    (sum, result) => sum + result.elapsedMs,
    0,
  );
  const completedRounds = achievedRoundIds.size;
  const completedDays = plan.days.filter(
    (day) => (doneByDay.get(day.id) ?? 0) >= day._count.rounds,
  ).length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Workout", href: "/apps/workout" },
            { label: "Ropes", href: "/apps/workout/ropes" },
            { label: "7-day starter plan" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {plan.title}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">{plan.description}</p>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          Overview
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-(--line) bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">Days</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">{plan.days.length}</p>
            <p className="mt-1 text-xs text-(--text-muted)">Structured sessions</p>
          </article>

          <article className="rounded-2xl border border-(--line) bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">Total rounds</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">{totalRounds}</p>
            <p className="mt-1 text-xs text-(--text-muted)">Across all days</p>
          </article>

          <article className="rounded-2xl border border-(--line) bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">Target jump time</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
              {formatSeconds(totalTargetSeconds)}
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">Cumulative target</p>
          </article>

          <article className="rounded-2xl border border-(--line) bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Total jumping time
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
              {formatElapsedMs(totalJumpingMs)}
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">Your latest saved rounds</p>
          </article>

          <article className="rounded-2xl border border-(--line) bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">Your progress</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
              {completedRounds}/{totalRounds}
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">
              {completedDays}/{plan.days.length} days complete ({progressPercent(completedRounds, totalRounds)}%)
            </p>
          </article>
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">Days</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plan.days.map((day) => {
            const doneCount = doneByDay.get(day.id) ?? 0;

            return (
              <Link
                key={day.id}
                href={starterRopesDayHref(day.slug)}
                className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
              >
                <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                  Day {day.dayNumber}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#162947]">{day.title}</h2>
                <p className="mt-2 text-sm leading-6 text-(--text-muted)">{day.summary}</p>
                <p className="mt-2 text-xs text-[#5f7093]">{day.totalLabel}</p>
                <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-[#5a6b8f] uppercase">
                  {doneCount}/{day._count.rounds} rounds done
                </p>
                <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                  Open day
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf2fb] px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
              Central workout log
            </h2>
            <p className="text-sm text-(--text-muted)">
              All saved round results for this plan.
            </p>
          </div>
          <Link
            href={starterRopesPlanHref()}
            className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
          >
            Refresh
          </Link>
        </div>

        <div className="grid grid-cols-[0.9fr_1.3fr_0.9fr_0.8fr_0.8fr_1fr] bg-[#f8faff] px-5 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
          <span>When</span>
          <span>User</span>
          <span>Day</span>
          <span>Round</span>
          <span>Target</span>
          <span>Result</span>
        </div>

        {recentResults.length > 0 ? (
          recentResults.map((result) => {
            const deltaMs = result.elapsedMs - result.targetSeconds * 1000;
            const isOverTarget = deltaMs >= 0;
            const userLabel = result.user.nickname || result.user.name || result.user.email;

            return (
              <div
                key={result.id}
                className="grid grid-cols-[0.9fr_1.3fr_0.9fr_0.8fr_0.8fr_1fr] items-center gap-2 border-t border-[#edf2fb] px-5 py-3 text-sm"
              >
                <span className="text-(--text-muted)">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(result.completedAt)}
                </span>
                <span className="truncate text-[#1a2b49]" title={userLabel}>{userLabel}</span>
                <span className="text-(--text-muted)">Day {result.day.dayNumber}</span>
                <span className="text-(--text-muted)">{result.round.title}</span>
                <span className="font-mono text-[#1a2b49]">{formatSeconds(result.targetSeconds)}</span>
                <span className="font-mono text-[#1a2b49]">
                  {formatElapsedMs(result.elapsedMs)}
                  <span className={isOverTarget ? "ml-2 text-[#1f6a3b]" : "ml-2 text-[#9d3e2f]"}>
                    ({isOverTarget ? "+" : "-"}{formatElapsedMs(Math.abs(deltaMs))})
                  </span>
                </span>
              </div>
            );
          })
        ) : (
          <p className="px-5 py-4 text-sm text-(--text-muted)">
            No workout results yet. Open a day and save your first round.
          </p>
        )}
      </section>
    </main>
  );
}
