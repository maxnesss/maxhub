import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { canEditApp, requireAppRead } from "@/lib/authz";
import {
  PROJECT_PRIORITY_BADGE_CLASS,
  PROJECT_PRIORITY_LABEL,
} from "@/lib/project-priority";
import { prisma } from "@/prisma";

export default async function ProjectsPage() {
  const user = await requireAppRead("PROJECTS");
  const canEdit = canEditApp(user, "PROJECTS");

  const projects = await prisma.project.findMany({
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priority: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Projects" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Projects overview
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Browse projects by priority, open details for full context, and jump
              into edit mode when needed.
            </p>
          </div>

          {canEdit ? (
            <Link
              href="/apps/projects/new"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              New project
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {projects.length === 0 ? (
          <article className="rounded-2xl border border-(--line) bg-white p-6">
            <h2 className="text-xl font-semibold text-[#162947]">No projects yet</h2>
            <p className="mt-2 text-sm leading-6 text-(--text-muted)">
              {canEdit
                ? "Create your first project from the button above."
                : "No projects available yet."}
            </p>
          </article>
        ) : (
          projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-(--line) bg-white p-5"
            >
              <div className="grid items-start gap-3 md:grid-cols-[1fr_auto]">
                <Link
                  href={`/apps/projects/${project.id}`}
                  className="rounded-xl p-2 transition hover:bg-[#f8faff]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
                      {project.title}
                    </h2>
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-semibold ${PROJECT_PRIORITY_BADGE_CLASS[project.priority]}`}
                    >
                      {PROJECT_PRIORITY_LABEL[project.priority]} priority
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold tracking-[0.14em] text-[#6a7b9c] uppercase">
                    {project.slug}
                  </p>
                  <p className="mt-3 text-sm text-(--text-muted)">
                    {project.description || "No description provided."}
                  </p>
                </Link>

                <div className="flex items-center gap-2 md:pt-1">
                  <Link
                    href={`/apps/projects/${project.id}`}
                    className="inline-flex rounded-xl border border-[#d9e2f3] px-3 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    Open
                  </Link>
                  {canEdit ? (
                    <Link
                      href={`/apps/projects/${project.id}/edit`}
                      className="inline-flex rounded-xl border border-[#d9e2f3] px-3 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      aria-label={`Edit ${project.title}`}
                      title="Edit project"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
