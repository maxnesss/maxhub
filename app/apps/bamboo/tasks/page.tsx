import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { BAMBOO_TASKS } from "@/lib/bamboo-content";

const STATUS_STYLE: Record<(typeof BAMBOO_TASKS)[number]["status"], string> = {
  TODO: "border-[#ffe1b7] bg-[#fff6ea] text-[#8a5a16]",
  IN_PROGRESS: "border-[#cce1ff] bg-[#edf4ff] text-[#294f88]",
  DONE: "border-[#cce9d9] bg-[#eefbf4] text-[#1f6a3b]",
};

export default async function BambooTasksPage() {
  await requireAppRead("BAMBOO");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Tasks" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Tasks and timeline
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Action queue built from the setup and naming documents.
        </p>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.5fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
          <span>Task</span>
          <span>Phase</span>
          <span>Owner</span>
          <span>Status</span>
        </div>

        {BAMBOO_TASKS.map((item) => (
          <div
            key={item.task}
            className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.5fr] items-center border-t border-[#edf2fb] px-4 py-3"
          >
            <p className="text-sm text-[#1a2b49]">{item.task}</p>
            <p className="text-sm text-(--text-muted)">{item.phase}</p>
            <p className="text-sm text-(--text-muted)">{item.owner}</p>
            <span
              className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_STYLE[item.status]}`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
