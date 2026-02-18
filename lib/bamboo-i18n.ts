export type BambooLocale = "en" | "zh";

export const BAMBOO_LOCALE_COOKIE_KEY = "bamboo-locale";
export const BAMBOO_DEFAULT_LOCALE: BambooLocale = "en";

export const BAMBOO_LOCALE_OPTIONS = ["en", "zh"] as const;

export function parseBambooLocale(value: string | null | undefined): BambooLocale {
  if (value === "zh") {
    return "zh";
  }

  return BAMBOO_DEFAULT_LOCALE;
}

type BambooCopy = {
  language: string;
  english: string;
  mandarin: string;
  workspaceTitle: string;
  workspaceDescription: string;
  openStartHere: string;
  journeyControlsTitle: string;
  journeyControlsDescription: string;
  startJourney: string;
  turnJourneyOn: string;
  turnJourneyOff: string;
  journeyStep: string;
  previous: string;
  next: string;
  firstStep: string;
  journeyComplete: string;
  startHereTitle: string;
  startHereDescription: string;
  openNameBrainstorm: string;
  openCompanySetup: string;
  suggestedFirst30Minutes: string;
  startHereStep1: string;
  startHereStep2: string;
  startHereStep3: string;
  startHereStep4: string;
  startHereStep5: string;
  openStage: string;
};

const EN_COPY: BambooCopy = {
  language: "Language",
  english: "English",
  mandarin: "Mandarin",
  workspaceTitle: "Bamboo workspace",
  workspaceDescription:
    "Main workspace for your Bamboo project. Open sections by category and track setup, tasks, inventory, shop, and finance in one place.",
  openStartHere: "Open start here",
  journeyControlsTitle: "Journey controls",
  journeyControlsDescription:
    "Start the journey from the first step, and turn the bottom journey navigation on or off.",
  startJourney: "Start journey",
  turnJourneyOn: "Turn journey on",
  turnJourneyOff: "Turn journey off",
  journeyStep: "Journey step",
  previous: "Previous",
  next: "Next",
  firstStep: "first step",
  journeyComplete: "journey complete",
  startHereTitle: "Start here",
  startHereDescription:
    "One-page quick start for the Bamboo app. Follow the journey in this order: Name brainstorm, Setup, Inventory, Shop, then Launch.",
  openNameBrainstorm: "Open name brainstorm",
  openCompanySetup: "Open company setup",
  suggestedFirst30Minutes: "Suggested first 30 minutes",
  startHereStep1: "Open Name brainstorm and shortlist 3-5 options.",
  startHereStep2: "Review Company setup and confirm legal form plus key registration steps.",
  startHereStep3: "Open Inventory brainstorm and write your first shortlist of products.",
  startHereStep4: "Open Shop budget and add your first cost assumptions.",
  startHereStep5: "Open Tasks and add 3 must-do items with owners and deadlines.",
  openStage: "Open stage",
};

const ZH_COPY: BambooCopy = {
  language: "语言",
  english: "英文",
  mandarin: "中文",
  workspaceTitle: "Bamboo 工作台",
  workspaceDescription:
    "Bamboo 项目的主工作台。按模块打开页面，在一个地方跟踪公司设立、任务、货品、门店和财务。",
  openStartHere: "打开开始页面",
  journeyControlsTitle: "旅程控制",
  journeyControlsDescription: "从第一步开始旅程，并可随时开启或关闭底部旅程导航。",
  startJourney: "开始旅程",
  turnJourneyOn: "开启旅程导航",
  turnJourneyOff: "关闭旅程导航",
  journeyStep: "旅程步骤",
  previous: "上一步",
  next: "下一步",
  firstStep: "第一步",
  journeyComplete: "旅程已完成",
  startHereTitle: "开始页面",
  startHereDescription:
    "Bamboo 的单页快速上手。建议顺序：命名头脑风暴 → 公司设立 → 货品 → 门店 → 启动。",
  openNameBrainstorm: "打开命名头脑风暴",
  openCompanySetup: "打开公司设立",
  suggestedFirst30Minutes: "建议的前 30 分钟",
  startHereStep1: "打开命名头脑风暴，并筛选 3-5 个候选名称。",
  startHereStep2: "查看公司设立页面，确认法律形式和关键注册步骤。",
  startHereStep3: "打开货品头脑风暴，写下第一版产品清单。",
  startHereStep4: "打开门店预算，先录入第一批成本假设。",
  startHereStep5: "打开任务页，新增 3 个必须完成的任务并指定负责人和截止日期。",
  openStage: "打开阶段",
};

const BAMBOO_COPY_BY_LOCALE = {
  en: EN_COPY,
  zh: ZH_COPY,
} as const;

export function getBambooCopy(locale: BambooLocale) {
  return BAMBOO_COPY_BY_LOCALE[locale];
}
