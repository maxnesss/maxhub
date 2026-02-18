import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";

const COST_ITEMS = [
  { item: "Notary and registration", estimate: "4,000-7,000 CZK" },
  { item: "Trade license fee", estimate: "1,000 CZK" },
  { item: "Total setup estimate", estimate: "~5,000-8,000 CZK" },
];

const BANK_OPTIONS = [
  "Fio banka",
  "Air Bank",
  "Ceska sporitelna",
  "Raiffeisenbank",
];

const ACCOUNTING_OPTIONS = [
  "Pohoda",
  "Money S3",
  "iDoklad",
  "External accountant",
  "Custom setup",
];

export default async function BambooFinanceRequirementsPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";

  const costItems = isZh
    ? COST_ITEMS.map((row) => ({
      ...row,
      item:
          row.item === "Notary and registration"
            ? "公证与注册"
            : row.item === "Trade license fee"
              ? "营业许可费用"
              : "设立总成本估算",
    }))
    : COST_ITEMS;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "公司设立" : "Company setup", href: "/apps/bamboo/company-setup" },
            { label: isZh ? "公司设立财务要求" : "Company setup finance requirements" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "公司设立财务要求" : "Company setup finance requirements"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh ? "公司设立期间必须关注的关键资金检查点。" : "Key money checkpoints needed during company setup."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "基础成本" : "Cost baseline"}
          </h2>
          <ul className="mt-4 space-y-2">
            {costItems.map((row) => (
              <li
                key={row.item}
                className="flex items-center justify-between rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm"
              >
                <span className="text-[#314567]">{row.item}</span>
                <span className="font-semibold text-[#1a2b49]">{row.estimate}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "资金建议" : "Capital guidance"}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[#314567]">
            {isZh ? (
              <>
                <li>法定最低注册资本为每位股东 1 CZK。</li>
                <li>实践上建议目标为 20,000-40,000 CZK。</li>
                <li>本计划当前采用 20,000 CZK 作为基线。</li>
                <li>资本入账证明应归档到 Documents。</li>
              </>
            ) : (
              <>
                <li>Legal minimum is 1 CZK per shareholder.</li>
                <li>Recommended practical target is 20,000-40,000 CZK.</li>
                <li>Working baseline in this plan is 20,000 CZK.</li>
                <li>Capital deposit confirmation should be archived in Documents.</li>
              </>
            )}
          </ul>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "银行选项" : "Bank options"}
          </h2>
          <ul className="mt-4 space-y-2">
            {BANK_OPTIONS.map((bank) => (
              <li
                key={bank}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {bank}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "会计选项" : "Accounting options"}
          </h2>
          <ul className="mt-4 space-y-2">
            {ACCOUNTING_OPTIONS.map((tool) => (
              <li
                key={tool}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tool}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
