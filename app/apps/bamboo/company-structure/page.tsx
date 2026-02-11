import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

const STRUCTURE_DECISIONS = [
  "Final founder list (minimum 1 person)",
  "Final managing director list (minimum 1 person)",
  "Confirm whether founder and managing director are same person",
  "Prepare specimen signatures for managing directors",
  "Assign legal and financial representation responsibilities",
];

export default async function BambooCompanyStructurePage() {
  await requireAppRead("BAMBOO");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Company structure" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Company structure
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Governance model extracted from your setup guide for founders and
          managing directors.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Founder role</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#314567]">
            <li>Minimum one founder is required.</li>
            <li>Founder can be Czech or foreign, natural or legal person.</li>
            <li>Founder signs formation documentation and ownership shares.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Managing director role
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[#314567]">
            <li>Minimum one managing director (jednatel).</li>
            <li>Responsible for legal and financial actions of the company.</li>
            <li>Can be the same person as founder.</li>
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Decision checklist
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Mark these as complete while preparing notary documentation.
        </p>

        <ul className="mt-4 space-y-2">
          {STRUCTURE_DECISIONS.map((item) => (
            <li key={item} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
