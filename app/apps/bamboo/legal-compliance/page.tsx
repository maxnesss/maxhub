import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

const LEGAL_BLOCKS = [
  {
    title: "Tax registration",
    points: [
      "Register income tax within 15 days.",
      "Register VAT when threshold/EU rules require it.",
      "Add payroll and other taxes only when relevant.",
    ],
  },
  {
    title: "Business license",
    points: [
      "Apply for a free trade license at the Trade Licensing Office.",
      "Use the correct category for your activity.",
      "Typical lead time is around 5 business days.",
    ],
  },
  {
    title: "Employer duties",
    points: [
      "When hiring, register with CSSZ and health insurer.",
      "Complete registration within 8 days of employee start.",
    ],
  },
  {
    title: "E-commerce and GDPR",
    points: [
      "Prepare terms, privacy notice, and cookie policy.",
      "For EU online sales, check OSS and EU VAT setup.",
    ],
  },
];

export default async function BambooLegalCompliancePage() {
  await requireAppRead("BAMBOO");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Legal and compliance" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Legal and compliance
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Simple legal checklist for tax, licensing, and key obligations.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {LEGAL_BLOCKS.map((block) => (
          <article key={block.title} className="rounded-2xl border border-(--line) bg-white p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[#162947]">{block.title}</h2>
            <ul className="mt-4 space-y-2">
              {block.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-[#314567]">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
