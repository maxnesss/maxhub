export function SetupRequiredNotice() {
  return (
    <section className="mt-6 rounded-2xl border border-[#f4c6bd] bg-[#fff2ef] p-6">
      <h2 className="text-lg font-semibold tracking-tight text-[#8c3528]">
        Database setup required
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#8c3528]">
        Skating bible tables are not available in this database yet. Run
        <code className="mx-1 rounded bg-[#ffe4de] px-1 py-0.5 text-xs">npx prisma migrate dev</code>
        in this project, then refresh this page.
      </p>
    </section>
  );
}
