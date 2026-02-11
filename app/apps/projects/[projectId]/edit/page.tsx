import { notFound, redirect } from "next/navigation";

import { ProjectEditForm } from "@/components/forms/ProjectEditForm";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

import { updateProjectAction } from "../../actions";

type EditProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const user = await requireAppRead("PROJECTS");
  if (!canEditApp(user, "PROJECTS")) {
    redirect("/apps/projects");
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priority: true,
      notes: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Projects", href: "/apps/projects" },
            { label: project.title, href: `/apps/projects/${project.id}`, preserveCase: true },
            { label: "Edit" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Edit project
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Update details and notes, then save. After saving, you will be returned
          to project details.
        </p>
      </section>

      <section className="mt-6">
        <ProjectEditForm
          initialProject={{
            id: project.id,
            title: project.title,
            slug: project.slug,
            description: project.description || "",
            priority: project.priority,
            notes: project.notes || "",
          }}
          onSubmitAction={updateProjectAction}
          successRedirectTo={`/apps/projects/${project.id}?saved=1`}
        />
      </section>
    </main>
  );
}
