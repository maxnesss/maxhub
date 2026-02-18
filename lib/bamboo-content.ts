export type BambooTile = {
  title: string;
  href: string;
  description: string;
  badge: string;
};

export type BambooChecklistStep = {
  id: number;
  title: string;
  details: string[];
};

export type BambooNameGroup = {
  category: string;
  names: string[];
};

export type BambooBrandSetupGroup = {
  title: string;
  steps: string[];
};

export type BambooInventoryItem = {
  category: string;
  notes: string;
  targetPriceBand: string;
};

export type BambooImportStep = {
  step: number;
  title: string;
  details: string[];
};

export const BAMBOO_GENERAL_TILES: BambooTile[] = [
  {
    title: "Start here",
    href: "/apps/bamboo/start-here",
    description: "Quick onboarding page with the recommended journey order.",
    badge: "Guide",
  },
  {
    title: "Overview",
    href: "/apps/bamboo/overview",
    description: "Quick project summary: setup, brand, tasks, and finance.",
    badge: "Core",
  },
  {
    title: "Project Charter",
    href: "/apps/bamboo/project-charter",
    description: "Main plan: goals, scope, launch targets, and key risks.",
    badge: "Strategy",
  },
  {
    title: "Tasks",
    href: "/apps/bamboo/tasks",
    description: "Task board with category filters and clear owners.",
    badge: "Action",
  },
  {
    title: "Phase overview",
    href: "/apps/bamboo/timeline",
    description: "4 launch phases in one timeline.",
    badge: "Phases",
  },
  {
    title: "Finance setup",
    href: "/apps/bamboo/finance",
    description: "Simple finance plan for operations and growth.",
    badge: "Finance",
  },
  {
    title: "Name and brand",
    href: "/apps/bamboo/name-brand",
    description: "Name ideas by style with a shortlist.",
    badge: "Brand",
  },
];

export const BAMBOO_INVENTORY_TILES: BambooTile[] = [
  {
    title: "Inventory budget",
    href: "/apps/bamboo/inventory/budget",
    description: "Editable startup and recurring inventory costs.",
    badge: "Budget",
  },
  {
    title: "Inventory",
    href: "/apps/bamboo/inventory",
    description: "Inventory planning hub from idea to stock.",
    badge: "Supply",
  },
  {
    title: "Inventory brainstorm",
    href: "/apps/bamboo/inventory/brainstorm",
    description: "Product category ideas and target price ranges.",
    badge: "Catalog",
  },
  {
    title: "Producers contact",
    href: "/apps/bamboo/inventory/producers-contact",
    description: "Supplier channels and contact tracker.",
    badge: "Vendors",
  },
  {
    title: "Import of products",
    href: "/apps/bamboo/inventory/import-to-czech",
    description: "Simple China to Czech import steps.",
    badge: "Import",
  },
];

export const BAMBOO_SHOP_TILES: BambooTile[] = [
  {
    title: "Shop overview",
    href: "/apps/bamboo/shop",
    description: "Shop plan: channels, operations, and launch readiness.",
    badge: "Commerce",
  },
  {
    title: "Location",
    href: "/apps/bamboo/shop/location",
    description: "Location strategy and rental tracking.",
    badge: "Location",
  },
  {
    title: "Concept",
    href: "/apps/bamboo/shop/concept",
    description: "Store concept, target size, and rent range.",
    badge: "Concept",
  },
  {
    title: "Budget",
    href: "/apps/bamboo/shop/budget",
    description: "One-time and monthly shop budget lines.",
    badge: "Budget",
  },
];

export const BAMBOO_SETUP_COMPANY_TILES: BambooTile[] = [
  {
    title: "Target legal form and structure",
    href: "/apps/bamboo/target-legal-form",
    description: "Why s.r.o., key tradeoffs, and simple company structure.",
    badge: "Foundation",
  },
  {
    title: "Company setup",
    href: "/apps/bamboo/company-setup",
    description: "Step-by-step s.r.o. setup plan in Czechia.",
    badge: "Execution",
  },
  {
    title: "Legal and compliance",
    href: "/apps/bamboo/legal-compliance",
    description: "Licensing, tax, and key legal duties.",
    badge: "Legal",
  },
  {
    title: "Finance requirements",
    href: "/apps/bamboo/company-setup/finance-requirements",
    description: "Setup costs, capital, and finance checkpoints.",
    badge: "Setup",
  },
];

export const BAMBOO_DOCUMENT_TILES: BambooTile[] = [
  {
    title: "Documents",
    href: "/apps/bamboo/documents",
    description: "Shared files for contracts, plans, and notes.",
    badge: "Files",
  },
];

export const BAMBOO_ESHOP_TILES: BambooTile[] = [
  {
    title: "Eshop + webpage",
    href: "/apps/bamboo/eshop",
    description: "Online store and website launch plan.",
    badge: "Digital",
  },
];

export const BAMBOO_TILES: BambooTile[] = [
  ...BAMBOO_GENERAL_TILES,
  ...BAMBOO_INVENTORY_TILES,
  ...BAMBOO_SETUP_COMPANY_TILES,
  ...BAMBOO_SHOP_TILES,
  ...BAMBOO_ESHOP_TILES,
  ...BAMBOO_DOCUMENT_TILES,
];

export const BAMBOO_COMPANY_SETUP_STEPS: BambooChecklistStep[] = [
  {
    id: 1,
    title: "Choose company name",
    details: [
      "Check that the name is unique in the Czech Commercial Register.",
      "Include 's.r.o.' (or 'spol. s r.o.') in the name.",
      "Avoid names that are too similar to existing companies.",
    ],
  },
  {
    id: 2,
    title: "Choose founders and managing directors",
    details: [
      "You need at least one founder.",
      "You need at least one managing director (jednatel).",
      "One person can do both roles.",
    ],
  },
  {
    id: 3,
    title: "Set registered capital",
    details: [
      "Legal minimum is 1 CZK per shareholder.",
      "Practical target is 20,000-40,000 CZK.",
      "Deposit capital to the business account after the notary step.",
    ],
  },
  {
    id: 4,
    title: "Prepare founding documents",
    details: [
      "Prepare deed/memorandum of association.",
      "Prepare managing director list and signature samples.",
      "Prepare registered office proof (lease or owner consent).",
    ],
  },
  {
    id: 5,
    title: "Choose registered office",
    details: [
      "Office address must be in the Czech Republic.",
      "Use your real operating address (shop or office).",
      "Current plan: use Babi in Modrany as registered office.",
    ],
  },
  {
    id: 6,
    title: "Visit notary and register",
    details: [
      "Notary checks documents and prepares notarial deed.",
      "Notary files electronic registration to the Commercial Register.",
      "Typical cost is 4,000-7,000 CZK and 1-3 days if complete.",
    ],
  },
  {
    id: 7,
    title: "Open business bank account",
    details: [
      "Open account for capital deposit and daily operations.",
      "Keep bank confirmation of deposited capital.",
      "Common options: Fio, Air Bank, Ceska sporitelna, Raiffeisenbank.",
    ],
  },
  {
    id: 8,
    title: "Register for taxes",
    details: [
      "Register income tax within 15 days after company registration.",
      "VAT becomes mandatory above threshold or in some EU cases.",
      "Handle payroll/other taxes when they apply.",
    ],
  },
  {
    id: 9,
    title: "Obtain business license",
    details: [
      "For bamboo product sales, use the free trade license category.",
      "Apply at the Trade Licensing Office.",
      "Fee is 1,000 CZK, typical lead time ~5 business days.",
    ],
  },
  {
    id: 10,
    title: "Optional e-commerce and EU trade registration",
    details: [
      "Prepare website legal text (GDPR, terms, cookies).",
      "If selling in EU, check OSS and VAT registration needs.",
    ],
  },
  {
    id: 11,
    title: "Accounting setup",
    details: [
      "s.r.o. uses double-entry accounting.",
      "Pick an accountant or tool (Pohoda, Money S3, iDoklad).",
      "Archive invoices, receipts, and contracts from day one.",
    ],
  },
];

export const BAMBOO_NAME_GROUPS: BambooNameGroup[] = [
  {
    category: "Natural and elegant",
    names: [
      "Bambusova Duse",
      "Bamboo Essence",
      "Pribeh Bambusu",
      "Bambus and Ticho",
      "PureBamboo",
    ],
  },
  {
    category: "Minimal and modern",
    names: ["BAM.", "Bambu", "BAMBOO+", "MOBOO", "BAM Studio", "BOO."],
  },
  {
    category: "Eco and sustainable",
    names: ["Z Bambusu", "EcoBoo", "Leaf and Line", "ReBamboo"],
  },
  {
    category: "Zen and oriental",
    names: [
      "Bambusovy Chram",
      "ZenBoo",
      "Bamboo Spirit",
      "TaoBamboo",
      "Bamboo Harmony",
    ],
  },
  {
    category: "Wordplay",
    names: ["Bamboolab", "Boohouse", "Bam!boo", "Bambuska"],
  },
  {
    category: "Premium and luxury",
    names: ["Bamboo Atelier", "Bamboo Noble", "Maison Bamboo", "Bamboo Signature"],
  },
  {
    category: "Czech local identity",
    names: ["Bambus Praha", "Cesky Bambus", "Bambus Domov", "Bambus Market"],
  },
  {
    category: "Global ecommerce friendly",
    names: ["BambooNest", "BambooVibe", "BambooAura", "BambooNova"],
  },
];

export const BAMBOO_SHORTLIST = [
  "BambooFuture s.r.o.",
  "PureBamboo s.r.o.",
  "ZenBoo s.r.o.",
  "Bamboolab s.r.o.",
];

export const BAMBOO_OVERVIEW_STATS = [
  { label: "Target legal form", value: "s.r.o. (Czech Republic)" },
  { label: "Estimated setup time", value: "6-10 weeks" },
  { label: "Estimated setup cost", value: "10,000-15,000 CZK" },
  { label: "Recommended capital", value: "10,000 CZK" },
];

export const BAMBOO_INVENTORY_BRAINSTORM: BambooInventoryItem[] = [
  {
    category: "Kitchen and dining",
    notes: "Bamboo cutting boards, utensils, storage organizers, serving trays.",
    targetPriceBand: "150-900 CZK",
  },
  {
    category: "Bathroom and personal care",
    notes: "Toothbrushes, soap trays, organizers, reusable accessories.",
    targetPriceBand: "80-500 CZK",
  },
  {
    category: "Home organization",
    notes: "Shelves, boxes, drawer organizers, desk accessories.",
    targetPriceBand: "200-1,500 CZK",
  },
  {
    category: "Furniture and decor",
    notes: "Stools, side tables, lamps, minimalist decorative pieces.",
    targetPriceBand: "800-5,000 CZK",
  },
  {
    category: "Gift and bundles",
    notes: "Starter eco sets, gift boxes, seasonal bundles.",
    targetPriceBand: "350-1,800 CZK",
  },
];

export const BAMBOO_PRODUCER_CONTACT_FIELDS = [
  "Company name",
  "Contact person",
  "Email / WeChat / Alibaba profile",
  "City / Province in China",
  "Product specialization",
  "MOQ (minimum order quantity)",
  "Sample lead time",
  "Production lead time",
  "Certifications (FSC, BSCI, ISO)",
  "Incoterm offered (EXW, FOB, CIF, DDP)",
  "Notes and risk flags",
];

export const BAMBOO_SOURCING_CHANNELS = [
  "Alibaba verified suppliers",
  "Global Sources",
  "Made-in-China",
  "Trade fairs (Canton Fair, Ambiente sourcing contacts)",
  "Sourcing agents in China",
];

export const BAMBOO_IMPORT_TO_CZ_STEPS: BambooImportStep[] = [
  {
    step: 1,
    title: "Define product spec and compliance requirements",
    details: [
      "Write clear spec for each SKU (material, size, finish, packaging).",
      "Confirm EU compliance needs (safety, labeling, packaging).",
      "Set target landed cost and margin before contacting suppliers.",
    ],
  },
  {
    step: 2,
    title: "Request quotes and samples from shortlisted producers",
    details: [
      "Use one RFQ template so supplier quotes are comparable.",
      "Order samples and check quality, durability, and packaging.",
      "Skip suppliers with weak traceability or no quality docs.",
    ],
  },
  {
    step: 3,
    title: "Negotiate terms and place purchase order",
    details: [
      "Agree MOQ, price, lead time, and payment terms.",
      "Use PO with clear quality and packaging requirements.",
      "FOB is often easier for freight control in early imports.",
    ],
  },
  {
    step: 4,
    title: "Arrange freight from China to Czech Republic",
    details: [
      "Choose sea/rail/air based on cost and speed.",
      "Use a freight forwarder familiar with Czech/EU imports.",
      "Prepare invoice, packing list, and transport documents.",
    ],
  },
  {
    step: 5,
    title: "Handle customs clearance and taxes in Czech Republic",
    details: [
      "Set EORI and who files import declaration (broker/forwarder).",
      "Classify goods (HS codes) and calculate duty + VAT.",
      "Store customs documents for accounting and compliance.",
    ],
  },
  {
    step: 6,
    title: "Receive, inspect, and stock inventory",
    details: [
      "Inspect incoming goods and check for damage.",
      "Match delivered quantity to PO and packing list.",
      "Create SKU records and reorder points from day one.",
    ],
  },
];

export const BAMBOO_INVENTORY_EXTRA_IDEAS = [
  "Define quality checks before shipment and on arrival.",
  "Track landed cost (freight, duty, VAT, packaging, defects).",
  "Score suppliers by quality, speed, and communication.",
  "Set minimum stock and reorder points for top SKUs.",
  "Improve packaging for sustainability and fewer damages.",
];

export const BAMBOO_BRAND_SETUP_GROUPS: BambooBrandSetupGroup[] = [
  {
    title: "Brand foundation",
    steps: [
      "Define mission, target customer, and value promise.",
      "Pick final name and secure domain/social handles.",
      "Write simple tone-of-voice and messaging rules.",
    ],
  },
  {
    title: "Visual identity",
    steps: [
      "Create logo set and simple icon rules.",
      "Choose colors and typography for web and print.",
      "Set packaging and label design basics.",
    ],
  },
  {
    title: "Launch assets",
    steps: [
      "Prepare product photos and simple lifestyle images.",
      "Create website copy templates and product page format.",
      "Build launch checklist for store, legal pages, and first campaign.",
    ],
  },
];
