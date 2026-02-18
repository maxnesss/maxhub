import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { BAMBOO_IMPORT_TO_CZ_STEPS } from "@/lib/bamboo-content";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";

const IMPORT_RISKS = [
  "Wrong HS code and wrong duty calculation",
  "Sample quality differs from final production quality",
  "Shipping delays in peak seasons or holidays",
  "Hidden costs in freight, customs, and local handling",
  "Missing documents that delay customs clearance",
];

const IMPORT_RISKS_ZH = [
  "HS 编码错误导致关税计算错误",
  "样品质量与量产质量不一致",
  "旺季或节假日运输延误",
  "货代、报关、本地处理存在隐性成本",
  "文件不完整导致清关延迟",
];

const IMPORT_STEPS_ZH = [
  {
    step: 1,
    title: "明确产品规格与合规要求",
    details: [
      "为每个 SKU 写清规格（材质、尺寸、表面处理、包装）。",
      "确认欧盟合规要求（安全、标签、包装）。",
      "联系供应商前先设定目标落地成本与毛利。",
    ],
  },
  {
    step: 2,
    title: "向候选工厂询价并索样",
    details: [
      "使用统一 RFQ 模板，便于横向对比报价。",
      "下样并检查质量、耐用性与包装。",
      "淘汰溯源差或缺少质检文件的供应商。",
    ],
  },
  {
    step: 3,
    title: "谈判条款并下采购单",
    details: [
      "确认 MOQ、价格、交期与付款条款。",
      "采购单中明确质量与包装要求。",
      "早期进口通常使用 FOB 更易控制运费。",
    ],
  },
  {
    step: 4,
    title: "安排中国到捷克的运输",
    details: [
      "按成本与时效选择海运/铁路/空运。",
      "选择熟悉捷克/欧盟进口流程的货代。",
      "准备发票、装箱单与运输单据。",
    ],
  },
  {
    step: 5,
    title: "在捷克完成清关与税务处理",
    details: [
      "办理 EORI，并确定由谁申报（报关行/货代）。",
      "完成商品归类（HS 编码）并计算关税与 VAT。",
      "保存报关文件用于记账和合规审计。",
    ],
  },
  {
    step: 6,
    title: "收货、验货并入库",
    details: [
      "到货后检查数量与破损情况。",
      "核对到货数量与采购单、装箱单一致。",
      "从第一天开始建立 SKU 记录与补货点。",
    ],
  },
];

export default async function BambooImportToCzechPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const importSteps = isZh ? IMPORT_STEPS_ZH : BAMBOO_IMPORT_TO_CZ_STEPS;
  const importRisks = isZh ? IMPORT_RISKS_ZH : IMPORT_RISKS;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "货品" : "Inventory", href: "/apps/bamboo/inventory" },
            { label: isZh ? "进口到捷克" : "Import to Czech Republic" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "产品进口到捷克" : "Import products to Czech Republic"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "从中国供应商到捷克入库的分步骤流程。"
            : "Step-by-step flow from China supplier to stock in Czech Republic."}
        </p>
      </section>

      <section className="mt-6 space-y-3">
        {importSteps.map((step) => (
          <article key={step.step} className="rounded-2xl border border-(--line) bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#6a7b9c] uppercase">
              {isZh ? `步骤 ${step.step}` : `Step ${step.step}`}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
              {step.title}
            </h2>
            <ul className="mt-4 space-y-2">
              {step.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2 text-sm text-[#314567]">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "常见风险" : "Common risks"}
        </h2>
        <ul className="mt-4 space-y-2">
          {importRisks.map((risk) => (
            <li key={risk} className="flex items-start gap-2 text-sm text-[#314567]">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#ffb69b]" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
