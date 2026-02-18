import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

import { TemplatePickerModal } from "./TemplatePickerModal";

export default async function InvoicePage() {
  await requireAppRead("INVOICE");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Invoice" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Invoice workspace
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Build professional invoices from templates and export them to PDF.
            </p>
          </div>

          <TemplatePickerModal />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-xl font-semibold text-[#162947]">How it works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-(--text-muted)">
          <li>Click Create invoice.</li>
          <li>Select a template in the modal.</li>
          <li>Fill invoice values and export to PDF.</li>
        </ol>
      </section>
    </main>
  );
}
