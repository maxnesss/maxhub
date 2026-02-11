import Link from "next/link";
import { notFound } from "next/navigation";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { ValueHelpSelect } from "@/components/ui/ValueHelpSelect";
import { APP_VALUE_HELP, ROLE_VALUE_HELP } from "@/lib/value-helps";
import { requireAdminUser } from "@/lib/authz";
import { prisma } from "@/prisma";

import { updateUserPermissionsAction } from "../actions";

type AdminUserDetailPageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: AdminUserDetailPageProps) {
  await requireAdminUser();

  const { userId } = await params;
  const { saved } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  });

  if (!user) {
    notFound();
  }

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
  const showSavedToast = saved === "1";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {showSavedToast ? <Toast message="Permissions updated successfully." /> : null}
      <TopNav current="admin" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Admin", href: "/admin" },
                { label: "Users", href: "/admin/users" },
                { label: user.email, preserveCase: true },
              ]}
            />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#132441]">
              Manage user permissions
            </h1>
            <p className="mt-2 text-sm text-(--text-muted)">{user.email}</p>
          </div>

          <Link
            href="/admin/users"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Back to users
          </Link>
        </div>
      </section>

      <form
        action={updateUserPermissionsAction}
        className="mt-6 rounded-2xl border border-(--line) bg-white p-6"
      >
        <input type="hidden" name="userId" value={user.id} />

        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#1a2b49]">{user.email}</p>
            <p className="mt-1 text-xs text-(--text-muted)">{user.name || "No name"}</p>
          </div>

          <label className="space-y-1">
            <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
              Role
            </span>
            <ValueHelpSelect
              name="role"
              defaultValue={user.role}
              options={ROLE_VALUE_HELP}
              className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            className="cursor-pointer rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Save
          </button>
        </div>

        <p className="mt-5 text-xs text-(--text-muted)">
          Tick/untick read and edit access for each app. Edit automatically grants
          read.
        </p>

        <div className="mt-3 overflow-hidden rounded-xl border border-[#e3eaf7]">
          <div className="grid grid-cols-[1.3fr_0.55fr_0.55fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
            <span>App</span>
            <span>Read</span>
            <span>Edit</span>
          </div>

          {APP_VALUE_HELP.map((app) => (
            <div
              key={app.value}
              className="grid grid-cols-[1.3fr_0.55fr_0.55fr] items-center border-t border-[#edf2fb] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[#1a2b49]">{app.label}</p>
                <p className="text-xs text-(--text-muted)">{app.description}</p>
              </div>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="readApps"
                  value={app.value}
                  defaultChecked={readApps.has(app.value)}
                  className="h-4 w-4 cursor-pointer rounded border-[#b8c6e6]"
                />
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="editApps"
                  value={app.value}
                  defaultChecked={editApps.has(app.value)}
                  className="h-4 w-4 cursor-pointer rounded border-[#b8c6e6]"
                />
              </label>
            </div>
          ))}
        </div>
      </form>
    </main>
  );
}
