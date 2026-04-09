"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyIntake, type ProjectState } from "./types";

const KEY = "agent-site-builder::project";

const initialState: ProjectState = {
  intake: emptyIntake,
  theme: {},
  drafts: [],
  chosenDraftId: null,
  finalHtml: null,
  subagents: [
    { name: "designer", state: "pending", log: [] },
    { name: "layout", state: "pending", log: [] },
    { name: "backend", state: "pending", log: [] },
    { name: "tester", state: "pending", log: [] },
    { name: "debugger", state: "pending", log: [] },
    { name: "presenter", state: "pending", log: [] },
  ],
};

export function loadProject(): ProjectState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as ProjectState;
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export function saveProject(state: ProjectState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetProject() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function useProject() {
  const [state, setState] = useState<ProjectState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadProject());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<ProjectState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveProject(next);
      return next;
    });
  }, []);

  const patchIntake = useCallback(
    (patch: Partial<ProjectState["intake"]>) => {
      setState((prev) => {
        const next = { ...prev, intake: { ...prev.intake, ...patch } };
        saveProject(next);
        return next;
      });
    },
    []
  );

  const patchTheme = useCallback((patch: Partial<ProjectState["theme"]>) => {
    setState((prev) => {
      const next = { ...prev, theme: { ...prev.theme, ...patch } };
      saveProject(next);
      return next;
    });
  }, []);

  return { state, hydrated, update, patchIntake, patchTheme };
}
