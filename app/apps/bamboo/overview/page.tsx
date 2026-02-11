import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  BAMBOO_GENERAL_TILES,
  BAMBOO_INVENTORY_TILES,
  BAMBOO_OVERVIEW_STATS,
  BAMBOO_SHOP_TILES,
  BAMBOO_SETUP_COMPANY_TILES,
  BAMBOO_SHORTLIST,
  BAMBOO_TASKS,
} from "@/lib/bamboo-content";
import { requireAppRead } from "@/lib/authz";

export default async function BambooOverviewPage() {
  await requireAppRead("BAMBOO");

  const nextTasks = BAMBOO_TASKS.slice(0, 4);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Overview" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Bamboo overview
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Whole-project overview across setup company, general categories, and
          launch priorities.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BAMBOO_OVERVIEW_STATS.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-(--line) bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              {stat.label}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-[#162947]">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Next actions</h2>
          <ul className="mt-4 space-y-3">
            {nextTasks.map((task) => (
              <li key={task.task} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
                <p className="text-sm font-semibold text-[#1a2b49]">{task.task}</p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {task.phase} • Owner: {task.owner}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Name shortlist</h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Candidates selected from the brainstorm file for early validation.
          </p>
          <ul className="mt-4 space-y-2">
            {BAMBOO_SHORTLIST.map((name) => (
              <li key={name} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
                {name}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/apps/bamboo/tasks"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open tasks
        </Link>
        <Link
          href="/apps/bamboo/company-setup"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open company setup
        </Link>
        <Link
          href="/apps/bamboo/inventory"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open inventory
        </Link>
        <Link
          href="/apps/bamboo/shop"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open shop
        </Link>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            General categories
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_GENERAL_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Inventory
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_INVENTORY_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Setup company
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_SETUP_COMPANY_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Shop
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_SHOP_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/apps/bamboo/finance"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open finance setup
        </Link>
        <Link
          href="/apps/bamboo/finance-requirements"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open finance requirements
        </Link>
      </section>
    </main>
  );
}
