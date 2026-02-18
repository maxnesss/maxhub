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
    return "border-[#7ea4ee] bg-[#eaf2ff] shadow-[0_0_0_1px_rgba(126,164,238,0.35)]";
  }

  return "border-[#d9e2f3] bg-white hover:bg-[#f8faff]";
}

function EnglishFlagIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden>
      <rect width="20" height="20" fill="#012169" />
      <path d="M0 0L20 20M20 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0L20 20M20 0L0 20" stroke="#C8102E" strokeWidth="2" />
      <rect x="8" width="4" height="20" fill="#FFFFFF" />
      <rect y="8" width="20" height="4" fill="#FFFFFF" />
      <rect x="9" width="2" height="20" fill="#C8102E" />
      <rect y="9" width="20" height="2" fill="#C8102E" />
    </svg>
  );
}

function MandarinFlagIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden>
      <rect width="20" height="20" fill="#DE2910" />
      <polygon points="5.5,3.2 6.4,5.8 9.1,5.8 6.9,7.3 7.8,9.9 5.5,8.3 3.2,9.9 4.1,7.3 1.9,5.8 4.6,5.8" fill="#FFDE00" />
      <circle cx="11.8" cy="3.9" r="1" fill="#FFDE00" />
      <circle cx="13.8" cy="6.2" r="1" fill="#FFDE00" />
      <circle cx="13.3" cy="9.2" r="1" fill="#FFDE00" />
      <circle cx="11" cy="11.2" r="1" fill="#FFDE00" />
    </svg>
  );
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
    <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e2f3] bg-white px-2 py-1.5">
      <button
        type="button"
        disabled={isPending}
        aria-label={copy.english}
        title={copy.english}
        aria-pressed={locale === "en"}
        onClick={() => {
          setLocale("en");
        }}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${getButtonClass(locale === "en")}`}
      >
        <span aria-hidden className="inline-flex h-5 w-5 overflow-hidden rounded-full border border-[#bfd0ec]">
          <EnglishFlagIcon />
        </span>
      </button>
      <button
        type="button"
        disabled={isPending}
        aria-label={copy.mandarin}
        title={copy.mandarin}
        aria-pressed={locale === "zh"}
        onClick={() => {
          setLocale("zh");
        }}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${getButtonClass(locale === "zh")}`}
      >
        <span aria-hidden className="inline-flex h-5 w-5 overflow-hidden rounded-full border border-[#bfd0ec]">
          <MandarinFlagIcon />
        </span>
      </button>
    </div>
  );
}
