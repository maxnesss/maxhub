import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooJourneyStages } from "@/lib/bamboo-journey";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import { getBambooCopy } from "@/lib/bamboo-i18n";

export default async function BambooStartHerePage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const copy = getBambooCopy(locale);
  const journeyStages = getBambooJourneyStages(locale);
  const first30Minutes = [
    copy.startHereStep1,
    copy.startHereStep2,
    copy.startHereStep3,
    copy.startHereStep4,
    copy.startHereStep5,
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: copy.startHereTitle },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {copy.startHereTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {copy.startHereDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/apps/bamboo/name-brand"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            {copy.openNameBrainstorm}
          </Link>
          <Link
            href="/apps/bamboo/company-setup"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            {copy.openCompanySetup}
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {copy.suggestedFirst30Minutes}
        </h2>
        <ul className="mt-4 space-y-2">
          {first30Minutes.map((item, index) => (
            <li
              key={item}
              className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
            >
              {index + 1}. {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {journeyStages.map((stage) => (
          <Link
            key={stage.id}
            href={stage.href}
            className="rounded-2xl border border-(--line) bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              {stage.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#314567]">{stage.description}</p>
            <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-[#5a6b8f] uppercase">
              {copy.openStage}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
