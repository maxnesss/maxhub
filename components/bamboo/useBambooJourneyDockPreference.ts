"use client";

import { useSyncExternalStore } from "react";

import {
  BAMBOO_JOURNEY_DOCK_EVENT,
  BAMBOO_JOURNEY_DOCK_STORAGE_KEY,
} from "@/lib/bamboo-journey";

const DEFAULT_DOCK_ENABLED = true;

function readPreferenceSnapshot() {
  if (typeof window === "undefined") {
    return DEFAULT_DOCK_ENABLED;
  }

  const saved = window.localStorage.getItem(BAMBOO_JOURNEY_DOCK_STORAGE_KEY);

  if (saved === null) {
    return DEFAULT_DOCK_ENABLED;
  }

  return saved === "1";
}

function subscribeToPreference(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== BAMBOO_JOURNEY_DOCK_STORAGE_KEY) {
      return;
    }

    onStoreChange();
  };

  const handleDockEvent = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(BAMBOO_JOURNEY_DOCK_EVENT, handleDockEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BAMBOO_JOURNEY_DOCK_EVENT, handleDockEvent);
  };
}

function getServerSnapshot() {
  return DEFAULT_DOCK_ENABLED;
}

export function setBambooJourneyDockEnabled(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BAMBOO_JOURNEY_DOCK_STORAGE_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent(BAMBOO_JOURNEY_DOCK_EVENT, { detail: enabled }));
}

export function useBambooJourneyDockEnabled() {
  return useSyncExternalStore(
    subscribeToPreference,
    readPreferenceSnapshot,
    getServerSnapshot,
  );
}
