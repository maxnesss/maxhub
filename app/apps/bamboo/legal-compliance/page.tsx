import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";

const LEGAL_BLOCKS = [
  {
    title: "Tax registration",
    points: [
      "Register income tax within 15 days.",
      "Register VAT when threshold/EU rules require it.",
      "Keep tax deadlines in one monthly checklist with your accountant.",
    ],
  },
  {
    title: "Business license (our use case)",
    points: [
      "Use the free trade license category for bamboo product sales (retail + wholesale).",
      "Scope for this project: import and sell bamboo home products in Czechia.",
      "Apply at Trade Licensing Office, fee is 1,000 CZK.",
      "Typical lead time is around 5 business days.",
    ],
  },
];

const REQUIRED_DOCUMENTS = [
  "Trade license confirmation",
  "Commercial Register extract",
  "Bank account + capital deposit confirmation",
  "Tax registration confirmation",
  "Core contracts (supplier, lease/office consent)",
];

const FIRST_90_DAYS_DEADLINES = [
  {
    period: "First 15 days",
    tasks: [
      "Register corporate income tax.",
      "Save all setup confirmations into Documents.",
    ],
  },
  {
    period: "First 30 days",
    tasks: [
      "Start monthly accounting routine with your accountant.",
      "Confirm invoice flow and archive process.",
    ],
  },
  {
    period: "First 90 days",
    tasks: [
      "Review turnover and VAT trigger risk.",
      "Check license scope still matches real activity.",
    ],
  },
];

export default async function BambooLegalCompliancePage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const legalBlocks = isZh
    ? LEGAL_BLOCKS.map((block) => ({
      ...block,
      title: block.title === "Tax registration" ? "税务登记" : "营业许可（本项目场景）",
    }))
    : LEGAL_BLOCKS;
  const first90DaysDeadlines = isZh
    ? FIRST_90_DAYS_DEADLINES.map((item) => ({
      ...item,
      period:
          item.period === "First 15 days"
            ? "前 15 天"
            : item.period === "First 30 days"
              ? "前 30 天"
              : "前 90 天",
    }))
    : FIRST_90_DAYS_DEADLINES;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "法律与合规" : "Legal and compliance" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "法律与合规" : "Legal and compliance"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "适用于单一所有者公司的核心法律清单：税务与营业许可。"
            : "Focused legal checklist for your one-owner setup: tax and business license."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {legalBlocks.map((block) => (
          <article key={block.title} className="rounded-2xl border border-(--line) bg-white p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[#162947]">{block.title}</h2>
            <ul className="mt-4 space-y-2">
              {block.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-[#314567]">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "必备文件" : "Required documents"}
          </h2>
          <ul className="mt-4 space-y-2">
            {REQUIRED_DOCUMENTS.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "前 90 天关键节点" : "First 90 days deadlines"}
          </h2>
          <div className="mt-4 space-y-3">
            {first90DaysDeadlines.map((item) => (
              <div key={item.period} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] p-3">
                <p className="text-sm font-semibold text-[#1a2b49]">{item.period}</p>
                <ul className="mt-2 space-y-1">
                  {item.tasks.map((task) => (
                    <li key={task} className="text-sm text-[#314567]">
                      • {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
