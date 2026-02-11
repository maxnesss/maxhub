import Link from "next/link";
import { notFound } from "next/navigation";

import { TopNav } from "@/components/layout/TopNav";
import { ProjectNotes } from "@/components/projects/ProjectNotes";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import {
  PROJECT_PRIORITY_BADGE_CLASS,
  PROJECT_PRIORITY_LABEL,
} from "@/lib/project-priority";
import { prisma } from "@/prisma";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ saved?: string; created?: string }>;
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const user = await requireAppRead("PROJECTS");
  const canEdit = canEditApp(user, "PROJECTS");

  const { projectId } = await params;
  const { saved, created } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priority: true,
      notes: true,
      updatedAt: true,
      owner: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const toastMessage =
    created === "1"
      ? "Project created successfully."
      : saved === "1"
        ? "Project updated successfully."
        : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {toastMessage ? <Toast message={toastMessage} /> : null}
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Projects", href: "/apps/projects" },
                { label: project.title, preserveCase: true },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              {project.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#6a7b9c] uppercase">
                {project.slug}
              </p>
              <span
                className={`rounded-full border px-2 py-1 text-xs font-semibold ${PROJECT_PRIORITY_BADGE_CLASS[project.priority]}`}
              >
                {PROJECT_PRIORITY_LABEL[project.priority]} priority
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/apps/projects"
              className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Back
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

        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {project.description || "No description provided."}
        </p>

        <div className="mt-5 grid gap-3 text-xs text-[#627292] sm:grid-cols-2">
          <p>
            <span className="font-semibold tracking-[0.12em] uppercase">Owner:</span>{" "}
            {project.owner.email}
          </p>
          <p>
            <span className="font-semibold tracking-[0.12em] uppercase">Updated:</span>{" "}
            {project.updatedAt.toLocaleString()}
          </p>
        </div>
      </section>

      <section className="mt-6">
        <ProjectNotes notes={project.notes} />
      </section>
    </main>
  );
}
