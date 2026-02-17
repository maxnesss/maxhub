export const SKATING_BRAINSTORM_COLOR_KEYS = [
  "sky",
  "mint",
  "peach",
  "lemon",
  "lilac",
] as const;

export type SkatingBrainstormColorKey =
  (typeof SKATING_BRAINSTORM_COLOR_KEYS)[number];

export const SKATING_BRAINSTORM_COLOR_OPTIONS: ReadonlyArray<{
  key: SkatingBrainstormColorKey;
  label: string;
  listBg: string;
  listBorder: string;
  listText: string;
  bubbleBg: string;
  bubbleBorder: string;
  bubbleText: string;
  bubbleHoverBg: string;
}> = [
  {
    key: "sky",
    label: "Sky",
    listBg: "#f5f9ff",
    listBorder: "#d8e5fb",
    listText: "#3c5687",
    bubbleBg: "#eef5ff",
    bubbleBorder: "#aec5ed",
    bubbleText: "#274881",
    bubbleHoverBg: "#e8f1ff",
  },
  {
    key: "mint",
    label: "Mint",
    listBg: "#f3fcf7",
    listBorder: "#d2ecdf",
    listText: "#356d58",
    bubbleBg: "#ebf9f2",
    bubbleBorder: "#a8d8bf",
    bubbleText: "#2d5f4a",
    bubbleHoverBg: "#e4f5ed",
  },
  {
    key: "peach",
    label: "Peach",
    listBg: "#fff7f2",
    listBorder: "#f4dacd",
    listText: "#8e5847",
    bubbleBg: "#fff2ea",
    bubbleBorder: "#e9c0ad",
    bubbleText: "#7f4b3b",
    bubbleHoverBg: "#ffede3",
  },
  {
    key: "lemon",
    label: "Lemon",
    listBg: "#fffdf0",
    listBorder: "#eee6c0",
    listText: "#6f622c",
    bubbleBg: "#fff9e6",
    bubbleBorder: "#dfd29a",
    bubbleText: "#615427",
    bubbleHoverBg: "#fff6db",
  },
  {
    key: "lilac",
    label: "Lilac",
    listBg: "#f8f5ff",
    listBorder: "#ded6f3",
    listText: "#5f4f7e",
    bubbleBg: "#f2ecff",
    bubbleBorder: "#c6b4e8",
    bubbleText: "#51416f",
    bubbleHoverBg: "#ece3ff",
  },
];

const DEFAULT_COLOR = SKATING_BRAINSTORM_COLOR_OPTIONS[0];
const COLOR_BY_KEY = new Map(
  SKATING_BRAINSTORM_COLOR_OPTIONS.map((item) => [item.key, item]),
);

export function getSkatingBrainstormColor(
  key: string | null | undefined,
) {
  if (!key) {
    return DEFAULT_COLOR;
  }

  return COLOR_BY_KEY.get(key as SkatingBrainstormColorKey) ?? DEFAULT_COLOR;
}
