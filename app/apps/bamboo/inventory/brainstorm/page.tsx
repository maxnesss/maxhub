import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

import {
  addInventoryIdeaAction,
  deleteInventoryIdeaAction,
  updateInventoryIdeaAction,
} from "./actions";

type BambooInventoryBrainstormPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

export default async function BambooInventoryBrainstormPage({
  searchParams,
}: BambooInventoryBrainstormPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error, edit } = await searchParams;

  const ideas = await prisma.bambooInventoryIdea.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "added" ? <Toast message="Inventory idea added." /> : null}
      {saved === "updated" ? <Toast message="Inventory idea updated." /> : null}
      {saved === "deleted" ? <Toast message="Inventory idea removed." /> : null}
      {error === "invalid" ? (
        <Toast message="Invalid input." tone="error" />
      ) : null}
      {error === "duplicate" ? (
        <Toast message="Idea name already exists." tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Inventory", href: "/apps/bamboo/inventory" },
            { label: "Brainstorm" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Inventory brainstorm
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Shared inventory ideas. You can add, edit, and remove ideas when you
          have edit permission.
        </p>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="grid grid-cols-[0.8fr_1.6fr_0.6fr_0.6fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
          <span>Name</span>
          <span>Notes</span>
          <span>Target price</span>
          <span>Actions</span>
        </div>

        {ideas.length > 0 ? (
          ideas.map((idea) => {
            const isEditing = canEdit && edit === idea.id;

            return (
              <div
                key={idea.id}
                className="border-t border-[#edf2fb] px-4 py-3"
              >
                {isEditing ? (
                  <form action={updateInventoryIdeaAction} className="grid grid-cols-[0.8fr_1.6fr_0.6fr_0.6fr] items-start gap-2">
                    <input type="hidden" name="id" value={idea.id} />
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={idea.name}
                      maxLength={120}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                    <textarea
                      name="notes"
                      required
                      rows={3}
                      defaultValue={idea.notes}
                      maxLength={1000}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      name="targetPriceBand"
                      required
                      defaultValue={idea.targetPriceBand}
                      maxLength={80}
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
                        href="/apps/bamboo/inventory/brainstorm"
                        className="inline-flex justify-center rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-[0.8fr_1.6fr_0.6fr_0.6fr] items-start gap-2">
                    <p className="text-sm font-semibold text-[#1a2b49]">{idea.name}</p>
                    <p className="text-sm text-(--text-muted)">{idea.notes}</p>
                    <p className="text-sm font-medium text-[#1a2b49]">{idea.targetPriceBand}</p>
                    <div className="flex gap-2">
                      {canEdit ? (
                        <>
                          <Link
                            href={`/apps/bamboo/inventory/brainstorm?edit=${idea.id}`}
                            className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                          >
                            Edit
                          </Link>
                          <form action={deleteInventoryIdeaAction}>
                            <input type="hidden" name="id" value={idea.id} />
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
            No ideas yet.
          </div>
        )}
      </section>

      {canEdit ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Add new idea</h2>
          <form action={addInventoryIdeaAction} className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              type="text"
              name="name"
              required
              placeholder="Idea name"
              maxLength={120}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="targetPriceBand"
              required
              placeholder="Target price (e.g. 200-900 CZK)"
              maxLength={80}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Add idea
            </button>
            <textarea
              name="notes"
              required
              rows={3}
              placeholder="Notes"
              maxLength={1000}
              className="md:col-span-3 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
          </form>
        </section>
      ) : null}
    </main>
  );
}
