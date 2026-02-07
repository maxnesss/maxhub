"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { ProjectEditInput } from "@/lib/validations/project";
import { projectEditSchema } from "@/lib/validations/project";

type ProjectEditFormProps = {
  initialProject: ProjectEditInput;
  onSubmitAction?: (values: ProjectEditInput) => Promise<void> | void;
};

async function noopSubmit() {}

export function ProjectEditForm({
  initialProject,
  onSubmitAction = noopSubmit,
}: ProjectEditFormProps) {
  const form = useForm<ProjectEditInput>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: initialProject,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitAction(values);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
      <h3 className="text-lg font-semibold text-black">Edit project</h3>

      <input type="hidden" {...form.register("id")} />

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Title</span>
        <input
          type="text"
          {...form.register("title")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
        <p className="text-sm text-red-700">{form.formState.errors.title?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Slug</span>
        <input
          type="text"
          {...form.register("slug")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
        <p className="text-sm text-red-700">{form.formState.errors.slug?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Description</span>
        <textarea
          {...form.register("description")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
          rows={3}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Notes (Markdown)</span>
        <textarea
          {...form.register("notes")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
          rows={6}
        />
      </label>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
