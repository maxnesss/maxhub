"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RoundTimerModalProps = {
  round: {
    id: string;
    title: string;
    targetSeconds: number;
    restSeconds: number;
    notes: string | null;
  };
  isDone: boolean;
  returnTo: string;
  action: (formData: FormData) => void | Promise<void>;
};

function formatElapsed(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalCentiseconds = Math.floor(safeMs / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function canHandleSpaceKey(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return true;
  }

  if (target.isContentEditable) {
    return false;
  }

  return !["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName);
}

export function RoundTimerModal({ round, isDone, returnTo, action }: RoundTimerModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const targetMs = round.targetSeconds * 1000;
  const isOverTarget = elapsedMs >= targetMs;

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    if (startedAtRef.current !== null) {
      accumulatedRef.current += performance.now() - startedAtRef.current;
      startedAtRef.current = null;
    }

    stopFrame();
    setElapsedMs(accumulatedRef.current);
    setIsRunning(false);
  }, [stopFrame]);

  const start = useCallback(() => {
    if (startedAtRef.current !== null) {
      return;
    }

    startedAtRef.current = performance.now();
    setIsRunning(true);

    const step = (now: number) => {
      if (startedAtRef.current === null) {
        return;
      }

      setElapsedMs(accumulatedRef.current + (now - startedAtRef.current));
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
  }, []);

  const toggle = useCallback(() => {
    if (startedAtRef.current !== null) {
      pause();
      return;
    }

    start();
  }, [pause, start]);

  const reset = useCallback(() => {
    stopFrame();
    accumulatedRef.current = 0;
    startedAtRef.current = null;
    setElapsedMs(0);
    setIsRunning(false);
  }, [stopFrame]);

  function openModal() {
    reset();
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function closeModal() {
    pause();
    dialogRef.current?.close();
    setIsOpen(false);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || event.code !== "Space" || event.repeat) {
        return;
      }

      if (!canHandleSpaceKey(event.target)) {
        return;
      }

      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      stopFrame();
    };
  }, [isOpen, stopFrame, toggle]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`inline-flex cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold ${
          isDone
            ? "border-[#bfdcc8] bg-[#f1fbf5] text-[#1f6a3b] hover:bg-[#e7f7ee]"
            : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
        }`}
      >
        {round.title}
        {isDone ? <span className="ml-2">✓</span> : null}
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 max-h-[92vh] w-[92vw] max-w-[38rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <div className="space-y-5 overflow-x-hidden p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                Round timer
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#162947]">
                {round.title}
              </h3>
              <p className="mt-2 text-sm text-(--text-muted)">
                Target {formatSeconds(round.targetSeconds)} • Rest {formatSeconds(round.restSeconds)}
              </p>
              {round.notes ? (
                <p className="mt-1 text-sm text-(--text-muted)">{round.notes}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-lg border border-[#d9e2f3] px-3 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Close
            </button>
          </div>

          <div
            className={`rounded-2xl border px-6 py-6 text-center shadow-[0_16px_30px_-26px_rgba(19,33,58,0.45)] md:px-10 ${
              isOverTarget
                ? "border-[#bfdcc8] bg-[#f1fbf5]"
                : "border-[#d8e2f4] bg-[#fbfdff]"
            }`}
          >
            <p
              className={`inline-block whitespace-nowrap font-mono tabular-nums text-[clamp(2.4rem,12vw,5.5rem)] font-semibold tracking-tight ${
                isOverTarget ? "text-[#1f6a3b]" : "text-[#162947]"
              }`}
            >
              {formatElapsed(elapsedMs)}
            </p>

            {isOverTarget ? (
              <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-[#1f6a3b] uppercase">
                ✓ Target reached
              </p>
            ) : null}
          </div>

          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Space toggles start/pause
          </p>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer rounded-lg border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={toggle}
              className="cursor-pointer rounded-lg bg-[#edf2ff] px-4 py-2 text-sm font-semibold text-[#2d4071] hover:bg-[#e3eaff]"
            >
              {isRunning ? "Pause" : "Start"}
            </button>

            {!isRunning && elapsedMs > 0 ? (
              <form action={action}>
                <input type="hidden" name="roundId" value={round.id} />
                <input type="hidden" name="elapsedMs" value={Math.max(1, Math.round(elapsedMs))} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg border border-[#bfdcc8] bg-[#f1fbf5] px-4 py-2 text-sm font-semibold text-[#1f6a3b] hover:bg-[#e7f7ee]"
                >
                  Done {isOverTarget ? "✓" : ""}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
