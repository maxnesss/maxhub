import type { BambooLocale } from "@/lib/bamboo-i18n";

import {
  BAMBOO_BRAND_SETUP_GROUPS,
  BAMBOO_COMPANY_SETUP_STEPS,
  BAMBOO_INVENTORY_EXTRA_IDEAS,
  type BambooBrandSetupGroup,
  type BambooChecklistStep,
  type BambooTile,
} from "@/lib/bamboo-content";

const TILE_TITLE_ZH: Record<string, string> = {
  "Start here": "开始页面",
  Overview: "概览",
  "Project Charter": "项目章程",
  Tasks: "任务",
  "Phase overview": "阶段概览",
  "Finance setup": "财务设置",
  "Name brainstorm": "命名头脑风暴",
  "Inventory budget": "货品预算",
  Inventory: "货品",
  "Inventory brainstorm": "货品头脑风暴",
  "Producers contact": "供应商联系",
  "Import of products": "产品进口",
  "Shop overview": "门店概览",
  Location: "选址",
  Concept: "概念",
  Budget: "预算",
  "Target legal form and structure": "目标法律形式与结构",
  "Company setup": "公司设立",
  "Legal and compliance": "法律与合规",
  "Company setup finance requirements": "公司设立财务要求",
  Documents: "文档",
  "Eshop + webpage": "网店 + 网站",
};

const TILE_BADGE_ZH: Record<string, string> = {
  Guide: "指南",
  Core: "核心",
  Strategy: "战略",
  Action: "行动",
  Phases: "阶段",
  Finance: "财务",
  Brand: "品牌",
  Budget: "预算",
  Supply: "供应",
  Catalog: "选品",
  Vendors: "供应商",
  Import: "进口",
  Commerce: "商业",
  Location: "选址",
  Concept: "概念",
  Foundation: "基础",
  Execution: "执行",
  Legal: "合规",
  Setup: "设立",
  Files: "文件",
  Digital: "数字",
};

const TILE_DESCRIPTION_ZH: Record<string, string> = {
  "Quick onboarding page with the recommended journey order.":
    "快速上手页，按推荐顺序开始旅程。",
  "Quick project summary: setup, brand, tasks, and finance.":
    "项目快速摘要：设立、品牌、任务与财务。",
  "Main plan: goals, scope, launch targets, and key risks.":
    "主计划：目标、范围、上线目标与关键风险。",
  "Task board with category filters and clear owners.":
    "按分类筛选的任务看板，并明确负责人。",
  "4 launch phases in one timeline.": "将 4 个启动阶段放在同一时间线。",
  "Simple finance plan for operations and growth.": "面向运营与增长的简明财务计划。",
  "Name ideas by style with a shortlist.": "按风格整理命名想法并维护候选列表。",
  "Editable startup and recurring inventory costs.":
    "可编辑的启动与周期性货品成本。",
  "Inventory planning hub from idea to stock.": "从想法到入库的货品规划中心。",
  "Product category ideas and target price ranges.":
    "产品分类想法与目标价格区间。",
  "Supplier channels and contact tracker.": "供应商渠道与联系跟踪表。",
  "Simple China to Czech import steps.": "简化的中国到捷克进口步骤。",
  "Shop plan: channels, operations, and launch readiness.":
    "门店规划：渠道、运营与开业准备。",
  "Location strategy and rental tracking.": "选址策略与租赁跟踪。",
  "Store concept, target size, and rent range.": "门店概念、目标面积与租金区间。",
  "One-time and monthly shop budget lines.": "门店一次性与月度预算条目。",
  "Why s.r.o., key tradeoffs, and simple company structure.":
    "为何选择 s.r.o.、关键取舍与简化公司结构。",
  "Step-by-step s.r.o. setup plan in Czechia.": "捷克 s.r.o. 的分步设立计划。",
  "Licensing, tax, and key legal duties.": "许可证、税务与关键法律义务。",
  "Setup costs, capital, and finance checkpoints.": "设立成本、资本与财务检查点。",
  "Shared files for contracts, plans, and notes.": "共享合同、计划与笔记文件。",
  "Online store and website launch plan.": "网店和官网上线计划。",
};

const OVERVIEW_STAT_LABEL_ZH: Record<string, string> = {
  "Target legal form": "目标法律形式",
  "Estimated setup time": "预计设立时间",
  "Estimated setup cost": "预计设立成本",
  "Recommended capital": "建议资本",
  "Task completion": "任务完成度",
};

const OVERVIEW_STAT_VALUE_ZH: Record<string, string> = {
  "s.r.o. (Czech Republic)": "s.r.o.（捷克）",
  "6-10 weeks": "6-10 周",
};

const NAME_GROUP_CATEGORY_ZH: Record<string, string> = {
  "Natural and elegant": "自然与优雅",
  "Minimal and modern": "极简与现代",
  "Eco and sustainable": "环保与可持续",
  "Zen and oriental": "禅意与东方风格",
  Wordplay: "创意文字",
  "Premium and luxury": "高端与精品",
  "Czech local identity": "捷克本地风格",
  "Global ecommerce friendly": "国际电商友好",
};

const BRAND_GROUP_TITLE_ZH: Record<string, string> = {
  "Brand foundation": "品牌基础",
  "Visual identity": "视觉识别",
  "Launch assets": "上线素材",
};

const BRAND_GROUP_STEP_ZH: Record<string, string> = {
  "Define mission, target customer, and value promise.":
    "明确使命、目标客户与价值主张。",
  "Pick final name and secure domain/social handles.":
    "确定最终名称并注册域名/社媒账号。",
  "Write simple tone-of-voice and messaging rules.":
    "制定简明语气与信息表达规则。",
  "Create logo set and simple icon rules.": "建立 Logo 方案并定义基础图标规则。",
  "Choose colors and typography for web and print.": "确定网页与印刷使用的颜色和字体。",
  "Set packaging and label design basics.": "确定包装与标签设计基础规范。",
  "Prepare product photos and simple lifestyle images.":
    "准备产品图与基础场景图。",
  "Create website copy templates and product page format.":
    "建立网站文案模板与商品页结构。",
  "Build launch checklist for store, legal pages, and first campaign.":
    "建立上线清单：店铺、法律页面和首轮营销。",
};

const INVENTORY_EXTRA_IDEAS_ZH = [
  "在发货前与到货后都执行质量检查。",
  "跟踪落地成本（运费、关税、VAT、包装、损耗）。",
  "按质量、速度和沟通效率给供应商评分。",
  "为核心 SKU 设置最小库存和补货点。",
  "优化包装以提升可持续性并降低破损率。",
];

const COMPANY_SETUP_STEPS_ZH: BambooChecklistStep[] = [
  {
    id: 1,
    title: "选择公司名称",
    details: [
      "确认名称在捷克商业登记中是唯一的。",
      "公司名称中包含“s.r.o.”（或“spol. s r.o.”）。",
      "避免与现有公司名称过于相似。",
    ],
  },
  {
    id: 2,
    title: "确定股东与执行董事",
    details: [
      "至少需要一名股东。",
      "至少需要一名执行董事（jednatel）。",
      "同一人可以同时担任两个角色。",
    ],
  },
  {
    id: 3,
    title: "设置注册资本",
    details: [
      "法定最低为每位股东 1 CZK。",
      "实际建议目标为 20,000-40,000 CZK。",
      "公证步骤后将资本存入公司账户。",
    ],
  },
  {
    id: 4,
    title: "准备设立文件",
    details: [
      "准备公司设立契约/章程。",
      "准备执行董事名单与签字样本。",
      "准备注册地址证明（租赁合同或业主同意书）。",
    ],
  },
  {
    id: 5,
    title: "确定注册地址",
    details: [
      "注册地址必须在捷克共和国境内。",
      "使用真实经营地址（门店或办公室）。",
      "当前计划：使用 Modrany 的 Babi 地址作为注册地址。",
    ],
  },
  {
    id: 6,
    title: "办理公证并登记",
    details: [
      "公证人审核文件并出具公证文书。",
      "公证人向商业登记系统提交电子注册。",
      "若文件齐全，通常费用 4,000-7,000 CZK，耗时 1-3 天。",
    ],
  },
  {
    id: 7,
    title: "开设公司银行账户",
    details: [
      "开立用于资本存入和日常经营的账户。",
      "保留银行出具的资本入账证明。",
      "常见选项：Fio、Air Bank、Ceska sporitelna、Raiffeisenbank。",
    ],
  },
  {
    id: 8,
    title: "完成税务登记",
    details: [
      "公司注册后 15 天内完成企业所得税登记。",
      "超过阈值或部分欧盟场景下需强制 VAT。",
      "涉及用工等场景时同步处理相关税务。",
    ],
  },
  {
    id: 9,
    title: "办理营业许可",
    details: [
      "竹制品销售可使用自由贸易许可类别。",
      "向贸易许可办公室提交申请。",
      "费用为 1,000 CZK，通常约 5 个工作日。",
    ],
  },
  {
    id: 10,
    title: "建立内部财务与文档基础",
    details: [
      "从第一天开始建立发票与收据归档流程。",
      "明确谁审批费用、如何跟踪付款。",
      "准备实际会用到的核心模板（报价、合同、发票）。",
    ],
  },
  {
    id: 11,
    title: "会计设置",
    details: [
      "s.r.o. 采用复式记账。",
      "选择会计或工具（Pohoda、Money S3、iDoklad）。",
      "从第一天起归档发票、收据与合同。",
    ],
  },
];

export function localizeBambooTile(tile: BambooTile, locale: BambooLocale): BambooTile {
  if (locale !== "zh") {
    return tile;
  }

  return {
    ...tile,
    title: TILE_TITLE_ZH[tile.title] ?? tile.title,
    description: TILE_DESCRIPTION_ZH[tile.description] ?? tile.description,
    badge: TILE_BADGE_ZH[tile.badge] ?? tile.badge,
  };
}

export function localizeBambooOverviewStatLabel(label: string, locale: BambooLocale) {
  if (locale !== "zh") {
    return label;
  }

  return OVERVIEW_STAT_LABEL_ZH[label] ?? label;
}

export function localizeBambooOverviewStatValue(value: string, locale: BambooLocale) {
  if (locale !== "zh") {
    return value;
  }

  return OVERVIEW_STAT_VALUE_ZH[value] ?? value;
}

export function getLocalizedBambooCompanySetupSteps(locale: BambooLocale): BambooChecklistStep[] {
  if (locale !== "zh") {
    return BAMBOO_COMPANY_SETUP_STEPS;
  }

  return COMPANY_SETUP_STEPS_ZH;
}

export function localizeBambooNameGroupCategory(category: string, locale: BambooLocale) {
  if (locale !== "zh") {
    return category;
  }

  return NAME_GROUP_CATEGORY_ZH[category] ?? category;
}

export function getLocalizedBambooBrandSetupGroups(locale: BambooLocale): BambooBrandSetupGroup[] {
  if (locale !== "zh") {
    return BAMBOO_BRAND_SETUP_GROUPS;
  }

  return BAMBOO_BRAND_SETUP_GROUPS.map((group) => ({
    title: BRAND_GROUP_TITLE_ZH[group.title] ?? group.title,
    steps: group.steps.map((step) => BRAND_GROUP_STEP_ZH[step] ?? step),
  }));
}

export function getLocalizedBambooInventoryExtraIdeas(locale: BambooLocale) {
  if (locale !== "zh") {
    return BAMBOO_INVENTORY_EXTRA_IDEAS;
  }

  return INVENTORY_EXTRA_IDEAS_ZH;
}
