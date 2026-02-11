import { redirect } from "next/navigation";

import { NewProjectForm } from "@/components/forms/NewProjectForm";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { canEditApp, requireAppRead } from "@/lib/authz";

import { createProjectAction } from "../actions";

export default async function NewProjectPage() {
  const user = await requireAppRead("PROJECTS");
  if (!canEditApp(user, "PROJECTS")) {
    redirect("/apps/projects");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Projects", href: "/apps/projects" },
            { label: "New" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          New project
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Create a new project and continue in the details page.
        </p>
      </section>

      <section className="mt-6">
        <NewProjectForm
          onSubmitAction={createProjectAction}
          successRedirectToCreatedProject
        />
      </section>
    </main>
  );
}
