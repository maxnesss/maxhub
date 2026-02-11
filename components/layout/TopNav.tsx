import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/prisma";

type TopNavProps = {
  current?: "home" | "apps" | "profile" | "admin";
};

export async function TopNav({ current }: TopNavProps) {
  const session = await auth();

  const user = session?.user?.id
    ? (
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            role: true,
            email: true,
            name: true,
            nickname: true,
          },
        })
      )
    : undefined;

  const isAdmin = user?.role === "ADMIN";
  const profileIdentity = user?.nickname || user?.name || user?.email;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-(--line) bg-white/90 px-5 py-4 shadow-[0_14px_36px_-28px_rgba(19,33,58,0.45)] backdrop-blur-sm">
      <Link href="/" className="group flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4ddf0] bg-white text-sm font-semibold text-[#20304c] shadow-[0_10px_22px_-16px_rgba(32,48,76,0.45)]">
          MH
        </span>
        <span className="inline-flex items-center gap-2 font-semibold tracking-tight text-[#1a2943]">
          MaxHub
          <span className="h-2 w-2 rounded-full bg-(--accent-cyan) transition group-hover:bg-(--accent-blue)" />
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/apps"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            current === "apps"
              ? "bg-[#eef2ff] text-[#2c3f70]"
              : "text-[#55627e] hover:bg-[#f3f6fd]"
          }`}
        >
          Apps
        </Link>

        {isAdmin ? (
          <Link
            href="/admin"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              current === "admin"
                ? "bg-[#eef2ff] text-[#2c3f70]"
                : "text-[#55627e] hover:bg-[#f3f6fd]"
            }`}
          >
            Admin
          </Link>
        ) : null}

        {profileIdentity ? (
          <Link
            href="/profile"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-[#50607f] ${
              current === "profile"
                ? "border-[#cfd9ef] bg-[#eff3ff] text-[#2c3f70]"
                : "border-[#dce4f3] bg-[#f9fbff] hover:bg-[#f3f7ff]"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-(--accent-blue)" />
            {profileIdentity}
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-[#2e4175] hover:bg-[#e4eafd]"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
