"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";
import { CALENDAR_EVENT_COLOR_VALUES } from "./colors";

const monthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const baseEventSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(180).optional(),
  startsAt: z.string().trim().min(1),
  endsAt: z.string().trim().optional(),
  isAllDay: z.string().trim().optional(),
  color: z.enum(CALENDAR_EVENT_COLOR_VALUES),
  returnMonth: z.string().trim().optional(),
});

const updateEventSchema = baseEventSchema.extend({
  id: z.string().trim().min(1),
});

const deleteEventSchema = z.object({
  id: z.string().trim().min(1),
  returnMonth: z.string().trim().optional(),
});

function normalizeMonth(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = monthSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}

function monthFromDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function toDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildCalendarUrl(options: {
  month?: string;
  saved?: string;
  error?: string;
}) {
  const searchParams = new URLSearchParams();

  if (options.month) {
    searchParams.set("month", options.month);
  }

  if (options.saved) {
    searchParams.set("saved", options.saved);
  }

  if (options.error) {
    searchParams.set("error", options.error);
  }

  const query = searchParams.toString();
  return query ? `/apps/calendar?${query}` : "/apps/calendar";
}

function calendarRedirectError(error: string, month?: string): never {
  redirect(buildCalendarUrl({ error, month }));
}

function resolveReturnMonth(input: string | undefined, fallbackDate: Date) {
  return normalizeMonth(input) ?? monthFromDate(fallbackDate);
}

export async function createCalendarEventAction(formData: FormData) {
  const user = await requireAppEdit("CALENDAR");

  const parsed = baseEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    isAllDay: formData.get("isAllDay"),
    color: formData.get("color"),
    returnMonth: formData.get("returnMonth"),
  });

  if (!parsed.success) {
    calendarRedirectError("invalid", normalizeMonth(String(formData.get("returnMonth") ?? "")));
  }

  const startsAt = toDate(parsed.data.startsAt);
  if (!startsAt) {
    calendarRedirectError("invalid-date", normalizeMonth(parsed.data.returnMonth));
  }

  const endsAtInput = parsed.data.endsAt?.trim();
  const endsAt = endsAtInput ? toDate(endsAtInput) : null;
  if (endsAtInput && !endsAt) {
    calendarRedirectError("invalid-date", normalizeMonth(parsed.data.returnMonth));
  }

  if (endsAt && endsAt < startsAt) {
    calendarRedirectError("invalid-range", normalizeMonth(parsed.data.returnMonth));
  }

  await prisma.calendarEvent.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description?.trim() ?? "",
      location: parsed.data.location?.trim() ?? "",
      startsAt,
      endsAt,
      isAllDay: parsed.data.isAllDay === "1",
      color: parsed.data.color,
      createdById: user.id,
    },
  });

  revalidatePath("/apps/calendar");
  redirect(
    buildCalendarUrl({
      month: resolveReturnMonth(parsed.data.returnMonth, startsAt),
      saved: "created",
    }),
  );
}

export async function updateCalendarEventAction(formData: FormData) {
  await requireAppEdit("CALENDAR");

  const parsed = updateEventSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    isAllDay: formData.get("isAllDay"),
    color: formData.get("color"),
    returnMonth: formData.get("returnMonth"),
  });

  if (!parsed.success) {
    calendarRedirectError("invalid", normalizeMonth(String(formData.get("returnMonth") ?? "")));
  }

  const startsAt = toDate(parsed.data.startsAt);
  if (!startsAt) {
    calendarRedirectError("invalid-date", normalizeMonth(parsed.data.returnMonth));
  }

  const endsAtInput = parsed.data.endsAt?.trim();
  const endsAt = endsAtInput ? toDate(endsAtInput) : null;
  if (endsAtInput && !endsAt) {
    calendarRedirectError("invalid-date", normalizeMonth(parsed.data.returnMonth));
  }

  if (endsAt && endsAt < startsAt) {
    calendarRedirectError("invalid-range", normalizeMonth(parsed.data.returnMonth));
  }

  const updated = await prisma.calendarEvent.updateMany({
    where: { id: parsed.data.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description?.trim() ?? "",
      location: parsed.data.location?.trim() ?? "",
      startsAt,
      endsAt,
      isAllDay: parsed.data.isAllDay === "1",
      color: parsed.data.color,
    },
  });

  if (updated.count === 0) {
    calendarRedirectError("invalid", normalizeMonth(parsed.data.returnMonth));
  }

  revalidatePath("/apps/calendar");
  redirect(
    buildCalendarUrl({
      month: resolveReturnMonth(parsed.data.returnMonth, startsAt),
      saved: "updated",
    }),
  );
}

export async function deleteCalendarEventAction(formData: FormData) {
  await requireAppEdit("CALENDAR");

  const parsed = deleteEventSchema.safeParse({
    id: formData.get("id"),
    returnMonth: formData.get("returnMonth"),
  });

  if (!parsed.success) {
    calendarRedirectError("invalid", normalizeMonth(String(formData.get("returnMonth") ?? "")));
  }

  const deleted = await prisma.calendarEvent.deleteMany({
    where: { id: parsed.data.id },
  });

  if (deleted.count === 0) {
    calendarRedirectError("invalid", normalizeMonth(parsed.data.returnMonth));
  }

  revalidatePath("/apps/calendar");
  redirect(
    buildCalendarUrl({
      month: normalizeMonth(parsed.data.returnMonth),
      saved: "deleted",
    }),
  );
}
