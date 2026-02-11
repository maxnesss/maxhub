import { TopNav } from "@/components/layout/TopNav";

const appCards = [
  {
    name: "Project board",
    status: "Planned",
    details: "Track tasks, releases, and deadlines in one feed.",
  },
  {
    name: "Knowledge vault",
    status: "Planned",
    details: "Collect notes, docs, and references for each app.",
  },
  {
    name: "Automation lab",
    status: "Planned",
    details: "Run scripts and workflows from a single interface.",
  },
];

export default function AppsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#647494] uppercase">Apps</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">App catalog</h1>
        <p className="mt-4 max-w-2xl text-(--text-muted)">
          This is the home for the modules you add to MaxHub. Keep it simple and
          grow by adding one useful app at a time.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {appCards.map((app) => (
          <article key={app.name} className="rounded-2xl border border-(--line) bg-white p-6">
            <span className="rounded-md bg-[#edf2ff] px-2 py-1 text-xs font-semibold tracking-[0.14em] text-[#40528b] uppercase">
              {app.status}
            </span>
            <h2 className="mt-4 text-xl font-semibold text-[#162947]">{app.name}</h2>
            <p className="mt-2 text-sm leading-6 text-(--text-muted)">{app.details}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
