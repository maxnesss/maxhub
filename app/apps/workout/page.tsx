import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

const WORKOUT_TILES = [
  {
    title: "Ropes",
    href: "/apps/workout/ropes",
    description: "Jump-rope focused training tools, starting with a stopwatch module.",
  },
];

export default async function WorkoutPage() {
  await requireAppRead("WORKOUT");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Workout" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Workout workspace
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Tile-based workout modules. Start with ropes and expand with additional
          training tools over time.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {WORKOUT_TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
          >
            <h2 className="text-xl font-semibold text-[#162947]">{tile.title}</h2>
            <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tile.description}</p>
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
              Open module
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
