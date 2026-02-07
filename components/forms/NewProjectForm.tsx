"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { NewProjectInput } from "@/lib/validations/project";
import { projectSchema } from "@/lib/validations/project";

type NewProjectFormProps = {
  onSubmitAction?: (values: NewProjectInput) => Promise<void> | void;
};

async function noopSubmit() {}

export function NewProjectForm({
  onSubmitAction = noopSubmit,
}: NewProjectFormProps) {
  const form = useForm<NewProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitAction(values);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
      <h3 className="text-lg font-semibold text-black">New project</h3>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Title</span>
        <input
          type="text"
          {...form.register("title")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
          placeholder="My Project"
        />
        <p className="text-sm text-red-700">{form.formState.errors.title?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Slug</span>
        <input
          type="text"
          {...form.register("slug")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
          placeholder="my-project"
        />
        <p className="text-sm text-red-700">{form.formState.errors.slug?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Description</span>
        <textarea
          {...form.register("description")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
          rows={3}
          placeholder="Short summary"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-black">Notes (Markdown)</span>
        <textarea
          {...form.register("notes")}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
          rows={6}
          placeholder="# Notes"
        />
      </label>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Saving..." : "Create project"}
      </button>
    </form>
  );
}
