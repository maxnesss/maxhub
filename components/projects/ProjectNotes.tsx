import ReactMarkdown from "react-markdown";

type ProjectNotesProps = {
  notes?: string | null;
};

export function ProjectNotes({ notes }: ProjectNotesProps) {
  const content = notes?.trim() ? notes : "_No notes yet._";

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-6">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="mb-3 text-2xl font-semibold" {...props} />,
          h2: (props) => <h2 className="mb-3 text-xl font-semibold" {...props} />,
          p: (props) => <p className="mb-3 leading-7 text-black/80 last:mb-0" {...props} />,
          ul: (props) => <ul className="mb-3 list-disc pl-6 last:mb-0" {...props} />,
          ol: (props) => <ol className="mb-3 list-decimal pl-6 last:mb-0" {...props} />,
          code: (props) => <code className="rounded bg-black/5 px-1 py-0.5" {...props} />,
          pre: (props) => <pre className="mb-3 overflow-x-auto rounded bg-black/5 p-3" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
