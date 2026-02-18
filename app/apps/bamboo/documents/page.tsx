import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
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
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
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
      {saved === "uploaded" ? <Toast message={isZh ? "文档已上传。" : "Document uploaded."} /> : null}
      {saved === "deleted" ? <Toast message={isZh ? "文档已移除。" : "Document removed."} /> : null}
      {error === "invalid-file" ? (
        <Toast
          message={
            isZh
              ? "文件无效。允许：PDF、DOC、DOCX、XLS、XLSX、PPT、PPTX、TXT、MD、CSV（最大 25MB）。"
              : "Invalid file. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD, CSV (max 25 MB)."
          }
          tone="error"
        />
      ) : null}
      {error === "config" ? (
        <Toast
          message={
            isZh
              ? "R2 尚未配置。请设置 R2_ENDPOINT、R2_ACCESS_KEY_ID、R2_SECRET_ACCESS_KEY 和 R2_BUCKET。"
              : "R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET."
          }
          tone="error"
        />
      ) : null}
      {error === "upload" ? (
        <Toast message={isZh ? "文档上传失败。" : "Document upload failed."} tone="error" />
      ) : null}
      {error === "invalid" ? (
        <Toast message={isZh ? "请求无效。" : "Invalid request."} tone="error" />
      ) : null}
      {error === "missing" ? (
        <Toast message={isZh ? "未找到文档。" : "Document not found."} tone="error" />
      ) : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "文档" : "Documents" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "文档" : "Documents"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "Bamboo 共享文档库。可下载文件；具备编辑权限时可管理上传。"
            : "Shared document library for Bamboo. Download files, and manage uploads when you have edit permission."}
        </p>
      </section>

      {canEdit ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "上传文档" : "Upload document"}
          </h2>
          <form action={uploadBambooDocumentAction} className="mt-4 flex flex-wrap items-end gap-3">
            <label htmlFor="bamboo-document-upload" className="text-sm font-medium text-[#4e5e7a]">
              {isZh ? "选择文件" : "Select file"}
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
              {isZh ? "上传" : "Upload"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="space-y-3 p-4 md:hidden">
          {documentsWithDownload.length > 0 ? (
            documentsWithDownload.map((document) => (
              <article
                key={document.id}
                className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
              >
                <p className="text-sm font-semibold text-[#1a2b49] break-all">{document.fileName}</p>
                <p className="mt-1 text-xs text-(--text-muted) break-all">{document.contentType}</p>
                <div className="mt-2 text-sm text-[#1a2b49]">
                  <p>{isZh ? "大小" : "Size"}: {formatFileSize(document.sizeBytes)}</p>
                  <p className="text-(--text-muted)">{isZh ? "上传者" : "Uploaded by"}: {document.uploadedBy}</p>
                  <p className="text-(--text-muted)">{isZh ? "日期" : "Date"}: {formatDate(document.createdAt)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {document.downloadUrl ? (
                    <a
                      href={document.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                    >
                      {isZh ? "下载" : "Download"}
                    </a>
                  ) : (
                    <span className="text-xs text-(--text-muted)">{isZh ? "不可用" : "Unavailable"}</span>
                  )}
                  {canEdit ? (
                    <form action={deleteBambooDocumentAction}>
                      <input type="hidden" name="id" value={document.id} />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                      >
                        {isZh ? "移除" : "Remove"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-(--text-muted)">
              {isZh ? "还没有上传文档。" : "No documents uploaded yet."}
            </p>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[1.2fr_0.7fr_0.5fr_0.7fr_0.8fr_0.7fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
              <span>{isZh ? "文件" : "File"}</span>
              <span>{isZh ? "类型" : "Type"}</span>
              <span>{isZh ? "大小" : "Size"}</span>
              <span>{isZh ? "上传者" : "Uploaded by"}</span>
              <span>{isZh ? "日期" : "Date"}</span>
              <span>{isZh ? "操作" : "Actions"}</span>
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
                      {isZh ? "下载" : "Download"}
                    </a>
                  ) : (
                      <span className="text-xs text-(--text-muted)">{isZh ? "不可用" : "Unavailable"}</span>
                  )}
                    {canEdit ? (
                      <form action={deleteBambooDocumentAction}>
                        <input type="hidden" name="id" value={document.id} />
                        <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                      >
                          {isZh ? "移除" : "Remove"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="border-t border-[#edf2fb] px-4 py-4 text-sm text-(--text-muted)">
                {isZh ? "还没有上传文档。" : "No documents uploaded yet."}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
