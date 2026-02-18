import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

import { CreateInvoiceWorkspace } from "../CreateInvoiceWorkspace";

type CreateInvoicePageProps = {
  searchParams: Promise<{ template?: string }>;
};

export default async function CreateInvoicePage({
  searchParams,
}: CreateInvoicePageProps) {
  await requireAppRead("INVOICE");
  const { template } = await searchParams;
  const selectedTemplate = template || "deep-systems";
  const isKnownTemplate = selectedTemplate === "deep-systems";

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
      <div className="print:hidden">
        <TopNav current="apps" />
      </div>

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)] print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Invoice", href: "/apps/invoice" },
                { label: "Create invoice" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Create invoice
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Template: {isKnownTemplate ? "Deep Systems" : "Unknown template"}
            </p>
          </div>

          <Link
            href="/apps/invoice"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Back to invoice app
          </Link>
        </div>

        {!isKnownTemplate ? (
          <p className="mt-4 rounded-xl border border-[#f0cbc1] bg-[#fff4f1] px-4 py-3 text-sm text-[#9a4934]">
            Selected template is not available yet. Showing Deep Systems template.
          </p>
        ) : null}
      </section>

      <CreateInvoiceWorkspace />
    </main>
  );
}
