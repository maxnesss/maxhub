export const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type ProjectPriorityValue = (typeof PROJECT_PRIORITIES)[number];

export const PROJECT_PRIORITY_LABEL: Record<ProjectPriorityValue, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PROJECT_PRIORITY_BADGE_CLASS: Record<ProjectPriorityValue, string> = {
  LOW: "border-[#d7e3f5] bg-[#f5f8ff] text-[#4e628a]",
  MEDIUM: "border-[#f0dfb8] bg-[#fff8e8] text-[#8a6530]",
  HIGH: "border-[#f3c7be] bg-[#fff1ee] text-[#9a3f34]",
};
