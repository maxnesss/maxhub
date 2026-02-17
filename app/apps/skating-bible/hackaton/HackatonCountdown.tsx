"use client";

import { useEffect, useMemo, useState } from "react";

type ScheduleEntry = {
  offsetHours: number;
  title: string;
  notes: string;
};

const HACKATON_START = {
  year: 2026,
  monthIndex: 1,
  day: 21,
  hour: 7,
  minute: 0,
  second: 0,
} as const;

const SCHEDULE: ScheduleEntry[] = [
  { offsetHours: 0, title: "Kickoff", notes: "Goals, roles, and final scope lock." },
  { offsetHours: 1, title: "Idea crunch", notes: "Select final concept and acceptance criteria." },
  { offsetHours: 2, title: "Architecture", notes: "Define data flow, pages, and delivery plan." },
  { offsetHours: 4, title: "Build sprint 1", notes: "Core implementation and integration." },
  { offsetHours: 8, title: "Checkpoint", notes: "Health check, blockers, and scope trim." },
  { offsetHours: 9, title: "Build sprint 2", notes: "Complete priority features and polish." },
  { offsetHours: 13, title: "Demo prep", notes: "Stabilize flows and prepare narrative." },
  { offsetHours: 16, title: "Testing", notes: "Run regression, fix critical bugs." },
  { offsetHours: 20, title: "Final pass", notes: "UI cleanup, copy pass, and QA spot checks." },
  { offsetHours: 22, title: "Submission pack", notes: "Finalize assets, links, and handoff notes." },
  { offsetHours: 24, title: "Wrap", notes: "Retrospective and follow-up actions." },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

function formatScheduleTime(baseDate: Date, offsetHours: number) {
  const date = new Date(baseDate.getTime() + offsetHours * 60 * 60 * 1000);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HackatonCountdown() {
  const [now, setNow] = useState(() => Date.now());

  const startDate = useMemo(
    () =>
      new Date(
        HACKATON_START.year,
        HACKATON_START.monthIndex,
        HACKATON_START.day,
        HACKATON_START.hour,
        HACKATON_START.minute,
        HACKATON_START.second,
      ),
    [],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const msLeft = startDate.getTime() - now;
  const hasStarted = msLeft <= 0;
  const countdown = formatCountdown(msLeft);

  return (
    <section className="mt-6 space-y-6">
      <article className="rounded-2xl border border-(--line) bg-white p-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
          Hackaton start
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
          Feb 21, 2026 at 07:00
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Countdown follows your local timezone in-browser.
        </p>

        {!hasStarted ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#dfe7f7] bg-[#fbfdff] p-3 text-center">
              <p className="text-2xl font-semibold tracking-tight text-[#162947]">{countdown.days}</p>
              <p className="text-xs tracking-[0.12em] text-[#627396] uppercase">Days</p>
            </div>
            <div className="rounded-xl border border-[#dfe7f7] bg-[#fbfdff] p-3 text-center">
              <p className="text-2xl font-semibold tracking-tight text-[#162947]">{pad(countdown.hours)}</p>
              <p className="text-xs tracking-[0.12em] text-[#627396] uppercase">Hours</p>
            </div>
            <div className="rounded-xl border border-[#dfe7f7] bg-[#fbfdff] p-3 text-center">
              <p className="text-2xl font-semibold tracking-tight text-[#162947]">{pad(countdown.minutes)}</p>
              <p className="text-xs tracking-[0.12em] text-[#627396] uppercase">Minutes</p>
            </div>
            <div className="rounded-xl border border-[#dfe7f7] bg-[#fbfdff] p-3 text-center">
              <p className="text-2xl font-semibold tracking-tight text-[#162947]">{pad(countdown.seconds)}</p>
              <p className="text-xs tracking-[0.12em] text-[#627396] uppercase">Seconds</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-[#cfe0f8] bg-[#f2f7ff] p-4">
            <p className="text-sm font-semibold text-[#274a7a]">Hackaton is live.</p>
            <p className="mt-1 text-sm text-[#3b5a86]">24-hour schedule is active below.</p>
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-(--line) bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-[#162947]">Hackaton schedule</h3>
          <span className="inline-flex rounded-full border border-[#d9e2f3] bg-[#f8faff] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#4e5e7a] uppercase">
            {hasStarted ? "Live 24h run" : "Planned 24h run"}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {SCHEDULE.map((item) => (
            <div
              key={item.offsetHours}
              className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#1a2b49]">{item.title}</p>
                <p className="text-xs font-semibold tracking-[0.1em] text-[#5e7092] uppercase">
                  +{item.offsetHours}h · {formatScheduleTime(startDate, item.offsetHours)}
                </p>
              </div>
              <p className="mt-1 text-xs text-(--text-muted)">{item.notes}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
