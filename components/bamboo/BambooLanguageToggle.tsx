"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  BAMBOO_LOCALE_COOKIE_KEY,
  type BambooLocale,
  getBambooCopy,
} from "@/lib/bamboo-i18n";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

type BambooLanguageToggleProps = {
  locale: BambooLocale;
};

function getButtonClass(active: boolean) {
  if (active) {
    return "border-[#8fb2f4] bg-[#eaf2ff] text-[#21417a]";
  }

  return "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]";
}

export function BambooLanguageToggle({ locale }: BambooLanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const copy = getBambooCopy(locale);

  const setLocale = (nextLocale: BambooLocale) => {
    if (nextLocale === locale) {
      return;
    }

    document.cookie =
      `${BAMBOO_LOCALE_COOKIE_KEY}=${nextLocale}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#d9e2f3] bg-white px-3 py-2">
      <span className="text-xs font-semibold tracking-[0.08em] text-[#5f7091] uppercase">
        {copy.language}
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setLocale("en");
        }}
        className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${getButtonClass(locale === "en")}`}
      >
        {copy.english}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setLocale("zh");
        }}
        className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${getButtonClass(locale === "zh")}`}
      >
        {copy.mandarin}
      </button>
    </div>
  );
}
