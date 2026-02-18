import Link from "next/link";

import type { BambooSectionProgress as BambooSectionProgressItem } from "@/lib/bamboo-journey";

type BambooSectionProgressProps = {
  title: string;
  description: string;
  sections: BambooSectionProgressItem[];
};

export function BambooSectionProgress({
  title,
  description,
  sections,
}: BambooSectionProgressProps) {
  return (
    <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">{title}</h2>
      <p className="mt-2 text-sm text-(--text-muted)">{description}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#1a2b49]">{section.label}</p>
              <p className="text-sm font-semibold text-[#1f3e77]">{section.percent}%</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#dfe8f7]">
              <div
                className="h-2 rounded-full bg-[#85abed]"
                style={{ width: `${section.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-(--text-muted)">
              {section.total > 0
                ? `${section.done}/${section.total} tasks done`
                : "No tasks yet"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
