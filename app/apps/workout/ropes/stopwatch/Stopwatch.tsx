"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function formatElapsed(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalCentiseconds = Math.floor(safeMs / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function canHandleSpaceKey(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return true;
  }

  if (target.isContentEditable) {
    return false;
  }

  return !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) {
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
  }, [stopFrame, toggle]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-6 md:py-10">
      <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
        Space toggles start and pause
      </p>

      <div className="rounded-2xl border border-[#d8e2f4] bg-[#fbfdff] px-6 py-5 text-center shadow-[0_16px_30px_-26px_rgba(19,33,58,0.45)] md:px-10 md:py-8">
        <p className="inline-block min-w-[8ch] font-mono tabular-nums text-6xl font-semibold tracking-tight text-[#162947] md:text-8xl">
          {formatElapsed(elapsedMs)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="cursor-pointer rounded-xl bg-[#edf2ff] px-5 py-3 text-sm font-semibold text-[#2d4071] hover:bg-[#e3eaff]"
        >
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-xl border border-[#d9e2f3] px-5 py-3 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
