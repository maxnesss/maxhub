import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import {
  ensureStarterRopesPlanSeed,
  starterRopesPlanHref,
} from "@/lib/workout-ropes";

const ROPES_TOOLS = [
  {
    title: "Stopwatch",
    href: "/apps/workout/ropes/stopwatch",
    description: "Simple large stopwatch for rope sessions. Space toggles start and pause.",
  },
];

const ROPES_PLANS = [
  {
    title: "7-day starter plan",
    href: starterRopesPlanHref(),
    description:
      "Structured day-by-day path with dedicated round popups, saved results, and a central workouts table.",
  },
];

export default async function WorkoutRopesPage() {
  await requireAppRead("WORKOUT");
  await ensureStarterRopesPlanSeed();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Workout", href: "/apps/workout" },
            { label: "Ropes" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Ropes
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Rope-focused workspace with training tools and persistent practice plans.
        </p>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          Tools
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ROPES_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <h2 className="text-xl font-semibold text-[#162947]">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tool.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                Open tool
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          Plans
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ROPES_PLANS.map((plan) => (
            <Link
              key={plan.href}
              href={plan.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <h2 className="text-xl font-semibold text-[#162947]">{plan.title}</h2>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">
                {plan.description}
              </p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                Open plan
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-5">
        <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
          Quick note
        </p>
        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          Use the plan pages for day-by-day rounds and the central workout log.
        </p>
      </section>
    </main>
  );
}
