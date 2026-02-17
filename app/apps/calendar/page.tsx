import Link from "next/link";

import {
  createCalendarEventAction,
  deleteCalendarEventAction,
  updateCalendarEventAction,
} from "./actions";
import { AddCalendarEventModal } from "./AddCalendarEventModal";
import { EditCalendarEventModal } from "./EditCalendarEventModal";
import {
  getCalendarColorToken,
  type CalendarEventColorValue,
} from "./colors";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

type CalendarPageProps = {
  searchParams: Promise<{ month?: string; saved?: string; error?: string }>;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function toMonthParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseMonthParam(value: string | undefined) {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDatetimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultStartForMonth(monthStart: Date) {
  const now = new Date();

  if (
    monthStart.getFullYear() === now.getFullYear() &&
    monthStart.getMonth() === now.getMonth()
  ) {
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(Math.min(nextHour.getHours() + 1, 23));
    return toDatetimeLocalValue(nextHour);
  }

  return toDatetimeLocalValue(
    new Date(monthStart.getFullYear(), monthStart.getMonth(), 1, 9, 0, 0, 0),
  );
}

function formatMonthHeading(monthStart: Date) {
  return monthStart.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatEventTime(start: Date, end: Date | null, isAllDay: boolean) {
  if (isAllDay) {
    return "All day";
  }

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!end) {
    return timeFormatter.format(start);
  }

  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function getToastMessage(saved: string | undefined) {
  if (saved === "created") {
    return "Event created.";
  }

  if (saved === "updated") {
    return "Event updated.";
  }

  if (saved === "deleted") {
    return "Event deleted.";
  }

  return null;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const user = await requireAppRead("CALENDAR");
  const canEdit = canEditApp(user, "CALENDAR");
  const { month, saved, error } = await searchParams;

  const monthStart = parseMonthParam(month);
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    1,
  );
  const monthParam = toMonthParam(monthStart);
  const defaultStartsAt = getDefaultStartForMonth(monthStart);

  const [monthEvents, upcomingEvents] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: {
        startsAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startsAt: true,
        endsAt: true,
        isAllDay: true,
        color: true,
      },
    }),
    prisma.calendarEvent.findMany({
      where: {
        startsAt: {
          gte: new Date(),
        },
      },
      orderBy: [{ startsAt: "asc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        startsAt: true,
        color: true,
      },
    }),
  ]);

  const totalEvents = monthEvents.length;
  const allDayCount = monthEvents.filter((event) => event.isAllDay).length;
  const eventsByDay = new Map<string, typeof monthEvents>();

  for (const event of monthEvents) {
    const key = toDayKey(event.startsAt);
    const bucket = eventsByDay.get(key) ?? [];
    bucket.push(event);
    eventsByDay.set(key, bucket);
  }

  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  ).getDate();
  const leadingEmptyCells = monthStart.getDay();
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      index + 1,
    );
    const dayKey = toDayKey(date);
    const now = new Date();

    return {
      date,
      dayOfMonth: index + 1,
      dayKey,
      isToday:
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate(),
      events: eventsByDay.get(dayKey) ?? [],
    };
  });

  let busiestDayLabel = "n/a";
  let busiestDayCount = 0;
  for (const day of days) {
    if (day.events.length > busiestDayCount) {
      busiestDayCount = day.events.length;
      busiestDayLabel = `${day.dayOfMonth}`;
    }
  }

  const previousMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() - 1,
    1,
  );
  const nextMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    1,
  );

  const toastMessage = getToastMessage(saved);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {toastMessage ? <Toast message={toastMessage} /> : null}
      {error === "invalid" ? (
        <Toast message="Invalid calendar input." tone="error" />
      ) : null}
      {error === "invalid-date" ? (
        <Toast message="Invalid date or time value." tone="error" />
      ) : null}
      {error === "invalid-range" ? (
        <Toast message="End time must be after start time." tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Calendar" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Calendar board
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          A monthly planning surface for launches, rituals, and deadlines.
          Keep events color-coded and easy to scan.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
              {formatMonthHeading(monthStart)}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/apps/calendar?month=${toMonthParam(previousMonth)}`}
                className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Previous
              </Link>
              <Link
                href={`/apps/calendar?month=${toMonthParam(new Date())}`}
                className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Today
              </Link>
              <Link
                href={`/apps/calendar?month=${toMonthParam(nextMonth)}`}
                className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Next
              </Link>
              {canEdit ? (
                <AddCalendarEventModal
                  action={createCalendarEventAction}
                  returnMonth={monthParam}
                  defaultStartsAt={defaultStartsAt}
                />
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#dfe8f8] bg-[#f8fbff] p-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#657594] uppercase">
                Events this month
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#162947]">{totalEvents}</p>
            </div>
            <div className="rounded-xl border border-[#dfe8f8] bg-[#f8fbff] p-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#657594] uppercase">
                All day
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#162947]">{allDayCount}</p>
            </div>
            <div className="rounded-xl border border-[#dfe8f8] bg-[#f8fbff] p-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#657594] uppercase">
                Busiest day
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#162947]">
                {busiestDayLabel}
                <span className="ml-2 text-sm font-medium text-[#607296]">
                  ({busiestDayCount})
                </span>
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-[#162947]">
            Upcoming events
          </h2>
          <div className="mt-4 space-y-2">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const token = getCalendarColorToken(event.color);
                return (
                  <div
                    key={event.id}
                    className="rounded-lg border px-3 py-2"
                    style={{
                      backgroundColor: token.panelBg,
                      borderColor: token.panelBorder,
                    }}
                  >
                    <p className="text-sm font-semibold text-[#1a2b49]">{event.title}</p>
                    <p className="mt-1 text-xs text-[#607296]">
                      {event.startsAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-(--text-muted)">
                No upcoming events yet.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white p-4">
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAY_LABELS.map((label) => (
            <p
              key={label}
              className="rounded-lg bg-[#f8fbff] px-2 py-2 text-center text-[11px] font-semibold tracking-[0.1em] text-[#617294] uppercase"
            >
              {label}
            </p>
          ))}

          {Array.from({ length: leadingEmptyCells }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-[130px] rounded-lg border border-dashed border-[#ecf1fb] bg-[#fbfdff]"
            />
          ))}

          {days.map((day) => (
            <article
              key={day.dayKey}
              className={`min-h-[130px] rounded-lg border p-2 ${
                day.isToday
                  ? "border-[#b9cdf2] bg-[#f2f7ff]"
                  : "border-[#e4ebf8] bg-[#fbfdff]"
              }`}
            >
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs font-semibold ${
                    day.isToday ? "text-[#294a83]" : "text-[#5a6c90]"
                  }`}
                >
                  {day.dayOfMonth}
                </p>
                <p className="text-[10px] text-[#8391ac]">
                  {day.events.length > 0 ? `${day.events.length} events` : ""}
                </p>
              </div>

              <div className="mt-2 space-y-1.5">
                {day.events.slice(0, 4).map((event) => {
                  const token = getCalendarColorToken(event.color);

                  return (
                    <div
                      key={event.id}
                      className="rounded-md border px-2 py-1.5"
                      style={{
                        backgroundColor: token.chipBg,
                        borderColor: token.chipBorder,
                        color: token.chipText,
                      }}
                    >
                      <p className="truncate text-[11px] font-semibold">{event.title}</p>
                      <p className="truncate text-[10px] opacity-80">
                        {formatEventTime(event.startsAt, event.endsAt, event.isAllDay)}
                      </p>
                      {canEdit ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <EditCalendarEventModal
                            action={updateCalendarEventAction}
                            returnMonth={monthParam}
                            event={{
                              id: event.id,
                              title: event.title,
                              description: event.description,
                              location: event.location,
                              startsAtInput: toDatetimeLocalValue(event.startsAt),
                              endsAtInput: event.endsAt
                                ? toDatetimeLocalValue(event.endsAt)
                                : "",
                              isAllDay: event.isAllDay,
                              color: event.color as CalendarEventColorValue,
                            }}
                          />
                          <form action={deleteCalendarEventAction}>
                            <input type="hidden" name="id" value={event.id} />
                            <input type="hidden" name="returnMonth" value={monthParam} />
                            <button
                              type="submit"
                              className="cursor-pointer rounded-md border border-[#efcbc2] bg-[#fff2ef] px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#8b3a2d] uppercase hover:bg-[#fee8e3]"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {day.events.length > 4 ? (
                  <p className="text-[10px] font-semibold text-[#607296]">
                    +{day.events.length - 4} more
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
