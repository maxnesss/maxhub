export type CalendarColorToken = {
  label: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  panelBg: string;
  panelBorder: string;
};

export const CALENDAR_EVENT_COLOR_VALUES = [
  "SKY",
  "MINT",
  "PEACH",
  "LEMON",
  "LILAC",
] as const;

export type CalendarEventColorValue =
  (typeof CALENDAR_EVENT_COLOR_VALUES)[number];

export const CALENDAR_EVENT_COLORS: Record<CalendarEventColorValue, CalendarColorToken> = {
  SKY: {
    label: "Sky",
    chipBg: "#edf4ff",
    chipBorder: "#c8daf7",
    chipText: "#35517f",
    panelBg: "#f6f9ff",
    panelBorder: "#dbe6f8",
  },
  MINT: {
    label: "Mint",
    chipBg: "#edf9f3",
    chipBorder: "#cce9da",
    chipText: "#356851",
    panelBg: "#f6fcf9",
    panelBorder: "#d7eee2",
  },
  PEACH: {
    label: "Peach",
    chipBg: "#fff3ed",
    chipBorder: "#f1d4c7",
    chipText: "#7e4f40",
    panelBg: "#fffaf7",
    panelBorder: "#f3e1d8",
  },
  LEMON: {
    label: "Lemon",
    chipBg: "#fffbe9",
    chipBorder: "#eadfb0",
    chipText: "#6b5a28",
    panelBg: "#fffdf4",
    panelBorder: "#efe7c6",
  },
  LILAC: {
    label: "Lilac",
    chipBg: "#f4efff",
    chipBorder: "#dacff1",
    chipText: "#58457a",
    panelBg: "#faf7ff",
    panelBorder: "#e4dbf5",
  },
};

export const CALENDAR_EVENT_COLOR_OPTIONS: ReadonlyArray<{
  value: CalendarEventColorValue;
  label: string;
}> = [
  { value: "SKY", label: CALENDAR_EVENT_COLORS.SKY.label },
  { value: "MINT", label: CALENDAR_EVENT_COLORS.MINT.label },
  { value: "PEACH", label: CALENDAR_EVENT_COLORS.PEACH.label },
  { value: "LEMON", label: CALENDAR_EVENT_COLORS.LEMON.label },
  { value: "LILAC", label: CALENDAR_EVENT_COLORS.LILAC.label },
];

export function getCalendarColorToken(color: string | null | undefined) {
  if (!color || !(color in CALENDAR_EVENT_COLORS)) {
    return CALENDAR_EVENT_COLORS.SKY;
  }

  return CALENDAR_EVENT_COLORS[color as CalendarEventColorValue];
}
