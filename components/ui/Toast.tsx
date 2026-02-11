"use client";

import { useEffect, useState } from "react";

type ToastTone = "success" | "info" | "error";

type ToastProps = {
  message: string;
  tone?: ToastTone;
  dismissAfterMs?: number;
};

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-[#bfe6cf] bg-[#f1fbf5] text-[#1f6a3b]",
  info: "border-[#c9d8ff] bg-[#f2f6ff] text-[#2d4fa3]",
  error: "border-[#f3c4bf] bg-[#fff4f2] text-[#9f3c31]",
};

export function Toast({
  message,
  tone = "success",
  dismissAfterMs = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (dismissAfterMs <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, dismissAfterMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dismissAfterMs]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-full -translate-x-1/2 px-4">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto mx-auto flex w-full max-w-xl items-start gap-4 rounded-2xl border px-5 py-4 text-base shadow-[0_16px_34px_-18px_rgba(19,33,58,0.5)] ${TONE_STYLES[tone]}`}
      >
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-current opacity-70" />
        <p className="flex-1">{message}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="cursor-pointer rounded-md px-1 text-xl leading-none opacity-70 transition hover:opacity-100"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
