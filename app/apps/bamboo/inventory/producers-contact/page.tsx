import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
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
  "Production capacity matches your expected order volume",
  "Sample quality approved",
  "Lead times are realistic and documented",
  "Clear Incoterm and payment terms agreed",
  "Compliance and material certificates reviewed",
  "References or trade history validated",
];

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
  const { saved, error, edit } = await searchParams;

  const producers = await prisma.bambooProducerContact.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "added" ? <Toast message="Producer added." /> : null}
      {saved === "updated" ? <Toast message="Producer updated." /> : null}
      {saved === "deleted" ? <Toast message="Producer removed." /> : null}
      {error === "invalid" ? (
        <Toast message="Invalid producer input." tone="error" />
      ) : null}
      {error === "duplicate" ? (
        <Toast message="Producer name already exists." tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Inventory", href: "/apps/bamboo/inventory" },
            { label: "Producers contact" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Producers contact
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Supplier sourcing and contact template for imports from China.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Sourcing channels</h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_SOURCING_CHANNELS.map((channel) => (
              <li key={channel} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
                {channel}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Supplier qualification checklist
          </h2>
          <ul className="mt-4 space-y-2">
            {QUALIFICATION_CHECKLIST.map((item) => (
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
          Contact tracker fields
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Use these columns in your first supplier tracking sheet.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BAMBOO_PRODUCER_CONTACT_FIELDS.map((field) => (
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
              Producer list
            </h2>
            <AddProducerModal action={addProducerContactAction} />
          </div>
        ) : null}

        <div className="hidden grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase md:grid">
          <span>Name</span>
          <span>Contact</span>
          <span>Sortiment</span>
          <span>Notes</span>
          <span>Actions</span>
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
                        Name
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
                        Contact
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
                        Sortiment
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
                        Notes
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
                        Save
                      </button>
                      <Link
                        href="/apps/bamboo/inventory/producers-contact"
                        className="inline-flex justify-center rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-2 md:grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] md:items-start">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        Name
                      </p>
                      <p className="text-sm font-semibold text-[#1a2b49]">{producer.name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        Contact
                      </p>
                      <p className="text-sm text-[#1a2b49]">{producer.contact}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        Sortiment
                      </p>
                      <p className="text-sm text-[#1a2b49]">{producer.sortiment}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        Notes
                      </p>
                      <p className="text-sm text-(--text-muted)">{producer.notes}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase md:hidden">
                        Actions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {canEdit ? (
                          <>
                            <Link
                              href={`/apps/bamboo/inventory/producers-contact?edit=${producer.id}`}
                              className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                            >
                              Edit
                            </Link>
                            <form action={deleteProducerContactAction}>
                              <input type="hidden" name="id" value={producer.id} />
                              <button
                                type="submit"
                                className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                              >
                                Remove
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-xs text-(--text-muted)">Read only</span>
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
            No producers yet.
          </div>
        )}
      </section>
      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Producer outreach template
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Ready-to-use supplier inquiry message with all required qualification
          questions. First in English, then in Mandarin.
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              English
            </p>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#314567]">
              {ENGLISH_PRODUCER_TEMPLATE}
            </pre>
          </article>

          <article className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Mandarin
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
