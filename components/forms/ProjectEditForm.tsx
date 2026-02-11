"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_LABEL,
} from "@/lib/project-priority";
import type { ProjectEditInput } from "@/lib/validations/project";
import { projectEditSchema } from "@/lib/validations/project";

type ProjectEditFormProps = {
  initialProject: ProjectEditInput;
  onSubmitAction?: (values: ProjectEditInput) => Promise<unknown> | void;
  successRedirectTo?: string;
};

async function noopSubmit() {}

export function ProjectEditForm({
  initialProject,
  onSubmitAction = noopSubmit,
  successRedirectTo,
}: ProjectEditFormProps) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<ProjectEditInput>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: initialProject,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmissionError(null);

    try {
      await onSubmitAction(values);
      if (successRedirectTo) {
        router.push(successRedirectTo);
        return;
      }

      router.refresh();
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to update project.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-(--line) bg-white p-6">
      <h3 className="text-lg font-semibold text-[#132441]">Edit project</h3>

      <input type="hidden" {...form.register("id")} />

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Title</span>
        <input
          type="text"
          {...form.register("title")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
        />
        <p className="text-sm text-red-700">{form.formState.errors.title?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Slug</span>
        <input
          type="text"
          {...form.register("slug")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
        />
        <p className="text-sm text-red-700">{form.formState.errors.slug?.message}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[#132441]">Description</span>
        <textarea
          {...form.register("description")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
          rows={3}
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
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[#132441]">Notes (Markdown)</span>
          <a
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4e5e7a] hover:text-[#2f4374]"
          >
            Markdown help
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </span>
        <textarea
          {...form.register("notes")}
          className="w-full rounded-lg border border-[#d8e2f4] px-3 py-2 text-sm"
          rows={6}
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
        {form.formState.isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
