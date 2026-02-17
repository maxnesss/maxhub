import "server-only";

export const WORKOUT_STARTER_PLAN_SLUG = "starter-7-day";

export function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatElapsedMs(ms: number) {
  const safe = Math.max(0, ms);
  const totalCentiseconds = Math.floor(safe / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function starterRopesPlanHref() {
  return `/apps/workout/ropes/plans/${WORKOUT_STARTER_PLAN_SLUG}`;
}

export function starterRopesDayHref(daySlug: string) {
  return `/apps/workout/ropes/plans/${WORKOUT_STARTER_PLAN_SLUG}/${daySlug}`;
}
