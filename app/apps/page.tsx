import { APP_CODES, APP_DEFINITIONS } from "@/lib/apps";
import { canReadApp, requireUserContext } from "@/lib/authz";
import { TopNav } from "@/components/layout/TopNav";

export default async function AppsPage() {
  const user = await requireUserContext();

  const visibleApps = APP_CODES.filter((appCode) => canReadApp(user, appCode)).map(
    (appCode) => ({
      code: appCode,
      name: APP_DEFINITIONS[appCode].label,
      details: APP_DEFINITIONS[appCode].description,
    }),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#647494] uppercase">Apps</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">App catalog</h1>
        <p className="mt-4 max-w-2xl text-(--text-muted)">
          You only see apps where you have read access. Edit access is managed in
          Admin.
        </p>
      </section>

      {visibleApps.length > 0 ? (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {visibleApps.map((app) => (
            <article
              key={app.code}
              className="rounded-2xl border border-(--line) bg-white p-6"
            >
              <span className="rounded-md bg-[#edf2ff] px-2 py-1 text-xs font-semibold tracking-[0.14em] text-[#40528b] uppercase">
                {user.role === "ADMIN" ? "Admin Access" : "Read Access"}
              </span>
              <h2 className="mt-4 text-xl font-semibold text-[#162947]">{app.name}</h2>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{app.details}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-sm text-(--text-muted)">
            No app access has been assigned yet. Contact an admin to grant read
            permissions.
          </p>
        </section>
      )}
    </main>
  );
}
