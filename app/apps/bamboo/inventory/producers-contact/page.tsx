import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import {
  BAMBOO_PRODUCER_CONTACT_FIELDS,
  BAMBOO_SOURCING_CHANNELS,
} from "@/lib/bamboo-content";
import { prisma } from "@/prisma";

import {
  addProducerContactAction,
  deleteProducerContactAction,
  updateProducerContactAction,
} from "./actions";
import { AddProducerModal } from "./AddProducerModal";

const QUALIFICATION_CHECKLIST = [
  "Supplier identity and registration verified",
  "Production capacity matches expected order volume",
  "Sample quality approved",
  "Lead times are realistic and documented",
  "Clear Incoterm and payment terms agreed",
  "Compliance and material certificates reviewed",
  "References or trade history validated",
];

const QUALIFICATION_CHECKLIST_ZH = [
  "已核验供应商主体身份与注册信息",
  "产能可满足预计订单量",
  "样品质量已确认通过",
  "交期现实且有书面说明",
  "贸易术语与付款条件明确",
  "已核查合规与材料证书",
  "已验证参考客户或贸易记录",
];

const SOURCING_CHANNEL_TRANSLATIONS: Record<string, string> = {
  "Alibaba verified suppliers": "阿里巴巴认证供应商",
  "Global Sources": "环球资源",
  "Made-in-China": "中国制造网",
  "Trade fairs (Canton Fair, Ambiente sourcing contacts)": "展会渠道（广交会、Ambiente 采购联系人）",
  "Sourcing agents in China": "中国本地采购代理",
};

const PRODUCER_FIELD_TRANSLATIONS: Record<string, string> = {
  "Company name": "公司名称",
  "Contact person": "联系人",
  "Email / WeChat / Alibaba profile": "邮箱 / 微信 / 阿里账号",
  "City / Province in China": "中国城市 / 省份",
  "Product specialization": "产品专长",
  "MOQ (minimum order quantity)": "MOQ（最小起订量）",
  "Sample lead time": "样品交期",
  "Production lead time": "生产交期",
  "Certifications (FSC, BSCI, ISO)": "认证（FSC、BSCI、ISO）",
  "Incoterm offered (EXW, FOB, CIF, DDP)": "可提供贸易条款（EXW、FOB、CIF、DDP）",
  "Notes and risk flags": "备注与风险标记",
};

const ENGLISH_PRODUCER_TEMPLATE = `Hello [Supplier Name],

My name is [Your Name], and I am contacting you on behalf of Bamboo, a retail project based in Prague, Czech Republic.

We are looking for a long-term manufacturing partner for bamboo home and lifestyle products. Please share the details below:

1) Company profile:
- Company legal name
- Factory location
- Main export markets

2) Product scope:
- Which bamboo product categories do you produce?
- Can you share your catalog and MOQ per item?

3) Pricing and terms:
- Unit price by MOQ tier
- Sample cost and sample lead time
- Production lead time after order confirmation
- Payment terms

4) Compliance and quality:
- Do you have FSC / BSCI / ISO or other relevant certifications?
- Can you provide quality control process details?
- What is your defect/replacement policy?

5) Logistics:
- Which Incoterms do you offer (EXW / FOB / CIF / DDP)?
- Preferred shipping ports and packing standards

6) Branding:
- Can you support custom packaging / private label?
- Minimum quantity for custom branding

Thank you. We are currently selecting shortlisted partners and will proceed with sample evaluation.

Best regards,
[Your Name]
[Company / Project]
[Contact]`;

const MANDARIN_PRODUCER_TEMPLATE = `您好 [供应商名称]，

我是 [您的姓名]，代表位于捷克布拉格的 Bamboo 项目与您联系。

我们正在寻找长期合作的竹制家居与生活用品制造商。请协助提供以下信息：

1）公司信息：
- 公司全称
- 工厂所在地
- 主要出口市场

2）产品范围：
- 贵司可生产哪些竹制产品类别？
- 请提供产品目录以及每个产品的最小起订量（MOQ）

3）价格与交期：
- 不同 MOQ 档位的单价
- 样品费用与样品交期
- 订单确认后的生产交期
- 付款条件

4）合规与质量：
- 是否具备 FSC / BSCI / ISO 等相关认证？
- 请说明贵司的质量控制流程
- 如出现质量问题，返工/补发政策如何？

5）物流与贸易条款：
- 可提供哪些贸易术语（EXW / FOB / CIF / DDP）？
- 常用出运港口及包装标准

6）品牌与定制：
- 是否支持定制包装 / 贴牌（Private Label）？
- 定制品牌的最小起订量是多少？

感谢您的支持。我们目前正在筛选合作工厂，后续将进入样品评估阶段。

此致
敬礼
[您的姓名]
[公司/项目名称]
[联系方式]`;

type BambooProducersContactPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

export default async function BambooProducersContactPage({
  searchParams,
}: BambooProducersContactPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const { saved, error, edit } = await searchParams;

  const producers = await prisma.bambooProducerContact.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });
  const sourcingChannels = isZh
    ? BAMBOO_SOURCING_CHANNELS.map((item) => SOURCING_CHANNEL_TRANSLATIONS[item] ?? item)
    : BAMBOO_SOURCING_CHANNELS;
  const producerContactFields = isZh
    ? BAMBOO_PRODUCER_CONTACT_FIELDS.map((item) => PRODUCER_FIELD_TRANSLATIONS[item] ?? item)
    : BAMBOO_PRODUCER_CONTACT_FIELDS;
  const qualificationChecklist = isZh ? QUALIFICATION_CHECKLIST_ZH : QUALIFICATION_CHECKLIST;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "added" ? <Toast message={isZh ? "已添加供应商。" : "Producer added."} /> : null}
      {saved === "updated" ? <Toast message={isZh ? "已更新供应商。" : "Producer updated."} /> : null}
      {saved === "deleted" ? <Toast message={isZh ? "已删除供应商。" : "Producer removed."} /> : null}
      {error === "invalid" ? (
        <Toast message={isZh ? "供应商输入无效。" : "Invalid producer input."} tone="error" />
      ) : null}
      {error === "duplicate" ? (
        <Toast message={isZh ? "该供应商名称已存在。" : "Producer name already exists."} tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "货品" : "Inventory", href: "/apps/bamboo/inventory" },
            { label: isZh ? "供应商联系" : "Producers contact" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "供应商联系" : "Producers contact"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "面向中国采购的供应商搜寻与联系跟踪。"
            : "Supplier sourcing and contact tracking for China imports."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "采购渠道" : "Sourcing channels"}
          </h2>
          <ul className="mt-4 space-y-2">
            {sourcingChannels.map((channel) => (
              <li key={channel} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
                {channel}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "供应商筛选清单" : "Supplier qualification checklist"}
          </h2>
          <ul className="mt-4 space-y-2">
            {qualificationChecklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#314567]">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "联系跟踪字段" : "Contact tracker fields"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh ? "在供应商跟踪表中使用这些字段。" : "Use these fields in your supplier tracker."}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {producerContactFields.map((field) => (
            <p
              key={field}
              className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
            >
              {field}
            </p>
          ))}
        </div>
      </section>

      

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        {canEdit ? (
          <div className="flex items-center justify-between gap-3 border-b border-[#edf2fb] px-4 py-3">
            <h2 className="text-lg font-semibold tracking-tight text-[#162947]">
              {isZh ? "供应商列表" : "Producer list"}
            </h2>
            <AddProducerModal action={addProducerContactAction} locale={locale} />
          </div>
        ) : null}

        <div className="hidden grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase md:grid">
          <span>{isZh ? "名称" : "Name"}</span>
          <span>{isZh ? "联系方式" : "Contact"}</span>
          <span>{isZh ? "产品范围" : "Sortiment"}</span>
          <span>{isZh ? "备注" : "Notes"}</span>
          <span>{isZh ? "操作" : "Actions"}</span>
        </div>

        {producers.length > 0 ? (
          producers.map((producer) => {
            const isEditing = canEdit && edit === producer.id;

            return (
              <div key={producer.id} className="border-t border-[#edf2fb] px-4 py-3">
                {isEditing ? (
                  <form
                    action={updateProducerContactAction}
                    className="grid gap-2 md:grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] md:items-start"
                  >
                    <input type="hidden" name="id" value={producer.id} />
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "名称" : "Name"}
                      </span>
                      <input
                        type="text"
                        name="name"
                        required
                        maxLength={120}
                        defaultValue={producer.name}
                        className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "联系方式" : "Contact"}
                      </span>
                      <input
                        type="text"
                        name="contact"
                        required
                        maxLength={240}
                        defaultValue={producer.contact}
                        className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "产品范围" : "Sortiment"}
                      </span>
                      <input
                        type="text"
                        name="sortiment"
                        required
                        maxLength={240}
                        defaultValue={producer.sortiment}
                        className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "备注" : "Notes"}
                      </span>
                      <textarea
                        name="notes"
                        rows={3}
                        maxLength={1000}
                        defaultValue={producer.notes}
                        className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        {isZh ? "保存" : "Save"}
                      </button>
                      <Link
                        href="/apps/bamboo/inventory/producers-contact"
                        className="inline-flex justify-center rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        {isZh ? "取消" : "Cancel"}
                      </Link>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-2 md:grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] md:items-start">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "名称" : "Name"}
                      </p>
                      <p className="text-sm font-semibold text-[#1a2b49]">{producer.name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "联系方式" : "Contact"}
                      </p>
                      <p className="text-sm text-[#1a2b49]">{producer.contact}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "产品范围" : "Sortiment"}
                      </p>
                      <p className="text-sm text-[#1a2b49]">{producer.sortiment}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "备注" : "Notes"}
                      </p>
                      <p className="text-sm text-(--text-muted)">{producer.notes}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        {isZh ? "操作" : "Actions"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {canEdit ? (
                          <>
                            <Link
                              href={`/apps/bamboo/inventory/producers-contact?edit=${producer.id}`}
                              className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                            >
                              {isZh ? "编辑" : "Edit"}
                            </Link>
                            <form action={deleteProducerContactAction}>
                              <input type="hidden" name="id" value={producer.id} />
                              <button
                                type="submit"
                                className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                              >
                                {isZh ? "删除" : "Remove"}
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-xs text-(--text-muted)">
                            {isZh ? "只读" : "Read only"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-4 text-sm text-(--text-muted)">
            {isZh ? "还没有供应商记录。" : "No producers yet."}
          </div>
        )}
      </section>
      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "供应商联系模板" : "Producer outreach template"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh
            ? "可直接使用的供应商询盘模板，包含关键筛选问题。先英文，再中文。"
            : "Ready-to-use supplier inquiry message with all required qualification questions. First in English, then in Mandarin."}
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              {isZh ? "英文" : "English"}
            </p>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#314567]">
              {ENGLISH_PRODUCER_TEMPLATE}
            </pre>
          </article>

          <article className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              {isZh ? "中文" : "Mandarin"}
            </p>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#314567]">
              {MANDARIN_PRODUCER_TEMPLATE}
            </pre>
          </article>
        </div>
      </section>
    </main>
  );
}
