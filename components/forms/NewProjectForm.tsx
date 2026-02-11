"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_LABEL,
} from "@/lib/project-priority";
import type { NewProjectInput } from "@/lib/validations/project";
import { projectSchema } from "@/lib/validations/project";

type NewProjectFormProps = {
  onSubmitAction?: (values: NewProjectInput) => Promise<unknown> | void;
  successRedirectTo?: string;
  successRedirectToCreatedProject?: boolean;
};

async function noopSubmit() {}

export function NewProjectForm({
  onSubmitAction = noopSubmit,
  successRedirectTo,
  successRedirectToCreatedProject = false,
}: NewProjectFormProps) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<NewProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      priority: "MEDIUM",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmissionError(null);

    try {
      const result = await onSubmitAction(values);
      form.reset({
        title: "",
        slug: "",
        description: "",
        priority: "MEDIUM",
        notes: "",
      });

      if (
        successRedirectToCreatedProject &&
        typeof result === "object" &&
        result !== null &&
        "id" in result &&
        typeof result.id === "string"
      ) {
        router.push(`/apps/projects/${result.id}?created=1`);
        return;
      }

      if (successRedirectTo) {
        router.push(successRedirectTo);
        return;
      }

      router.refresh();
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to create project.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-(--line) bg-white p-6">
      <h3 className="text-lg font-semibold text-[#132441]">New project</h3>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Title</span>
        <input
          type="text"
          {...form.register("title")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
          placeholder="My Project"
        />
        <p className="text-sm text-red-700">{form.formState.errors.title?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Slug</span>
        <input
          type="text"
          {...form.register("slug")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
          placeholder="my-project"
        />
        <p className="text-sm text-red-700">{form.formState.errors.slug?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Description</span>
        <textarea
          {...form.register("description")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
          rows={3}
          placeholder="Short summary"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Priority</span>
        <select
          {...form.register("priority")}
          className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
        >
          {PROJECT_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PROJECT_PRIORITY_LABEL[priority]}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Notes (Markdown)</span>
        <textarea
          {...form.register("notes")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
          rows={6}
          placeholder="# Notes"
        />
      </label>

      {submissionError ? (
        <p className="rounded-lg border border-[#f4c6bd] bg-[#fff2ef] px-3 py-2 text-sm text-[#9d3e2f]">
          {submissionError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="cursor-pointer rounded-xl bg-[#edf2ff] px-4 py-2 text-sm font-semibold text-[#2e4175] hover:bg-[#e4eafd] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Saving..." : "Create project"}
      </button>
    </form>
  );
}
