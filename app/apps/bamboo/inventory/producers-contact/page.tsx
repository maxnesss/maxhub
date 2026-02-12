import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import {
  BAMBOO_PRODUCER_CONTACT_FIELDS,
  BAMBOO_SOURCING_CHANNELS,
} from "@/lib/bamboo-content";
import { prisma } from "@/prisma";

import {
  addProducerContactAction,
  deleteProducerContactAction,
  updateProducerContactAction,
} from "./actions";

const QUALIFICATION_CHECKLIST = [
  "Supplier identity and registration verified",
  "Production capacity matches your expected order volume",
  "Sample quality approved",
  "Lead times are realistic and documented",
  "Clear Incoterm and payment terms agreed",
  "Compliance and material certificates reviewed",
  "References or trade history validated",
];

type BambooProducersContactPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

export default async function BambooProducersContactPage({
  searchParams,
}: BambooProducersContactPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error, edit } = await searchParams;

  const producers = await prisma.bambooProducerContact.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "added" ? <Toast message="Producer added." /> : null}
      {saved === "updated" ? <Toast message="Producer updated." /> : null}
      {saved === "deleted" ? <Toast message="Producer removed." /> : null}
      {error === "invalid" ? (
        <Toast message="Invalid producer input." tone="error" />
      ) : null}
      {error === "duplicate" ? (
        <Toast message="Producer name already exists." tone="error" />
      ) : null}

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

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="grid grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
          <span>Name</span>
          <span>Contact</span>
          <span>Sortiment</span>
          <span>Notes</span>
          <span>Actions</span>
        </div>

        {producers.length > 0 ? (
          producers.map((producer) => {
            const isEditing = canEdit && edit === producer.id;

            return (
              <div key={producer.id} className="border-t border-[#edf2fb] px-4 py-3">
                {isEditing ? (
                  <form
                    action={updateProducerContactAction}
                    className="grid grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] items-start gap-2"
                  >
                    <input type="hidden" name="id" value={producer.id} />
                    <input
                      type="text"
                      name="name"
                      required
                      maxLength={120}
                      defaultValue={producer.name}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      name="contact"
                      required
                      maxLength={240}
                      defaultValue={producer.contact}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      name="sortiment"
                      required
                      maxLength={240}
                      defaultValue={producer.sortiment}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                    <textarea
                      name="notes"
                      rows={3}
                      maxLength={1000}
                      defaultValue={producer.notes}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        Save
                      </button>
                      <Link
                        href="/apps/bamboo/inventory/producers-contact"
                        className="inline-flex justify-center rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-[0.7fr_0.9fr_0.8fr_1.2fr_0.7fr] items-start gap-2">
                    <p className="text-sm font-semibold text-[#1a2b49]">{producer.name}</p>
                    <p className="text-sm text-[#1a2b49]">{producer.contact}</p>
                    <p className="text-sm text-[#1a2b49]">{producer.sortiment}</p>
                    <p className="text-sm text-(--text-muted)">{producer.notes}</p>
                    <div className="flex gap-2">
                      {canEdit ? (
                        <>
                          <Link
                            href={`/apps/bamboo/inventory/producers-contact?edit=${producer.id}`}
                            className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                          >
                            Edit
                          </Link>
                          <form action={deleteProducerContactAction}>
                            <input type="hidden" name="id" value={producer.id} />
                            <button
                              type="submit"
                              className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                            >
                              Remove
                            </button>
                          </form>
                        </>
                      ) : (
                        <span className="text-xs text-(--text-muted)">Read only</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="border-t border-[#edf2fb] px-4 py-4 text-sm text-(--text-muted)">
            No producers yet.
          </div>
        )}
      </section>

      {canEdit ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Add producer
          </h2>
          <form action={addProducerContactAction} className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              type="text"
              name="name"
              required
              maxLength={120}
              placeholder="Producer name"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="contact"
              required
              maxLength={240}
              placeholder="Contact"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="sortiment"
              required
              maxLength={240}
              placeholder="Sortiment"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="notes"
              rows={3}
              maxLength={1000}
              placeholder="Notes"
              className="md:col-span-3 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Add producer
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
