import type { ReactNode } from "react";

import { BambooJourneyDock } from "@/components/bamboo/BambooJourneyDock";
import { BambooLanguageToggle } from "@/components/bamboo/BambooLanguageToggle";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";

type BambooLayoutProps = {
  children: ReactNode;
};

export default async function BambooLayout({ children }: BambooLayoutProps) {
  const locale = await getBambooLocale();

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-6 pt-4">
        <div className="flex justify-end">
          <BambooLanguageToggle locale={locale} />
        </div>
      </div>
      <div className="pb-32">{children}</div>
      <BambooJourneyDock locale={locale} />
    </>
  );
}
