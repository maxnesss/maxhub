import { SectionTabs } from "../SectionTabs";

import { HackatonCountdown } from "./HackatonCountdown";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

export default async function SkatingBibleHackatonPage() {
  await requireAppRead("SKATING_BIBLE");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Skating bible", href: "/apps/skating-bible" },
            { label: "Hackaton" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">Hackaton</h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Event starts on February 21, 2026 at 07:00. Before start you get a live countdown;
          after start the 24-hour schedule is shown.
        </p>

        <SectionTabs current="hackaton" />
      </section>

      <HackatonCountdown />
    </main>
  );
}
