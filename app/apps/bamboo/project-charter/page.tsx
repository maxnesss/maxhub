import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

import { saveBambooProjectCharterAction } from "./actions";

type BambooProjectCharterPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

const DEFAULT_KEY_RISK_ITEMS = [
  "Supplier quality variance and inconsistent product finishing in early batches.",
  "Customs/import delays that can shift launch timing and lock cash in transit inventory.",
  "Rent-to-revenue mismatch during first months if location economics are overestimated.",
  "Weak demand validation for the initial assortment, leading to slow inventory turnover.",
  "Operational bottlenecks in restocking, labeling, and in-store process discipline.",
  "Brand differentiation risk in a crowded eco-home category with similar value propositions.",
];

const DEFAULT_CHARTER = {
  vision:
    "Build Bamboo into a focused eco-home retail business with strong unit economics and a scalable operating model.",
  targetCustomer:
    "Urban Czech customers aged 24-45 who value practical, aesthetic, and sustainable home products.",
  scopeIn:
    "Brand setup, supplier pipeline, import operations, inventory planning, and first shop launch readiness.",
  scopeOut:
    "Large multi-city expansion, custom product manufacturing, and complex omnichannel rollout before first launch.",
  budgetGuardrail:
    "Keep setup and early operating commitments within the recommended capital range and review monthly variance.",
  launchCriteria:
    "Legal setup complete, supplier quality validated, launch inventory secured, location selected, and budget runway protected.",
  keyRisks: DEFAULT_KEY_RISK_ITEMS.join("\n"),
};

const LEGACY_DEFAULT_KEY_RISKS = new Set([
  "Supplier quality variance, customs/import delays, rent-to-revenue mismatch, and weak initial demand validation.",
  "Supplier quality variance, customs or import delays, rent-to-revenue mismatch, and weak initial demand validation.",
]);

function normalizeCharterValues(charter: (typeof DEFAULT_CHARTER) | null) {
  if (!charter) {
    return DEFAULT_CHARTER;
  }

  const keyRisks = charter.keyRisks.trim();
  if (LEGACY_DEFAULT_KEY_RISKS.has(keyRisks)) {
    return {
      ...charter,
      keyRisks: DEFAULT_CHARTER.keyRisks,
    };
  }

  return charter;
}

function parseKeyRiskItems(value: string) {
  const normalizedLines = value
    .split("\n")
    .map((line) => line.trim().replace(/^[-*]\s+/, ""))
    .filter(Boolean);

  if (normalizedLines.length === 1) {
    return normalizedLines[0]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return normalizedLines;
}

export default async function BambooProjectCharterPage({
  searchParams,
}: BambooProjectCharterPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error, edit } = await searchParams;
  const isEditMode = canEdit && edit === "1";

  const charter = await prisma.bambooProjectCharter.findUnique({
    where: { id: "default" },
  });
  const values = normalizeCharterValues(charter);
  const keyRiskItems = parseKeyRiskItems(values.keyRisks);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "1" ? <Toast message="Project Charter updated." /> : null}
      {error === "invalid" ? (
        <Toast message="Invalid charter input." tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Bamboo", href: "/apps/bamboo" },
                { label: "Project Charter" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Project Charter
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              One-page alignment document for vision, scope, budget guardrails,
              launch criteria, and key risks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && !isEditMode ? (
              <Link
                href="/apps/bamboo/project-charter?edit=1"
                className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#34548d] hover:bg-[#edf3ff]"
              >
                Edit
              </Link>
            ) : null}
            {isEditMode ? (
              <Link
                href="/apps/bamboo/project-charter"
                className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Cancel
              </Link>
            ) : null}
            <Link
              href="/apps/bamboo"
              className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Back to Bamboo
            </Link>
          </div>
        </div>
      </section>

      {isEditMode ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Edit charter</h2>
          <form action={saveBambooProjectCharterAction} className="mt-4 grid gap-3">
            <textarea
              name="vision"
              required
              rows={4}
              defaultValue={values.vision}
              maxLength={5000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="targetCustomer"
              required
              rows={3}
              defaultValue={values.targetCustomer}
              maxLength={3000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="scopeIn"
              required
              rows={3}
              defaultValue={values.scopeIn}
              maxLength={4000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="scopeOut"
              required
              rows={3}
              defaultValue={values.scopeOut}
              maxLength={4000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="budgetGuardrail"
              required
              rows={3}
              defaultValue={values.budgetGuardrail}
              maxLength={3000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="launchCriteria"
              required
              rows={3}
              defaultValue={values.launchCriteria}
              maxLength={4000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="keyRisks"
              required
              rows={6}
              defaultValue={values.keyRisks}
              maxLength={4000}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-fit cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Save charter
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Vision
          </p>
          <p className="mt-2 text-sm leading-6 text-[#314567]">{values.vision}</p>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Target customer
          </p>
          <p className="mt-2 text-sm leading-6 text-[#314567]">{values.targetCustomer}</p>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Scope in
          </p>
          <p className="mt-2 text-sm leading-6 text-[#314567]">{values.scopeIn}</p>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Scope out
          </p>
          <p className="mt-2 text-sm leading-6 text-[#314567]">{values.scopeOut}</p>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Budget guardrail
          </p>
          <p className="mt-2 text-sm leading-6 text-[#314567]">{values.budgetGuardrail}</p>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Launch criteria
          </p>
          <p className="mt-2 text-sm leading-6 text-[#314567]">{values.launchCriteria}</p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
          Key risks
        </p>
        <ul className="mt-2 space-y-2">
          {keyRiskItems.map((risk) => (
            <li key={risk} className="text-sm leading-6 text-[#314567]">
              - {risk}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
