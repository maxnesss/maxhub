import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

import { Stopwatch } from "./Stopwatch";

export default async function WorkoutRopesStopwatchPage() {
  await requireAppRead("WORKOUT");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Workout", href: "/apps/workout" },
            { label: "Ropes", href: "/apps/workout/ropes" },
            { label: "Stopwatch" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Stopwatch
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Use Space to start or pause. Reset at any time from the button below.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6 md:p-10">
        <Stopwatch />
      </section>
    </main>
  );
}
