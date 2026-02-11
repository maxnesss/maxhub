import ReactMarkdown from "react-markdown";

type ProjectNotesProps = {
  notes?: string | null;
};

export function ProjectNotes({ notes }: ProjectNotesProps) {
  const content = notes?.trim() ? notes : "_No notes yet._";

  return (
    <article className="rounded-2xl border border-(--line) bg-[#fbfdff] p-6">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="mb-3 text-2xl font-semibold text-[#132441]" {...props} />,
          h2: (props) => <h2 className="mb-3 text-xl font-semibold text-[#132441]" {...props} />,
          p: (props) => (
            <p className="mb-3 leading-7 text-(--text-muted) last:mb-0" {...props} />
          ),
          ul: (props) => (
            <ul className="mb-3 list-disc pl-6 text-(--text-muted) last:mb-0" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-3 list-decimal pl-6 text-(--text-muted) last:mb-0" {...props} />
          ),
          code: (props) => (
            <code className="rounded bg-[#eef2ff] px-1 py-0.5 text-[#3d4f84]" {...props} />
          ),
          pre: (props) => (
            <pre className="mb-3 overflow-x-auto rounded bg-[#eef2ff] p-3 text-[#3d4f84]" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
