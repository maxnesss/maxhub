"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

type BrainstormIdea = {
  id: string;
  title: string;
  notes: string;
  parentId: string | null;
  posX: number | null;
  posY: number | null;
};

type BrainstormMapProps = {
  brainstormId: string;
  centerTitle: string;
  ideas: BrainstormIdea[];
  canEdit: boolean;
  addIdeaAction: (formData: FormData) => void;
  deleteIdeaAction: (formData: FormData) => void;
  updateIdeaAction: (formData: FormData) => void;
  updateCenterTopicAction: (formData: FormData) => void;
  saveIdeaPositionAction: (input: {
    brainstormId: string;
    id: string;
    posX: number;
    posY: number;
  }) => Promise<void>;
};

type Point = {
  x: number;
  y: number;
};

type DragState = {
  id: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

type ActiveEditor =
  | { target: "center"; mode: "edit" | "add-child" }
  | { target: "idea"; id: string; mode: "edit" | "add-child" };

const NODE_SAFE_X = 170;
const NODE_SAFE_Y = 150;
const DEFAULT_MAP_WIDTH = 1100;
const DEFAULT_MAP_HEIGHT = 780;
const MIN_MAP_WIDTH = 900;
const MIN_MAP_HEIGHT = 680;
const MAP_HEIGHT_RATIO = 0.71;

function trimForBubble(value: string, max = 26) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 1)}...`;
}

function clampNodePosition(position: Point, mapWidth: number, mapHeight: number): Point {
  return {
    x: Math.max(NODE_SAFE_X, Math.min(mapWidth - NODE_SAFE_X, Math.round(position.x))),
    y: Math.max(NODE_SAFE_Y, Math.min(mapHeight - NODE_SAFE_Y, Math.round(position.y))),
  };
}

function buildAutoLayout(ideas: BrainstormIdea[], mapWidth: number, mapHeight: number) {
  const mapCenterX = mapWidth / 2;
  const mapCenterY = mapHeight / 2;
  const byId = new Map(ideas.map((idea) => [idea.id, idea]));
  const childrenByParent = new Map<string | null, BrainstormIdea[]>();

  for (const idea of ideas) {
    const parentKey = idea.parentId ?? null;
    const children = childrenByParent.get(parentKey) ?? [];
    children.push(idea);
    childrenByParent.set(parentKey, children);
  }

  const leafMemo = new Map<string | null, number>();
  const countLeaves = (nodeId: string | null): number => {
    if (leafMemo.has(nodeId)) {
      return leafMemo.get(nodeId)!;
    }

    const children = childrenByParent.get(nodeId) ?? [];
    if (children.length === 0) {
      leafMemo.set(nodeId, 1);
      return 1;
    }

    const total = children.reduce((sum, child) => sum + countLeaves(child.id), 0);
    const leafCount = Math.max(total, 1);
    leafMemo.set(nodeId, leafCount);
    return leafCount;
  };

  const autoPositions = new Map<string, Point>();

  const placeChildren = (
    parentId: string | null,
    startAngle: number,
    endAngle: number,
    depth: number,
  ) => {
    const children = childrenByParent.get(parentId) ?? [];
    if (children.length === 0) {
      return;
    }

    const totalLeaves = children.reduce((sum, child) => sum + countLeaves(child.id), 0);
    if (totalLeaves === 0) {
      return;
    }

    let angleCursor = startAngle;
    for (const child of children) {
      const childLeaves = countLeaves(child.id);
      const span = ((endAngle - startAngle) * childLeaves) / totalLeaves;
      const childStart = angleCursor;
      const childEnd = angleCursor + span;
      const angle = (childStart + childEnd) / 2;
      const radius = 160 + (depth - 1) * 130;

      autoPositions.set(
        child.id,
        clampNodePosition(
          {
            x: mapCenterX + Math.cos(angle) * radius,
            y: mapCenterY + Math.sin(angle) * radius,
          },
          mapWidth,
          mapHeight,
        ),
      );

      placeChildren(child.id, childStart, childEnd, depth + 1);
      angleCursor = childEnd;
    }
  };

  placeChildren(null, -Math.PI / 2, (3 * Math.PI) / 2, 1);
  return { autoPositions, byId };
}

export function BrainstormMap({
  brainstormId,
  centerTitle,
  ideas,
  canEdit,
  addIdeaAction,
  deleteIdeaAction,
  updateIdeaAction,
  updateCenterTopicAction,
  saveIdeaPositionAction,
}: BrainstormMapProps) {
  const [activeEditor, setActiveEditor] = useState<ActiveEditor | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [isSavingPosition, startSavePositionTransition] = useTransition();
  const suppressClickRef = useRef<string | null>(null);
  const pendingClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingClickTargetRef = useRef<string | null>(null);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const [mapSize, setMapSize] = useState({
    width: DEFAULT_MAP_WIDTH,
    height: DEFAULT_MAP_HEIGHT,
  });

  const mapWidth = mapSize.width;
  const mapHeight = mapSize.height;
  const mapCenterX = mapWidth / 2;
  const mapCenterY = mapHeight / 2;

  useEffect(() => {
    const element = mapViewportRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const viewportWidth = Math.round(entry.contentRect.width);
      const width = Math.max(MIN_MAP_WIDTH, viewportWidth);
      const height = Math.max(MIN_MAP_HEIGHT, Math.round(width * MAP_HEIGHT_RATIO));

      setMapSize((prev) => {
        if (prev.width === width && prev.height === height) {
          return prev;
        }
        return { width, height };
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { autoPositions, byId } = useMemo(
    () => buildAutoLayout(ideas, mapWidth, mapHeight),
    [ideas, mapWidth, mapHeight],
  );

  const initialPositions = useMemo(() => {
    const next = new Map<string, Point>();

    for (const idea of ideas) {
      if (idea.posX !== null && idea.posY !== null) {
        next.set(
          idea.id,
          clampNodePosition(
            {
              x: mapCenterX + idea.posX,
              y: mapCenterY + idea.posY,
            },
            mapWidth,
            mapHeight,
          ),
        );
        continue;
      }

      next.set(
        idea.id,
        autoPositions.get(idea.id) ?? {
          x: mapCenterX,
          y: mapCenterY,
        },
      );
    }

    return next;
  }, [ideas, autoPositions, mapCenterX, mapCenterY, mapWidth, mapHeight]);

  const [positions, setPositions] = useState<Map<string, Point>>(initialPositions);

  useEffect(() => {
    setPositions(initialPositions);
  }, [initialPositions]);

  const getPosition = (id: string): Point => {
    return (
      positions.get(id) ??
      initialPositions.get(id) ?? {
        x: mapCenterX,
        y: mapCenterY,
      }
    );
  };

  function clearPendingClick() {
    if (pendingClickTimeoutRef.current) {
      clearTimeout(pendingClickTimeoutRef.current);
      pendingClickTimeoutRef.current = null;
    }
    pendingClickTargetRef.current = null;
  }

  function handleBubbleClick(targetKey: string, openEdit: () => void, openAddChild: () => void) {
    if (!canEdit) {
      return;
    }

    if (pendingClickTargetRef.current === targetKey && pendingClickTimeoutRef.current) {
      clearPendingClick();
      openAddChild();
      return;
    }

    clearPendingClick();
    pendingClickTargetRef.current = targetKey;
    pendingClickTimeoutRef.current = setTimeout(() => {
      pendingClickTargetRef.current = null;
      pendingClickTimeoutRef.current = null;
      openEdit();
    }, 230);
  }

  return (
    <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Brainstorm map</h2>
        <p className="text-xs font-semibold tracking-[0.12em] text-[#607296] uppercase">
          One click edit, double click add child, drag to move
        </p>
      </div>

      <p className="mt-2 min-h-4 text-xs text-[#607296]">
        {isSavingPosition ? "Saving bubble position..." : ""}
      </p>

      <div className="mt-4 overflow-x-auto">
        <div ref={mapViewportRef} className="h-0 w-full" />
        <div
          className="relative mx-auto min-w-[760px] rounded-2xl border border-[#e3eaf7] bg-[#f8fbff]"
          style={{ width: mapWidth, height: mapHeight }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            aria-hidden="true"
          >
            {ideas.map((idea) => {
              const child = getPosition(idea.id);

              if (!idea.parentId) {
                return (
                  <line
                    key={`${idea.id}-line`}
                    x1={mapCenterX}
                    y1={mapCenterY}
                    x2={child.x}
                    y2={child.y}
                    stroke="#d5e2f7"
                    strokeWidth="2"
                  />
                );
              }

              const parent = getPosition(idea.parentId);
              return (
                <line
                  key={`${idea.id}-line`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={child.x}
                  y2={child.y}
                  stroke="#d5e2f7"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            {canEdit && activeEditor?.target === "center" ? (
              <div className="w-[280px] rounded-[28px] border border-[#7da1dc] bg-[#f0f6ff] p-4 text-left shadow-[0_18px_28px_-18px_rgba(19,33,58,0.45)]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                    {activeEditor.mode === "edit" ? "Edit center" : "Add child"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveEditor(null)}
                    className="cursor-pointer rounded-md border border-[#d9e2f3] px-2 py-1 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    Close
                  </button>
                </div>

                {activeEditor.mode === "edit" ? (
                  <form
                    action={updateCenterTopicAction}
                    className="mt-3 space-y-3"
                    key={`center-inline-edit-${centerTitle}`}
                  >
                    <input type="hidden" name="brainstormId" value={brainstormId} />
                    <input
                      name="title"
                      defaultValue={centerTitle}
                      required
                      maxLength={120}
                      className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#32548f] hover:bg-[#e5efff]"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <form action={addIdeaAction} className="mt-3 space-y-3">
                    <input type="hidden" name="brainstormId" value={brainstormId} />
                    <input type="hidden" name="parentId" value="" />
                    <input
                      name="title"
                      required
                      maxLength={140}
                      className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                      placeholder="Child title"
                    />
                    <textarea
                      name="notes"
                      rows={3}
                      maxLength={2000}
                      className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                      placeholder="Optional details"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#32548f] hover:bg-[#e5efff]"
                      >
                        Add child
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <button
                type="button"
              onClick={() =>
                handleBubbleClick(
                  "center",
                  () => setActiveEditor({ target: "center", mode: "edit" }),
                  () => setActiveEditor({ target: "center", mode: "add-child" }),
                )
              }
              className="inline-flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#9bb9e9] bg-[#e9f2ff] px-3 text-center text-sm font-semibold text-[#1e4380] shadow-[0_12px_24px_-18px_rgba(19,33,58,0.45)] hover:bg-[#dfeeff]"
            >
              {trimForBubble(centerTitle, 32)}
            </button>
            )}
          </div>

          {ideas.map((idea) => {
            const node = getPosition(idea.id);
            const isActive =
              activeEditor?.target === "idea" && activeEditor.id === idea.id;
            const isDragging = dragging?.id === idea.id;
            const activeIdea = byId.get(idea.id) ?? null;

            if (canEdit && isActive && activeIdea) {
              return (
                <div
                  key={idea.id}
                  className="absolute z-20 w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[#7da1dc] bg-[#f0f6ff] p-4 text-left shadow-[0_18px_28px_-18px_rgba(19,33,58,0.45)]"
                  style={{ left: node.x, top: node.y }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                      {activeEditor.mode === "edit" ? "Edit bubble" : "Add child"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveEditor(null)}
                      className="cursor-pointer rounded-md border border-[#d9e2f3] px-2 py-1 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                    >
                      Close
                    </button>
                  </div>

                  {activeEditor.mode === "edit" ? (
                    <div className="mt-3 space-y-3" key={`bubble-inline-edit-${activeIdea.id}-${activeIdea.title}`}>
                      <form action={updateIdeaAction} className="space-y-3">
                        <input type="hidden" name="brainstormId" value={brainstormId} />
                        <input type="hidden" name="id" value={activeIdea.id} />
                        <input
                          name="title"
                          defaultValue={activeIdea.title}
                          required
                          maxLength={140}
                          className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                        />
                        <textarea
                          name="notes"
                          defaultValue={activeIdea.notes}
                          rows={3}
                          maxLength={2000}
                          className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                          placeholder="Details"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#32548f] hover:bg-[#e5efff]"
                          >
                            Save
                          </button>
                        </div>
                      </form>

                      <form action={deleteIdeaAction} className="flex justify-end">
                        <input type="hidden" name="brainstormId" value={brainstormId} />
                        <input type="hidden" name="id" value={activeIdea.id} />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-lg border border-[#efcbc2] bg-[#fff2ef] px-3 py-2 text-xs font-semibold text-[#8b3a2d] hover:bg-[#fee8e3]"
                        >
                          Delete bubble
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form action={addIdeaAction} className="mt-3 space-y-3">
                      <input type="hidden" name="brainstormId" value={brainstormId} />
                      <input type="hidden" name="parentId" value={activeIdea.id} />
                      <input
                        name="title"
                        required
                        maxLength={140}
                        className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                        placeholder="Child title"
                      />
                      <textarea
                        name="notes"
                        rows={3}
                        maxLength={2000}
                        className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                        placeholder="Optional details"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#32548f] hover:bg-[#e5efff]"
                        >
                          Add child
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            }

            return (
              <button
                key={idea.id}
                type="button"
                onClick={() => {
                  if (suppressClickRef.current === idea.id) {
                    suppressClickRef.current = null;
                    return;
                  }

                  handleBubbleClick(
                    `idea:${idea.id}`,
                    () => setActiveEditor({ target: "idea", id: idea.id, mode: "edit" }),
                    () => setActiveEditor({ target: "idea", id: idea.id, mode: "add-child" }),
                  );
                }}
                onPointerDown={(event) => {
                  if (!canEdit) {
                    return;
                  }

                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDragging({
                    id: idea.id,
                    pointerId: event.pointerId,
                    startClientX: event.clientX,
                    startClientY: event.clientY,
                    startX: node.x,
                    startY: node.y,
                    moved: false,
                  });
                }}
                onPointerMove={(event) => {
                  if (
                    !canEdit ||
                    !dragging ||
                    dragging.id !== idea.id ||
                    dragging.pointerId !== event.pointerId
                  ) {
                    return;
                  }

                  const deltaX = event.clientX - dragging.startClientX;
                  const deltaY = event.clientY - dragging.startClientY;
                  const nextPoint = clampNodePosition(
                    {
                      x: dragging.startX + deltaX,
                      y: dragging.startY + deltaY,
                    },
                    mapWidth,
                    mapHeight,
                  );

                  setPositions((prev) => {
                    const next = new Map(prev);
                    next.set(idea.id, nextPoint);
                    return next;
                  });

                  if (!dragging.moved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                    clearPendingClick();
                    setDragging((prev) =>
                      prev ? { ...prev, moved: true } : prev,
                    );
                  }
                }}
                onPointerUp={(event) => {
                  if (
                    !canEdit ||
                    !dragging ||
                    dragging.id !== idea.id ||
                    dragging.pointerId !== event.pointerId
                  ) {
                    return;
                  }

                  event.currentTarget.releasePointerCapture(event.pointerId);

                  const deltaX = event.clientX - dragging.startClientX;
                  const deltaY = event.clientY - dragging.startClientY;
                  const nextPoint = clampNodePosition(
                    {
                      x: dragging.startX + deltaX,
                      y: dragging.startY + deltaY,
                    },
                    mapWidth,
                    mapHeight,
                  );

                  setPositions((prev) => {
                    const next = new Map(prev);
                    next.set(idea.id, nextPoint);
                    return next;
                  });

                  const moved = dragging.moved;
                  setDragging(null);

                  if (!moved) {
                    return;
                  }

                  suppressClickRef.current = idea.id;
                  const posX = nextPoint.x - mapCenterX;
                  const posY = nextPoint.y - mapCenterY;
                  startSavePositionTransition(async () => {
                    await saveIdeaPositionAction({
                      brainstormId,
                      id: idea.id,
                      posX: Math.round(posX),
                      posY: Math.round(posY),
                    });
                  });
                }}
                onPointerCancel={() => {
                  if (dragging?.id === idea.id) {
                    setDragging(null);
                  }
                }}
                className={`absolute z-10 max-w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-3 text-center shadow-[0_12px_24px_-18px_rgba(19,33,58,0.45)] border-[#cfdcf4] bg-white hover:bg-[#f6f9ff] ${canEdit ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
                style={{
                  left: node.x,
                  top: node.y,
                  touchAction: canEdit ? "none" : "auto",
                }}
                title={idea.title}
              >
                <p className="text-xs font-semibold text-[#1a2b49]">{trimForBubble(idea.title)}</p>
              </button>
            );
          })}

          {ideas.length === 0 ? (
            <p className="absolute left-1/2 top-[78%] -translate-x-1/2 text-sm text-(--text-muted)">
              Click center bubble to edit it, or double click it to add a child idea.
            </p>
          ) : null}

        </div>
      </div>
    </section>
  );
}
