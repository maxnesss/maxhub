import Link from "next/link";
import { notFound } from "next/navigation";

import { saveWorkoutRoundResultAction } from "../actions";
import { RoundTimerModal } from "../RoundTimerModal";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { requireAppRead } from "@/lib/authz";
import {
  formatElapsedMs,
  formatSeconds,
  starterRopesDayHref,
  starterRopesPlanHref,
  WORKOUT_STARTER_PLAN_SLUG,
} from "@/lib/workout-ropes";
import { prisma } from "@/prisma";

type StarterRopesDayPageProps = {
  params: Promise<{ daySlug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function StarterRopesDayPage({
  params,
  searchParams,
}: StarterRopesDayPageProps) {
  const user = await requireAppRead("WORKOUT");

  const { daySlug } = await params;
  const { saved, error } = await searchParams;

  const day = await prisma.workoutDay.findFirst({
    where: {
      slug: daySlug,
      plan: {
        slug: WORKOUT_STARTER_PLAN_SLUG,
      },
    },
    select: {
      id: true,
      dayNumber: true,
      slug: true,
      title: true,
      summary: true,
      totalLabel: true,
      focus: true,
      tip: true,
      finisher: true,
      options: true,
      plan: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      rounds: {
        orderBy: {
          roundNumber: "asc",
        },
        select: {
          id: true,
          roundNumber: true,
          title: true,
          targetSeconds: true,
          restSeconds: true,
          notes: true,
        },
      },
    },
  });

  if (!day) {
    notFound();
  }

  const [recentResults, userResults] = await Promise.all([
    prisma.workoutRoundResult.findMany({
      where: {
        dayId: day.id,
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        elapsedMs: true,
        targetSeconds: true,
        completedAt: true,
        round: {
          select: {
            title: true,
            roundNumber: true,
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
    prisma.workoutRoundResult.findMany({
      where: {
        dayId: day.id,
        userId: user.id,
      },
      orderBy: {
        completedAt: "desc",
      },
      select: {
        roundId: true,
        elapsedMs: true,
        completedAt: true,
      },
    }),
  ]);

  const latestByRound = new Map<
    string,
    {
      elapsedMs: number;
      completedAt: Date;
    }
  >();
  const maxElapsedByRound = new Map<string, number>();

  for (const result of userResults) {
    maxElapsedByRound.set(
      result.roundId,
      Math.max(maxElapsedByRound.get(result.roundId) ?? 0, result.elapsedMs),
    );

    if (!latestByRound.has(result.roundId)) {
      latestByRound.set(result.roundId, {
        elapsedMs: result.elapsedMs,
        completedAt: result.completedAt,
      });
    }
  }

  const doneRoundIds = new Set(
    day.rounds
      .filter(
        (round) => (maxElapsedByRound.get(round.id) ?? 0) >= round.targetSeconds * 1000,
      )
      .map((round) => round.id),
  );
  const doneRounds = doneRoundIds.size;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "round" ? <Toast message="Round result saved." /> : null}
      {error === "invalid" ? <Toast message="Invalid round data." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Workout", href: "/apps/workout" },
            { label: "Ropes", href: "/apps/workout/ropes" },
            { label: day.plan.title, href: starterRopesPlanHref() },
            { label: `Day ${day.dayNumber}` },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Day {day.dayNumber} - {day.title}
        </h1>
        <p className="mt-3 max-w-3xl text-(--text-muted)">{day.summary}</p>
        <p className="mt-2 text-sm font-medium text-[#314567]">Total: {day.totalLabel}</p>
        {day.focus ? (
          <p className="mt-2 text-sm text-[#314567]">
            <span className="font-semibold text-[#1a2b49]">Focus:</span> {day.focus}
          </p>
        ) : null}
        {day.options ? <p className="mt-2 text-sm text-[#314567]">{day.options}</p> : null}
        {day.finisher ? (
          <p className="mt-2 text-sm text-[#314567]">
            <span className="font-semibold text-[#1a2b49]">Finisher:</span> {day.finisher}
          </p>
        ) : null}
        {day.tip ? (
          <p className="mt-3 rounded-lg border border-[#d8e2f4] bg-[#fbfdff] px-3 py-2 text-sm text-[#314567]">
            {day.tip}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Rounds</h2>
          <p className="text-sm text-(--text-muted)">
            Done: {doneRounds}/{day.rounds.length}
          </p>
        </div>

        <p className="mt-2 text-sm text-(--text-muted)">
          Open a round popup, press Start, then Pause and Done to save your result.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {day.rounds.map((round) => (
            <RoundTimerModal
              key={round.id}
              round={round}
              isDone={doneRoundIds.has(round.id)}
              returnTo={starterRopesDayHref(day.slug)}
              action={saveWorkoutRoundResultAction}
            />
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {day.rounds.map((round) => {
            const latest = latestByRound.get(round.id);
            const isDone = doneRoundIds.has(round.id);

            return (
              <article
                key={round.id}
                className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#1a2b49]">{round.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                      Target {formatSeconds(round.targetSeconds)}
                    </span>
                    {isDone ? (
                      <span className="rounded-full border border-[#bfdcc8] bg-[#f1fbf5] px-2 py-0.5 text-[11px] font-semibold text-[#1f6a3b]">
                        ✓ Done
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1 text-xs text-(--text-muted)">
                  Rest {formatSeconds(round.restSeconds)}
                </p>
                {round.notes ? (
                  <p className="mt-1 text-xs text-(--text-muted)">{round.notes}</p>
                ) : null}

                {latest ? (
                  <p className="mt-3 text-xs text-[#314567]">
                    Last saved: <span className="font-mono">{formatElapsedMs(latest.elapsedMs)}</span>
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-(--text-muted)">No result saved yet.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf2fb] px-5 py-4">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Day workout results</h2>
          <Link
            href={starterRopesPlanHref()}
            className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
          >
            Back to plan
          </Link>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {recentResults.length > 0 ? (
            recentResults.map((result) => {
              const userLabel = result.user.nickname || result.user.name || result.user.email;
              const deltaMs = result.elapsedMs - result.targetSeconds * 1000;
              const isOverTarget = deltaMs >= 0;

              return (
                <article
                  key={result.id}
                  className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
                >
                  <p className="text-xs font-semibold tracking-[0.1em] text-[#617294] uppercase">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(result.completedAt)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#1a2b49]">{userLabel}</p>
                  <p className="mt-1 text-sm text-(--text-muted)">{result.round.title}</p>
                  <p className="mt-2 text-sm text-[#1a2b49]">
                    Target: <span className="font-mono">{formatSeconds(result.targetSeconds)}</span>
                  </p>
                  <p className="mt-1 text-sm text-[#1a2b49]">
                    Result: <span className="font-mono">{formatElapsedMs(result.elapsedMs)}</span>
                    <span className={isOverTarget ? "ml-2 text-[#1f6a3b]" : "ml-2 text-[#9d3e2f]"}>
                      ({isOverTarget ? "+" : "-"}{formatElapsedMs(Math.abs(deltaMs))})
                    </span>
                  </p>
                </article>
              );
            })
          ) : (
            <p className="text-sm text-(--text-muted)">
              No saved rounds yet for this day.
            </p>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1fr_1fr_0.9fr_0.8fr_1fr] bg-[#f8faff] px-5 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
              <span>When</span>
              <span>User</span>
              <span>Round</span>
              <span>Target</span>
              <span>Result</span>
            </div>

            {recentResults.length > 0 ? (
              recentResults.map((result) => {
                const userLabel = result.user.nickname || result.user.name || result.user.email;
                const deltaMs = result.elapsedMs - result.targetSeconds * 1000;
                const isOverTarget = deltaMs >= 0;

                return (
                  <div
                    key={result.id}
                    className="grid grid-cols-[1fr_1fr_0.9fr_0.8fr_1fr] items-center gap-2 border-t border-[#edf2fb] px-5 py-3 text-sm"
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
                No saved rounds yet for this day.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
