import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

import {
  addShopLocationAction,
  addShopRentalPlaceAction,
  addShopWebsiteAction,
  deleteShopLocationAction,
  deleteShopRentalPlaceAction,
  deleteShopWebsiteAction,
  updateShopLocationAction,
  updateShopRentalPlaceAction,
  updateShopWebsiteAction,
} from "./actions";

type ShopLocationPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function BambooShopLocationPage({
  searchParams,
}: ShopLocationPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error } = await searchParams;

  const [locations, rentalPlaces, websites] = await Promise.all([
    prisma.bambooShopLocation.findMany({ orderBy: [{ createdAt: "asc" }, { name: "asc" }] }),
    prisma.bambooShopRentalPlace.findMany({ orderBy: [{ foundAt: "desc" }, { createdAt: "desc" }] }),
    prisma.bambooShopWebsite.findMany({ orderBy: [{ createdAt: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved ? <Toast message="Shop location data updated." /> : null}
      {error ? <Toast message="Unable to save changes." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Bamboo", href: "/apps/bamboo" },
                { label: "Shop", href: "/apps/bamboo/shop" },
                { label: "Location" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Location
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Long-form location planning with editable general areas, concrete
              rental places, and sourcing websites.
            </p>
          </div>

          <Link
            href="/apps/bamboo/shop"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Back to shop
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          General locations
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Broad location candidates with notes.
        </p>

        <div className="mt-4 space-y-2">
          {locations.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-3">
              {canEdit ? (
                <form action={updateShopLocationAction} className="grid gap-2 md:grid-cols-[0.8fr_1.8fr_auto_auto] md:items-start">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="text"
                    name="name"
                    defaultValue={item.name}
                    required
                    maxLength={120}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <textarea
                    name="notes"
                    defaultValue={item.notes}
                    rows={2}
                    maxLength={1200}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    formAction={deleteShopLocationAction}
                    className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                  >
                    Remove
                  </button>
                </form>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#1a2b49]">{item.name}</p>
                  <p className="mt-1 text-sm text-(--text-muted)">{item.notes}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {canEdit ? (
          <form action={addShopLocationAction} className="mt-4 grid gap-2 md:grid-cols-[0.8fr_1.8fr_auto] md:items-start">
            <input
              type="text"
              name="name"
              required
              maxLength={120}
              placeholder="New general location"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="notes"
              rows={2}
              maxLength={1200}
              placeholder="Notes"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Add
            </button>
          </form>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Concrete places to rent
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Track real listings with link, date, price, and notes.
        </p>

        <div className="mt-4 space-y-2">
          {rentalPlaces.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-3">
              {canEdit ? (
                <form action={updateShopRentalPlaceAction} className="grid gap-2 md:grid-cols-[0.6fr_0.8fr_0.9fr_1.2fr_1.8fr_auto_auto] md:items-start">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="date"
                    name="foundAt"
                    defaultValue={formatDateInput(item.foundAt)}
                    required
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    name="price"
                    defaultValue={item.price}
                    required
                    maxLength={120}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    name="location"
                    defaultValue={item.location}
                    required
                    maxLength={160}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    name="link"
                    defaultValue={item.link}
                    required
                    maxLength={400}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <textarea
                    name="notes"
                    defaultValue={item.notes}
                    rows={2}
                    maxLength={1200}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    formAction={deleteShopRentalPlaceAction}
                    className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                  >
                    Remove
                  </button>
                </form>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#1a2b49]">
                    {formatDateInput(item.foundAt)} • {item.price}
                  </p>
                  <p className="text-sm text-[#1a2b49]">{item.location}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-[#34548d] underline">
                    {item.link}
                  </a>
                  <p className="text-sm text-(--text-muted)">{item.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {canEdit ? (
          <form action={addShopRentalPlaceAction} className="mt-4 grid gap-2 md:grid-cols-[0.6fr_0.8fr_0.9fr_1.2fr_1.8fr_auto] md:items-start">
            <input
              type="date"
              name="foundAt"
              required
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="price"
              required
              maxLength={120}
              placeholder="Price"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="location"
              required
              maxLength={160}
              placeholder="Location"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="link"
              required
              maxLength={400}
              placeholder="Listing URL"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="notes"
              rows={2}
              maxLength={1200}
              placeholder="Notes"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Add
            </button>
          </form>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Websites (CRUD)
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Sources to find new listings and monitor new opportunities.
        </p>

        <div className="mt-4 space-y-2">
          {websites.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-3">
              {canEdit ? (
                <form action={updateShopWebsiteAction} className="grid gap-2 md:grid-cols-[0.8fr_1.2fr_1.8fr_auto_auto] md:items-start">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="text"
                    name="name"
                    defaultValue={item.name}
                    required
                    maxLength={120}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    name="url"
                    defaultValue={item.url}
                    required
                    maxLength={400}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <textarea
                    name="notes"
                    defaultValue={item.notes}
                    rows={2}
                    maxLength={1200}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    formAction={deleteShopWebsiteAction}
                    className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                  >
                    Remove
                  </button>
                </form>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#1a2b49]">{item.name}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-[#34548d] underline">
                    {item.url}
                  </a>
                  <p className="text-sm text-(--text-muted)">{item.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {canEdit ? (
          <form action={addShopWebsiteAction} className="mt-4 grid gap-2 md:grid-cols-[0.8fr_1.2fr_1.8fr_auto] md:items-start">
            <input
              type="text"
              name="name"
              required
              maxLength={120}
              placeholder="Website name"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="url"
              required
              maxLength={400}
              placeholder="URL"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="notes"
              rows={2}
              maxLength={1200}
              placeholder="Notes"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Add
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
