import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

import { saveShopConceptAction } from "./actions";

type ShopConceptPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

const DEFAULT_CONCEPT = {
  concept:
    "Eco-home boutique focused on bamboo essentials, gift sets, and premium everyday products.",
  targetSize: "50-90 m2 with front display + compact back storage",
  targetPriceRange: "45,000-90,000 CZK monthly rent (target range)",
};

export default async function BambooShopConceptPage({
  searchParams,
}: ShopConceptPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error, edit } = await searchParams;
  const isEditMode = canEdit && edit === "1";

  const concept = await prisma.bambooShopConcept.findUnique({
    where: { id: "default" },
  });

  const values = concept ?? DEFAULT_CONCEPT;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "1" ? <Toast message="Concept updated." /> : null}
      {error === "invalid" ? (
        <Toast message="Invalid concept input." tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Bamboo", href: "/apps/bamboo" },
                { label: "Shop", href: "/apps/bamboo/shop" },
                { label: "Concept" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Concept
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Define your shop concept and keep size/rent targets editable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && !isEditMode ? (
              <Link
                href="/apps/bamboo/shop/concept?edit=1"
                className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#34548d] hover:bg-[#edf3ff]"
              >
                Edit
              </Link>
            ) : null}
            {isEditMode ? (
              <Link
                href="/apps/bamboo/shop/concept"
                className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Cancel
              </Link>
            ) : null}
            <Link
              href="/apps/bamboo/shop"
              className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </section>

      {isEditMode ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Editable concept settings
          </h2>
          <form action={saveShopConceptAction} className="mt-4 grid gap-3">
            <textarea
              name="concept"
              required
              rows={5}
              defaultValue={values.concept}
              maxLength={4000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                name="targetSize"
                required
                defaultValue={values.targetSize}
                maxLength={160}
                className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                name="targetPriceRange"
                required
                defaultValue={values.targetPriceRange}
                maxLength={160}
                className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-fit cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Save concept
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Current concept</h2>
        <p className="mt-3 text-sm leading-6 text-[#314567]">{values.concept}</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Target size
            </p>
            <p className="mt-2 text-sm text-[#1a2b49]">{values.targetSize}</p>
          </article>
          <article className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Target price range
            </p>
            <p className="mt-2 text-sm text-[#1a2b49]">{values.targetPriceRange}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
