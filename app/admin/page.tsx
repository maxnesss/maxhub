import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAdminUser } from "@/lib/authz";

export default async function AdminPage() {
  await requireAdminUser();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="admin" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs items={[{ label: "Admin" }]} />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Admin console
        </h1>
        <p className="mt-4 max-w-2xl text-(--text-muted)">
          Manage user roles and per-app read/edit permissions.
        </p>

        <div className="mt-8">
          <Link
            href="/admin/users"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-5 py-3 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Open users permissions
          </Link>
        </div>
      </section>
    </main>
  );
}
