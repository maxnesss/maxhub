import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { getSignedDocumentUrl } from "@/lib/r2-documents";
import { prisma } from "@/prisma";

import { deleteBambooDocumentAction, uploadBambooDocumentAction } from "./actions";

type BambooDocumentsPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const sizeMb = sizeBytes / 1024 / 1024;
  if (sizeMb < 1) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${sizeMb.toFixed(2)} MB`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function BambooDocumentsPage({
  searchParams,
}: BambooDocumentsPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error } = await searchParams;

  const documents = await prisma.bambooDocument.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  const documentsWithDownload = await Promise.all(
    documents.map(async (document) => {
      try {
        const downloadUrl = await getSignedDocumentUrl(document.objectKey);
        return { ...document, downloadUrl };
      } catch {
        return { ...document, downloadUrl: null };
      }
    }),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "uploaded" ? <Toast message="Document uploaded." /> : null}
      {saved === "deleted" ? <Toast message="Document removed." /> : null}
      {error === "invalid-file" ? (
        <Toast
          message="Invalid file. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD, CSV (max 25 MB)."
          tone="error"
        />
      ) : null}
      {error === "config" ? (
        <Toast
          message="R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET."
          tone="error"
        />
      ) : null}
      {error === "upload" ? (
        <Toast message="Document upload failed." tone="error" />
      ) : null}
      {error === "invalid" ? (
        <Toast message="Invalid request." tone="error" />
      ) : null}
      {error === "missing" ? (
        <Toast message="Document not found." tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Documents" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Documents
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Shared document library for Bamboo. Download files, and manage uploads
          when you have edit permission.
        </p>
      </section>

      {canEdit ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Upload document
          </h2>
          <form action={uploadBambooDocumentAction} className="mt-4 flex flex-wrap items-end gap-3">
            <label htmlFor="bamboo-document-upload" className="text-sm font-medium text-[#4e5e7a]">
              Select file
            </label>
            <input
              id="bamboo-document-upload"
              type="file"
              name="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown,text/csv"
              className="max-w-[320px] rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Upload
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="grid grid-cols-[1.2fr_0.7fr_0.5fr_0.7fr_0.8fr_0.7fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
          <span>File</span>
          <span>Type</span>
          <span>Size</span>
          <span>Uploaded by</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {documentsWithDownload.length > 0 ? (
          documentsWithDownload.map((document) => (
            <div
              key={document.id}
              className="grid grid-cols-[1.2fr_0.7fr_0.5fr_0.7fr_0.8fr_0.7fr] items-start gap-2 border-t border-[#edf2fb] px-4 py-3"
            >
              <p className="text-sm font-semibold text-[#1a2b49] break-all">{document.fileName}</p>
              <p className="text-sm text-(--text-muted) break-all">{document.contentType}</p>
              <p className="text-sm text-[#1a2b49]">{formatFileSize(document.sizeBytes)}</p>
              <p className="text-sm text-(--text-muted)">{document.uploadedBy}</p>
              <p className="text-sm text-(--text-muted)">{formatDate(document.createdAt)}</p>
              <div className="flex flex-wrap gap-2">
                {document.downloadUrl ? (
                  <a
                    href={document.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-(--text-muted)">Unavailable</span>
                )}
                {canEdit ? (
                  <form action={deleteBambooDocumentAction}>
                    <input type="hidden" name="id" value={document.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                    >
                      Remove
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="border-t border-[#edf2fb] px-4 py-4 text-sm text-(--text-muted)">
            No documents uploaded yet.
          </p>
        )}
      </section>
    </main>
  );
}
