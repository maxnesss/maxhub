import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import {
  BAMBOO_PRODUCER_CONTACT_FIELDS,
  BAMBOO_SOURCING_CHANNELS,
} from "@/lib/bamboo-content";

const QUALIFICATION_CHECKLIST = [
  "Supplier identity and registration verified",
  "Production capacity matches your expected order volume",
  "Sample quality approved",
  "Lead times are realistic and documented",
  "Clear Incoterm and payment terms agreed",
  "Compliance and material certificates reviewed",
  "References or trade history validated",
];

export default async function BambooProducersContactPage() {
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
    </main>
  );
}
