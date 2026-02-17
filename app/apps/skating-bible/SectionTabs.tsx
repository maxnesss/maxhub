import Link from "next/link";

import { SKATING_BIBLE_SECTIONS } from "@/lib/skating-bible";

type SectionTabsProps = {
  current:
    | "home"
    | "overview"
    | "brainstorm"
    | "tasks"
    | "charts"
    | "hackaton";
};

const SECTION_KEY_BY_HREF: Record<string, Exclude<SectionTabsProps["current"], "home">> = {
  "/apps/skating-bible/overview": "overview",
  "/apps/skating-bible/brainstorm": "brainstorm",
  "/apps/skating-bible/tasks": "tasks",
  "/apps/skating-bible/charts": "charts",
  "/apps/skating-bible/hackaton": "hackaton",
};

export function SectionTabs({ current }: SectionTabsProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <Link
        href="/apps/skating-bible"
        className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.1em] uppercase ${
          current === "home"
            ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
            : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
        }`}
      >
        Home
      </Link>

      {SKATING_BIBLE_SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.1em] uppercase ${
            current === SECTION_KEY_BY_HREF[section.href]
              ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
              : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
          }`}
        >
          {section.label}
        </Link>
      ))}
    </div>
  );
}
