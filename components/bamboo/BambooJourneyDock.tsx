"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BAMBOO_JOURNEY_STAGES, getBambooJourneyContext } from "@/lib/bamboo-journey";

export function BambooJourneyDock() {
  const pathname = usePathname();
  const context = getBambooJourneyContext(pathname);

  if (!context) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
      <section className="pointer-events-auto mx-auto w-full max-w-6xl rounded-2xl border border-[#cfdbf2] bg-white/95 px-4 py-3 shadow-[0_16px_28px_-18px_rgba(19,33,58,0.45)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#5f7091] uppercase">
            Journey step {context.currentIndex}/{context.totalPages}
          </p>
          <p className="text-sm font-semibold text-[#223759]">{context.current.label}</p>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {BAMBOO_JOURNEY_STAGES.map((stage) => (
            <Link
              key={stage.id}
              href={stage.href}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                stage.id === context.currentStage.id
                  ? "border-[#8fb2f4] bg-[#eaf2ff] text-[#21417a]"
                  : "border-[#d8e2f4] bg-[#f8faff] text-[#5f7091] hover:bg-white"
              }`}
            >
              {stage.label}
            </Link>
          ))}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {context.previous ? (
            <Link
              href={context.previous.href}
              className="rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Previous: {context.previous.label}
            </Link>
          ) : (
            <p className="rounded-lg border border-[#e4ebf8] bg-[#fbfcff] px-3 py-2 text-sm text-[#8a97b2]">
              Previous: first step
            </p>
          )}

          {context.next ? (
            <Link
              href={context.next.href}
              className="rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff] sm:text-right"
            >
              Next: {context.next.label}
            </Link>
          ) : (
            <p className="rounded-lg border border-[#e4ebf8] bg-[#fbfcff] px-3 py-2 text-sm text-[#8a97b2] sm:text-right">
              Next: journey complete
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
