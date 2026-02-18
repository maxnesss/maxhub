import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { BAMBOO_IMPORT_TO_CZ_STEPS } from "@/lib/bamboo-content";

const IMPORT_RISKS = [
  "Wrong HS code and wrong duty calculation",
  "Sample quality differs from final production quality",
  "Shipping delays in peak seasons or holidays",
  "Hidden costs in freight, customs, and local handling",
  "Missing documents that delay customs clearance",
];

export default async function BambooImportToCzechPage() {
  await requireAppRead("BAMBOO");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Inventory", href: "/apps/bamboo/inventory" },
            { label: "Import to Czech Republic" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Import products to Czech Republic
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Step-by-step flow from China supplier to stock in Czech Republic.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        {BAMBOO_IMPORT_TO_CZ_STEPS.map((step) => (
          <article key={step.step} className="rounded-2xl border border-(--line) bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#6a7b9c] uppercase">
              Step {step.step}
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
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Common risks</h2>
        <ul className="mt-4 space-y-2">
          {IMPORT_RISKS.map((risk) => (
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
