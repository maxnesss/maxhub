import type { ReactNode } from "react";

import { BambooJourneyDock } from "@/components/bamboo/BambooJourneyDock";

type BambooLayoutProps = {
  children: ReactNode;
};

export default function BambooLayout({ children }: BambooLayoutProps) {
  return (
    <>
      <div className="pb-32">{children}</div>
      <BambooJourneyDock />
    </>
  );
}
