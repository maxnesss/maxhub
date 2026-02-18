import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import {
  BAMBOO_BRAND_SETUP_GROUPS,
  BAMBOO_NAME_GROUPS,
} from "@/lib/bamboo-content";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

import {
  addCustomNameAction,
  removeCustomNameAction,
  setNameShortlistAction,
} from "./actions";

type BambooNameBrandPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const CUSTOM_CATEGORY = "Custom category";

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

function getNameTileClass(shortlisted: boolean) {
  if (shortlisted) {
    return "border-[#cbdcf8] bg-[#ecf4ff]";
  }

  return "border-[#e3eaf7] bg-[#fbfdff]";
}

export default async function BambooNameBrandPage({
  searchParams,
}: BambooNameBrandPageProps) {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const { saved, error } = await searchParams;

  const [persisted, categoryTasks] = await Promise.all([
    prisma.bambooNameIdea.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.bambooTask.findMany({
      where: {
        category: BambooTaskCategory.BRAND,
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
    }),
  ]);

  const persistedByName = new Map(
    persisted.map((item) => [item.normalizedName, item]),
  );

  const staticGroups = BAMBOO_NAME_GROUPS.map((group) => ({
    category: group.category,
    names: group.names.map((name) => {
      const persistedEntry = persistedByName.get(normalizeName(name));
      return {
        name,
        shortlisted: persistedEntry?.shortlisted ?? false,
      };
    }),
  }));

  const customNames = persisted
    .filter((item) => item.isCustom || item.category === CUSTOM_CATEGORY)
    .map((item) => ({
      name: item.name,
      shortlisted: item.shortlisted,
    }));

  const shortlist = persisted
    .filter((item) => item.shortlisted)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "shortlist" ? (
        <Toast message={isZh ? "共享候选列表已更新。" : "Shared shortlist updated."} />
      ) : null}
      {saved === "custom" ? <Toast message={isZh ? "已添加自定义名称。" : "Custom name added."} /> : null}
      {saved === "custom-removed" ? (
        <Toast message={isZh ? "已移除自定义名称。" : "Custom name removed."} />
      ) : null}
      {error === "invalid" ? (
        <Toast message={isZh ? "输入无效。" : "Invalid input."} tone="error" />
      ) : null}
      {error === "duplicate" ? (
        <Toast
          message={isZh ? "该名称已存在于其他分类中。" : "This name already exists in another category."}
          tone="error"
        />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "命名头脑风暴" : "Name brainstorm" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "命名头脑风暴" : "Name brainstorm"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "团队共享命名工作区，统一维护一个候选列表。"
            : "Shared naming workspace with one shortlist for the whole team."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {staticGroups.map((group) => (
          <article
            key={group.category}
            className="rounded-2xl border border-(--line) bg-white p-6"
          >
            <h2 className="text-xl font-semibold text-[#162947]">{group.category}</h2>
            <ul className="mt-3 space-y-2">
              {group.names.map((item) => (
                <li
                  key={item.name}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${getNameTileClass(item.shortlisted)}`}
                >
                  <span className="text-sm text-[#1a2b49]">{item.name}</span>
                  <form action={setNameShortlistAction}>
                    <input type="hidden" name="name" value={item.name} />
                    <input type="hidden" name="category" value={group.category} />
                    <input
                      type="hidden"
                      name="shortlisted"
                      value={item.shortlisted ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-1 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                    >
                      {item.shortlisted
                        ? (isZh ? "移除" : "Remove")
                        : (isZh ? "加入候选" : "Shortlist")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </article>
        ))}

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold text-[#162947]">
            {isZh ? "自定义分类" : CUSTOM_CATEGORY}
          </h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            {isZh ? "添加你自己的名称想法并加入候选列表。" : "Add your own name ideas and shortlist them."}
          </p>

          <form action={addCustomNameAction} className="mt-4 flex gap-2">
            <input
              type="text"
              name="name"
              required
              maxLength={120}
              placeholder={isZh ? "添加自定义名称" : "Add custom name"}
              className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              {isZh ? "添加" : "Add"}
            </button>
          </form>

          <ul className="mt-4 space-y-2">
            {customNames.length > 0 ? (
              customNames.map((item) => (
                <li
                  key={item.name}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${getNameTileClass(item.shortlisted)}`}
                >
                  <span className="text-sm text-[#1a2b49]">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <form action={setNameShortlistAction}>
                      <input type="hidden" name="name" value={item.name} />
                      <input type="hidden" name="category" value={CUSTOM_CATEGORY} />
                      <input
                        type="hidden"
                        name="shortlisted"
                        value={item.shortlisted ? "0" : "1"}
                      />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-1 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        {item.shortlisted
                          ? (isZh ? "移除" : "Remove")
                          : (isZh ? "加入候选" : "Shortlist")}
                      </button>
                    </form>
                    <form action={removeCustomNameAction}>
                      <input type="hidden" name="name" value={item.name} />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-1 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                      >
                        {isZh ? "删除" : "Delete"}
                      </button>
                    </form>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-(--text-muted)">
                {isZh ? "还没有添加自定义名称。" : "No custom names added yet."}
              </li>
            )}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "共享候选列表" : "Shared shortlist"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh
            ? "对所有用户可见。任何用户都可以添加或移除名称。"
            : "Visible to all users. Any user can add or remove names."}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {shortlist.length > 0 ? (
            shortlist.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {item.name}
              </li>
            ))
          ) : (
            <li className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-(--text-muted)">
              {isZh ? "还没有候选名称。请使用上方候选按钮。" : "No shortlist yet. Use the shortlist buttons above."}
            </li>
          )}
        </ul>
      </section>

      <TaskCategoryPanel
        title={isZh ? "命名头脑风暴任务" : "Name brainstorm tasks"}
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.BRAND })}
        emptyLabel={isZh ? "当前没有待办的命名任务。" : "No open name-brainstorm tasks right now."}
      />

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "品牌建立" : "Brand setup"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh ? "确定名称后建立品牌识别的核心步骤。" : "Core steps to build brand identity after name selection."}
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {BAMBOO_BRAND_SETUP_GROUPS.map((group) => (
            <article
              key={group.title}
              className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
            >
              <h3 className="text-sm font-semibold text-[#1a2b49]">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.steps.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-sm text-[#314567]">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
