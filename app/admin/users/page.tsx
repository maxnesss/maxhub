import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { APP_CODES, APP_DEFINITIONS } from "@/lib/apps";
import { requireAdminUser } from "@/lib/authz";
import { prisma } from "@/prisma";

export default async function AdminUsersPage() {
  await requireAdminUser();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      appPermissions: {
        select: {
          app: true,
          canRead: true,
          canEdit: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="admin" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Admin", href: "/admin" },
                { label: "Users" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Users list
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Open a user to manage role and app permissions on a dedicated page.
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

      <section className="mt-6 space-y-3">
        {users.map((user) => {
          const readApps = new Set(
            user.appPermissions
              .filter((permission) => permission.canRead)
              .map((permission) => permission.app),
          );

          const editApps = new Set(
            user.appPermissions
              .filter((permission) => permission.canEdit)
              .map((permission) => permission.app),
          );

          const readLabels = APP_CODES.filter((app) => readApps.has(app)).map(
            (app) => APP_DEFINITIONS[app].label,
          );
          const editLabels = APP_CODES.filter((app) => editApps.has(app)).map(
            (app) => APP_DEFINITIONS[app].label,
          );

          return (
            <article
              key={user.id}
              className="grid gap-4 rounded-2xl border border-(--line) bg-white p-5 md:grid-cols-[1.4fr_0.6fr_1fr_1fr_auto] md:items-center"
            >
              <div>
                <p className="text-sm font-semibold text-[#1a2b49]">{user.email}</p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {user.name || "No name"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                  Role
                </p>
                <p className="mt-1 text-sm font-medium text-[#1a2b49]">{user.role}</p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                  Read
                </p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {readLabels.length > 0 ? readLabels.join(", ") : "None"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                  Edit
                </p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {editLabels.length > 0 ? editLabels.join(", ") : "None"}
                </p>
              </div>

              <Link
                href={`/admin/users/${user.id}`}
                className="inline-flex justify-center rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Manage
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
