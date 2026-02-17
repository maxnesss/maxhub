import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <section className="rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#647494] uppercase">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#132441]">Page not found</h1>
        <p className="mt-4 max-w-xl text-(--text-muted)">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-[#edf2ff] px-5 py-3 text-sm font-semibold text-[#2d4071] hover:bg-[#e3eaff]"
          >
            Go to homepage
          </Link>
          <Link
            href="/apps"
            className="rounded-xl border border-[#d9e2f3] px-5 py-3 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Open apps
          </Link>
        </div>
      </section>
    </main>
  );
}
