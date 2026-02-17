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
    title: "Overview",
    href: "/apps/bamboo/overview",
    description: "Whole-project overview across setup, branding, tasks, and finance.",
    badge: "Core",
  },
  {
    title: "Project Charter",
    href: "/apps/bamboo/project-charter",
    description: "Single source of truth for vision, scope, launch criteria, and risks.",
    badge: "Strategy",
  },
  {
    title: "Tasks",
    href: "/apps/bamboo/tasks",
    description: "Shared execution board with category filters and ownership.",
    badge: "Action",
  },
  {
    title: "Phase overview",
    href: "/apps/bamboo/timeline",
    description: "Four-phase launch sequence across all Bamboo categories.",
    badge: "Phases",
  },
  {
    title: "Finance setup",
    href: "/apps/bamboo/finance",
    description: "General financial planning model for operations and growth.",
    badge: "Finance",
  },
  {
    title: "Name and brand",
    href: "/apps/bamboo/name-brand",
    description: "Name brainstorm grouped by style with shortlist candidates.",
    badge: "Brand",
  },
];

export const BAMBOO_INVENTORY_TILES: BambooTile[] = [
  {
    title: "Inventory budget",
    href: "/apps/bamboo/inventory/budget",
    description: "Editable initial and periodical inventory cost estimates.",
    badge: "Budget",
  },
  {
    title: "Inventory",
    href: "/apps/bamboo/inventory",
    description: "Inventory planning hub and operating framework.",
    badge: "Supply",
  },
  {
    title: "Inventory brainstorm",
    href: "/apps/bamboo/inventory/brainstorm",
    description: "Candidate product categories and launch price ranges.",
    badge: "Catalog",
  },
  {
    title: "Producers contact",
    href: "/apps/bamboo/inventory/producers-contact",
    description: "Supplier sourcing channels and qualification tracker.",
    badge: "Vendors",
  },
  {
    title: "Import of products",
    href: "/apps/bamboo/inventory/import-to-czech",
    description: "Practical China to Czech Republic import execution steps.",
    badge: "Import",
  },
];

export const BAMBOO_SHOP_TILES: BambooTile[] = [
  {
    title: "Shop overview",
    href: "/apps/bamboo/shop",
    description: "Storefront strategy, channels, operations, and launch readiness summary.",
    badge: "Commerce",
  },
  {
    title: "Location",
    href: "/apps/bamboo/shop/location",
    description: "Location strategy, candidate areas, and rental listing tracker.",
    badge: "Location",
  },
  {
    title: "Concept",
    href: "/apps/bamboo/shop/concept",
    description: "Target size, target price range, and store concept narrative.",
    badge: "Concept",
  },
  {
    title: "Budget",
    href: "/apps/bamboo/shop/budget",
    description: "Detailed budget lines with one-time and monthly cost planning.",
    badge: "Budget",
  },
];

export const BAMBOO_SETUP_COMPANY_TILES: BambooTile[] = [
  {
    title: "Company setup",
    href: "/apps/bamboo/company-setup",
    description: "Full 11-step process for setting up an s.r.o. in Czechia.",
    badge: "Execution",
  },
  {
    title: "Company structure",
    href: "/apps/bamboo/company-structure",
    description: "Founder and managing director model with role decisions.",
    badge: "Governance",
  },
  {
    title: "Legal and compliance",
    href: "/apps/bamboo/legal-compliance",
    description: "Licensing, tax registration, and employer obligations.",
    badge: "Legal",
  },
  {
    title: "Finance requirements",
    href: "/apps/bamboo/finance-requirements",
    description: "Capital, setup costs, and required financial checkpoints.",
    badge: "Setup",
  },
];

export const BAMBOO_DOCUMENT_TILES: BambooTile[] = [
  {
    title: "Documents",
    href: "/apps/bamboo/documents",
    description: "Shared file library for contracts, plans, and supporting docs.",
    badge: "Files",
  },
];

export const BAMBOO_ESHOP_TILES: BambooTile[] = [
  {
    title: "Eshop + webpage",
    href: "/apps/bamboo/eshop",
    description: "Online-store strategy, website structure, and launch readiness plan.",
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
      "Name must be unique in the Czech Commercial Register.",
      "Include 's.r.o.' or 'spol. s r.o.' suffix.",
      "Avoid close similarity to existing companies.",
    ],
  },
  {
    id: 2,
    title: "Choose founders and managing directors",
    details: [
      "Minimum one founder (natural or legal person, Czech or foreign).",
      "Minimum one managing director (jednatel).",
      "One person may hold both roles.",
    ],
  },
  {
    id: 3,
    title: "Set registered capital",
    details: [
      "Legal minimum is 1 CZK per shareholder.",
      "Practical credibility target is 10,000-50,000 CZK.",
      "Capital is deposited to dedicated account after notary stage.",
    ],
  },
  {
    id: 4,
    title: "Prepare founding documents",
    details: [
      "Deed of Foundation or Memorandum of Association.",
      "List of managing directors and specimen signatures.",
      "Registered office proof (lease or owner consent).",
    ],
  },
  {
    id: 5,
    title: "Choose registered office",
    details: [
      "Address must be in the Czech Republic.",
      "Option A: physical shop address.",
      "Option B: virtual office service (~300-1000 CZK/month).",
      "Option C (recommended): Babi in Modrany and lock this as the registered office address.",
    ],
  },
  {
    id: 6,
    title: "Visit notary and register",
    details: [
      "Notary verifies documents and prepares notarial deed.",
      "Electronic registration to Commercial Register is submitted by notary.",
      "Typical cost 4,000-7,000 CZK, usually 1-3 days if complete.",
    ],
  },
  {
    id: 7,
    title: "Open business bank account",
    details: [
      "Required for share-capital deposit and operations.",
      "Bank confirmation of deposit is required.",
      "Potential banks: Fio, Air Bank, Ceska sporitelna, Raiffeisenbank.",
    ],
  },
  {
    id: 8,
    title: "Register for taxes",
    details: [
      "Register income tax within 15 days of registration.",
      "VAT is mandatory above 2M CZK revenue or specific EU cases.",
      "Consider road tax and payroll taxes when applicable.",
    ],
  },
  {
    id: 9,
    title: "Obtain business license",
    details: [
      "For bamboo product sales use free trade license category.",
      "Apply at Trade Licensing Office.",
      "Fee is 1,000 CZK, typical lead time around 5 business days.",
    ],
  },
  {
    id: 10,
    title: "Optional e-commerce and EU trade registration",
    details: [
      "Prepare website legal texts (GDPR, e-commerce terms).",
      "For EU online sales, evaluate OSS and EU VAT registration.",
    ],
  },
  {
    id: 11,
    title: "Accounting setup",
    details: [
      "s.r.o. requires double-entry accounting.",
      "Evaluate accountant or software (Pohoda, Money S3, iDoklad).",
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
      "Prepare technical specification per SKU (materials, dimensions, finish, packaging).",
      "Confirm EU compliance needs (product safety, labeling, packaging rules).",
      "Set target landed cost and target retail margin before contacting suppliers.",
    ],
  },
  {
    step: 2,
    title: "Request quotes and samples from shortlisted producers",
    details: [
      "Collect quotes using unified RFQ template to compare suppliers consistently.",
      "Order physical samples and check quality, durability, and packaging.",
      "Reject suppliers without clear traceability or quality documentation.",
    ],
  },
  {
    step: 3,
    title: "Negotiate terms and place purchase order",
    details: [
      "Negotiate MOQ, unit price, production lead time, and payment terms.",
      "Use purchase order with clear quality and packaging requirements.",
      "Prefer FOB terms for better freight control in early imports.",
    ],
  },
  {
    step: 4,
    title: "Arrange freight from China to Czech Republic",
    details: [
      "Choose mode by volume and speed: sea (lower cost) or rail/air (faster).",
      "Select a freight forwarder experienced with Czech/EU imports.",
      "Prepare commercial invoice, packing list, and transport documents.",
    ],
  },
  {
    step: 5,
    title: "Handle customs clearance and taxes in Czech Republic",
    details: [
      "Assign EORI and import declarant (customs broker or forwarder).",
      "Classify goods with HS codes and calculate duty + VAT impact.",
      "Archive customs documents for accounting and compliance audits.",
    ],
  },
  {
    step: 6,
    title: "Receive, inspect, and stock inventory",
    details: [
      "Run incoming quality inspection and damage check at warehouse.",
      "Match delivered quantities against PO and packing list.",
      "Create SKU inventory records and reorder thresholds from day one.",
    ],
  },
];

export const BAMBOO_INVENTORY_EXTRA_IDEAS = [
  "Quality control: define AQL checks before shipment and on arrival.",
  "Landed cost model: include freight, duty, VAT, packaging, and rejection rate.",
  "Supplier scorecard: evaluate quality, reliability, communication, and flexibility.",
  "Buffer stock policy: set minimum stock and reorder points per top SKUs.",
  "Packaging strategy: optimize for sustainability and shipping damage prevention.",
];

export const BAMBOO_BRAND_SETUP_GROUPS: BambooBrandSetupGroup[] = [
  {
    title: "Brand foundation",
    steps: [
      "Define brand mission, target customer, and value proposition.",
      "Select final name and secure domain/social handles.",
      "Write tone-of-voice guide and key messaging pillars.",
    ],
  },
  {
    title: "Visual identity",
    steps: [
      "Create logo system and icon usage rules.",
      "Choose color palette and typography scale for digital and print.",
      "Prepare packaging and label design principles.",
    ],
  },
  {
    title: "Launch assets",
    steps: [
      "Prepare product photography and lifestyle imagery.",
      "Create website copy templates and product detail format.",
      "Build launch checklist for online store, legal pages, and first campaign.",
    ],
  },
];
