"use client";

import Link from "next/link";
import {
  setBambooJourneyDockEnabled,
  useBambooJourneyDockEnabled,
} from "@/components/bamboo/useBambooJourneyDockPreference";

export function BambooJourneyControls() {
  const dockEnabled = useBambooJourneyDockEnabled();

  const toggleDock = () => {
    const nextState = !dockEnabled;
    setBambooJourneyDockEnabled(nextState);
  };

  const handleStartJourney = () => {
    setBambooJourneyDockEnabled(true);
  };

  return (
    <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Journey controls</h2>
      <p className="mt-2 text-sm text-(--text-muted)">
        Start the journey from the first step, and turn the bottom journey navigation
        on or off.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/apps/bamboo/start-here"
          onClick={handleStartJourney}
          className="inline-flex rounded-xl border border-[#21417a] bg-[#2f5aa8] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_24px_-16px_rgba(33,65,122,0.55)] hover:bg-[#25498a]"
        >
          Start journey
        </Link>
        <button
          type="button"
          onClick={toggleDock}
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {dockEnabled ? "Turn journey off" : "Turn journey on"}
        </button>
      </div>
    </section>
  );
}
