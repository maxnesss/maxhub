import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";
import Link from "next/link";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import { getLocalizedBambooCompanySetupSteps } from "@/lib/bamboo-content-i18n";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const SETUP_TIMEFRAME = [
  {
    label: "Best case",
    value: "6 weeks",
    note: "Fast coordination with notary, bank, and offices.",
  },
  {
    label: "Typical",
    value: "8 weeks",
    note: "Most realistic baseline for a single-owner setup.",
  },
  {
    label: "With buffer",
    value: "10 weeks",
    note: "Safer plan if document loops and revisions appear.",
  },
];

const STEP_LINKS: Record<number, string> = {
  1: "/apps/bamboo/name-brand",
};

export default async function BambooCompanySetupPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";

  const setupTimeframe = SETUP_TIMEFRAME.map((item) => {
    if (!isZh) {
      return item;
    }

    if (item.label === "Best case") {
      return {
        ...item,
        label: "最快情况",
        value: "6 周",
        note: "与公证人、银行和政府机构配合顺利。",
      };
    }
    if (item.label === "Typical") {
      return {
        ...item,
        label: "常规情况",
        value: "8 周",
        note: "单一所有者公司最常见的实际周期。",
      };
    }

    return {
      ...item,
      label: "含缓冲",
      value: "10 周",
      note: "适合文件补充与修订较多的情况。",
    };
  });
  const companySetupSteps = getLocalizedBambooCompanySetupSteps(locale);

  const categoryTasks = await prisma.bambooTask.findMany({
    where: {
      category: BambooTaskCategory.SETUP_COMPANY,
      status: { not: BambooTaskStatus.DONE },
    },
    orderBy: [{ phase: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    take: 5,
    select: {
      id: true,
      title: true,
      phase: true,
      status: true,
      priority: true,
      owner: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "公司设立" : "Company setup" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "公司设立计划" : "Company setup plan"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh ? "面向捷克 s.r.o. 的分步设立计划。" : "Step-by-step setup plan for your Czech s.r.o."}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "设立时间框架" : "Setup timeframe"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/apps/bamboo/target-legal-form"
              className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
            >
              {isZh ? "法律形式与结构" : "Legal form and structure"}
            </Link>
            <Link
              href="/apps/bamboo/company-setup/finance-requirements"
              className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
            >
              {isZh ? "公司设立财务要求" : "Company setup finance requirements"}
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh ? "可作为公司设立流程的简要时间参考。" : "Use this as a simple time guide for the setup process."}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {setupTimeframe.map((item) => (
            <article key={item.label} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-(--text-muted)">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {companySetupSteps.map((step) => (
          <article key={step.id} className="rounded-2xl border border-(--line) bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#6a7b9c] uppercase">
              {isZh ? `步骤 ${step.id}` : `Step ${step.id}`}
            </p>
            {STEP_LINKS[step.id] ? (
              <Link
                href={STEP_LINKS[step.id]}
                className="mt-2 inline-flex text-2xl font-semibold tracking-tight text-[#162947] hover:text-[#1f3e77]"
              >
                {step.title}
              </Link>
            ) : (
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
                {step.title}
              </h2>
            )}
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

      <TaskCategoryPanel
        title={isZh ? "公司设立任务" : "Company setup tasks"}
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.SETUP_COMPANY })}
        emptyLabel={isZh ? "当前没有待办的公司设立任务。" : "No open setup-company tasks right now."}
      />
    </main>
  );
}
