import Link from "next/link";

import { toggleFavoriteAppAction } from "@/app/apps/actions";
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
      href: APP_DEFINITIONS[appCode].href,
      isFavorite: user.favoriteApps.includes(appCode),
    }),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#647494] uppercase">Apps</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">App catalog</h1>
        <p className="mt-4 max-w-2xl text-(--text-muted)">
          Pick a module tile to open your workspace. New modules will appear here
          as your hub grows.
        </p>
      </section>

      {visibleApps.length > 0 ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleApps.map((app) => (
            app.href ? (
              <article
                key={app.code}
                className="relative rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
              >
                <form action={toggleFavoriteAppAction} className="absolute top-4 right-4 z-10">
                  <input type="hidden" name="appCode" value={app.code} />
                  <button
                    type="submit"
                    className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition ${
                      app.isFavorite
                        ? "border-[#f4db86] bg-[#fff7d4]"
                        : "border-[#d7e0f2] bg-white hover:bg-[#f6f9ff]"
                    }`}
                    aria-label={
                      app.isFavorite
                        ? `Remove ${app.name} from favorites`
                        : `Add ${app.name} to favorites`
                    }
                    title={
                      app.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className={`h-4 w-4 ${
                        app.isFavorite ? "text-[#f4be2a]" : "text-[#c1cbe0]"
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        d="M10 1.7l2.56 5.18 5.72.83-4.14 4.04.98 5.7L10 14.78 4.88 17.45l.98-5.7L1.72 7.7l5.72-.83L10 1.7z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </form>

                <Link href={app.href} className="group block">
                  <h2 className="text-xl font-semibold text-[#162947]">{app.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-(--text-muted)">{app.details}</p>
                  <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                    Open app
                  </p>
                </Link>
              </article>
            ) : (
              <article
                key={app.code}
                className="relative rounded-2xl border border-(--line) bg-white p-6"
              >
                <h2 className="text-xl font-semibold text-[#162947]">{app.name}</h2>
                <p className="mt-2 text-sm leading-6 text-(--text-muted)">{app.details}</p>
                <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#7e8dac] uppercase">
                  Coming soon
                </p>
              </article>
            )
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
