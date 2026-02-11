import Link from "next/link";

import { APP_CODES, APP_DEFINITIONS } from "@/lib/apps";
import { canEditApp, canReadApp, requireUserContext } from "@/lib/authz";
import { TopNav } from "@/components/layout/TopNav";
import { Toast } from "@/components/ui/Toast";

import { signOutAction, updateProfileAction } from "./actions";

type ProfilePageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireUserContext();
  const { saved, error, edit } = await searchParams;
  const isEditMode = edit === "1";

  const readApps = APP_CODES.filter((app) => canReadApp(user, app)).map(
    (app) => APP_DEFINITIONS[app].label,
  );

  const editApps = APP_CODES.filter((app) => canEditApp(user, app)).map(
    (app) => APP_DEFINITIONS[app].label,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "1" ? <Toast message="Profile updated successfully." /> : null}
      {error === "1" ? (
        <Toast message="Unable to update profile." tone="error" />
      ) : null}
      <TopNav current="profile" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#657597] uppercase">
              Profile
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Your account
            </h1>
          </div>

          {isEditMode ? (
            <Link
              href="/profile"
              className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Cancel
            </Link>
          ) : (
            <Link
              href="/profile?edit=1"
              className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Edit
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5">
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">Email</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">{user.email}</p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5">
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">Role</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">{user.role}</p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5">
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">Nickname</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">
              {user.nickname || "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5">
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">Name</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">
              {user.name || "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5 sm:col-span-2">
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">Read apps</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">
              {readApps.length > 0 ? readApps.join(", ") : "None"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5 sm:col-span-2">
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">Edit apps</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">
              {editApps.length > 0 ? editApps.join(", ") : "None"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5 sm:col-span-2">
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">User ID</p>
            <p className="mt-2 text-sm font-medium break-all text-[#1a2b49]">{user.id}</p>
          </div>
        </div>

        {isEditMode ? (
          <form
            action={updateProfileAction}
            className="mt-8 rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5"
          >
            <p className="text-xs tracking-[0.14em] text-[#6d7d9c] uppercase">
              Edit profile
            </p>

            <div className="mt-4 max-w-sm">
              <label className="space-y-1">
                <span className="text-sm font-medium text-[#132441]">Nickname</span>
                <input
                  type="text"
                  name="nickname"
                  defaultValue={user.nickname ?? ""}
                  className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  placeholder="Your nickname"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-4 cursor-pointer rounded-xl bg-[#edf2ff] px-5 py-3 text-sm font-semibold text-[#2d4071] hover:bg-[#e3eaff]"
            >
              Save nickname
            </button>
          </form>
        ) : null}

        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className="cursor-pointer rounded-xl border border-[#f0cbc1] bg-[#fff4f1] px-5 py-3 text-sm font-semibold text-[#9a4934] hover:bg-[#ffece7]"
          >
            Sign off
          </button>
        </form>
      </section>
    </main>
  );
}
