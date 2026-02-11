import Link from "next/link";

import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAdminUser } from "@/lib/authz";

export default async function AdminCreateUserPage() {
  await requireAdminUser();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="admin" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Admin", href: "/admin" },
                { label: "Users", href: "/admin/users" },
                { label: "New" },
              ]}
            />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#132441]">
              Create user
            </h1>
            <p className="mt-2 text-sm text-(--text-muted)">
              Add a new user account with initial role and profile data.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Back to admin
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <CreateUserForm />
      </section>
    </main>
  );
}
