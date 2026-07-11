import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import PixelCanvas from "../../components/PixelCanvas";
import {
  checkInviteCode,
  redeemInviteAndCreate,
  updateCreationWithCode,
} from "../../lib/friends";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import type { PixelData } from "../../types/friends";
import InviteGate from "./InviteGate";

const GRID_OPTIONS = [16, 32] as const;
const CELL_PX = 20; // 編輯畫布的內部解析度（每格 px），CSS 再縮放成響應式
const DEFAULT_COLOR = "#33dbdb";
const HISTORY_LIMIT = 100;

type Tool = "paint" | "fill" | "erase";
type PixelMap = Map<string, string>;

// 編輯中用 Map<"x,y", color> 方便增刪，送出時才轉成 §7 的稀疏陣列格式
function toPixelData(grid: number, pixels: PixelMap): PixelData {
  return {
    grid,
    pixels: [...pixels].map(([key, color]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y, color };
    }),
  };
}

function fromPixelData(data: PixelData): PixelMap {
  return new Map(data.pixels.map((p) => [`${p.x},${p.y}`, p.color]));
}

// 油漆桶：把點擊格所在的同色（含空白）連通區域整片換成新色；沒有變化時回傳 null
function floodFill(
  pixels: PixelMap,
  grid: number,
  startX: number,
  startY: number,
  color: string,
): PixelMap | null {
  const target = pixels.get(`${startX},${startY}`);
  if (target === color) return null;

  const next = new Map(pixels);
  const stack: [number, number][] = [[startX, startY]];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || y < 0 || x >= grid || y >= grid) continue;
    const key = `${x},${y}`;
    if (seen.has(key) || pixels.get(key) !== target) continue;
    seen.add(key);
    next.set(key, color);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return next;
}

// undo/redo 以「一筆畫」為單位：pointerdown 到 pointerup 的整段拖曳算一步，
// 油漆桶／清空各算一步。strokeOpen 標記這筆畫是否已存過起點快照。
interface EditorState {
  pixels: PixelMap;
  past: PixelMap[];
  future: PixelMap[];
  strokeOpen: boolean;
}

type EditorAction =
  | { type: "strokeCell"; key: string; color: string | null } // null = 橡皮擦
  | { type: "endStroke" }
  | { type: "fill"; x: number; y: number; color: string; grid: number }
  | { type: "clear" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "load"; pixels: PixelMap };

const emptyEditorState: EditorState = {
  pixels: new Map(),
  past: [],
  future: [],
  strokeOpen: false,
};

function withHistory(state: EditorState, pixels: PixelMap): EditorState {
  return {
    pixels,
    past: [...state.past, state.pixels].slice(-HISTORY_LIMIT),
    future: [],
    strokeOpen: false,
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "strokeCell": {
      const { key, color } = action;
      if (
        color === null
          ? !state.pixels.has(key)
          : state.pixels.get(key) === color
      ) {
        return state;
      }
      const pixels = new Map(state.pixels);
      if (color === null) pixels.delete(key);
      else pixels.set(key, color);
      return {
        pixels,
        // 同一筆畫只在第一次真的改到格子時存一次快照
        past: state.strokeOpen
          ? state.past
          : [...state.past, state.pixels].slice(-HISTORY_LIMIT),
        future: [],
        strokeOpen: true,
      };
    }
    case "endStroke":
      return state.strokeOpen ? { ...state, strokeOpen: false } : state;
    case "fill": {
      const next = floodFill(
        state.pixels,
        action.grid,
        action.x,
        action.y,
        action.color,
      );
      return next ? withHistory(state, next) : state;
    }
    case "clear":
      return state.pixels.size > 0 ? withHistory(state, new Map()) : state;
    case "undo": {
      if (state.past.length === 0) return state;
      return {
        pixels: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [state.pixels, ...state.future],
        strokeOpen: false,
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [pixels, ...future] = state.future;
      return {
        pixels,
        past: [...state.past, state.pixels].slice(-HISTORY_LIMIT),
        future,
        strokeOpen: false,
      };
    }
    case "load":
      return { ...emptyEditorState, pixels: action.pixels };
  }
}

function EditorCanvas({
  grid,
  pixels,
  color,
  tool,
  dispatch,
}: {
  grid: number;
  pixels: PixelMap;
  color: string;
  tool: Tool;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintingRef = useRef(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, grid * CELL_PX, grid * CELL_PX);
    // 棋盤格底：標出格子邊界、同時暗示「沒畫的格子是透明的」，深淺主題都吃半透明灰
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        ctx.fillStyle =
          (x + y) % 2 === 0
            ? "rgba(127,127,127,0.06)"
            : "rgba(127,127,127,0.14)";
        ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX);
      }
    }
    for (const [key, pixelColor] of pixels) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = pixelColor;
      ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX);
    }
  }, [grid, pixels]);

  const cellFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * grid);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * grid);
    if (x < 0 || y < 0 || x >= grid || y >= grid) return null;
    return { x, y };
  };

  const strokeAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cell = cellFromEvent(e);
    if (!cell) return;
    dispatch({
      type: "strokeCell",
      key: `${cell.x},${cell.y}`,
      color: tool === "erase" ? null : color,
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={grid * CELL_PX}
      height={grid * CELL_PX}
      // touch-action: none 讓觸控拖曳作畫時不會觸發頁面捲動
      className="w-full max-w-[480px] cursor-crosshair touch-none rounded-md border border-[var(--color-border)]"
      style={{ imageRendering: "pixelated" }}
      onPointerDown={(e) => {
        if (tool === "fill") {
          const cell = cellFromEvent(e);
          if (cell) dispatch({ type: "fill", ...cell, color, grid });
          return;
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        paintingRef.current = true;
        strokeAt(e);
      }}
      onPointerMove={(e) => {
        if (paintingRef.current) strokeAt(e);
      }}
      onPointerUp={() => {
        paintingRef.current = false;
        dispatch({ type: "endStroke" });
      }}
      onPointerCancel={() => {
        paintingRef.current = false;
        dispatch({ type: "endStroke" });
      }}
    />
  );
}

export default function Creator2D() {
  // gate（檢查邀請碼）→ 選網格（僅新作品）→ 作畫；identity 存下來後可回頭改，
  // 不會弄丟畫到一半的圖。已用過的碼在 gate 就載入原作品進入編輯模式。
  const [identity, setIdentity] = useState<{
    code: string;
    nickname: string;
  } | null>(null);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [grid, setGrid] = useState<number | null>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [tool, setTool] = useState<Tool>("paint");
  const [intro, setIntro] = useState("");
  const [editor, dispatchEditor] = useReducer(editorReducer, emptyEditorState);
  const { pixels, past, future } = editor;

  const mutation = useMutation({
    mutationFn: (vars: {
      code: string;
      nickname: string;
      data: PixelData;
      intro?: string;
    }) =>
      mode === "edit"
        ? updateCreationWithCode(vars)
        : redeemInviteAndCreate(vars),
  });

  const pixelData = useMemo(
    () => (grid ? toPixelData(grid, pixels) : null),
    [grid, pixels],
  );

  const inEditor = identity !== null && !editingIdentity && grid !== null;

  // Ctrl/Cmd+Z 上一步、Ctrl+Shift+Z / Ctrl+Y 下一步（只在編輯畫布時攔截）
  useEffect(() => {
    if (!inEditor) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        dispatchEditor({ type: e.shiftKey ? "redo" : "undo" });
      } else if (key === "y") {
        e.preventDefault();
        dispatchEditor({ type: "redo" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inEditor]);

  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-bold">畫一張像素圖</h1>
        <Alert variant="info" className="mt-6">
          後端尚未設定（缺 Supabase 環境變數），暫時無法提交作品。
        </Alert>
      </section>
    );
  }

  if (mutation.isSuccess) {
    return (
      <section className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold">
          {mode === "edit" ? "作品已更新！" : "作品已送出！"}
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          謝謝你，{mutation.data.nickname}，
          {mode === "edit"
            ? "創作牆上的作品已經換成新的這張了。"
            : "你的作品已經掛上創作牆了。"}
        </p>
        <PixelCanvas
          data={mutation.data.data}
          className="mt-6 h-48 w-48 rounded-md border border-[var(--color-border)]"
        />
        {mutation.data.intro && (
          <p className="mt-4 max-w-md text-sm text-[var(--color-text-muted)]">
            「{mutation.data.intro}」
          </p>
        )}
        <Link to="/friends" className="mt-6">
          <Button>去創作牆看看</Button>
        </Link>
      </section>
    );
  }

  if (!identity || editingIdentity) {
    return (
      <section>
        <h1 className="text-2xl font-bold">畫一張像素圖</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          輸入邀請碼和暱稱就能開始作畫；已經用過的邀請碼可以重新編輯之前的作品。
        </p>
        <InviteGate
          initialCode={identity?.code}
          initialNickname={identity?.nickname}
          onSubmit={async (code, nickname) => {
            const result = await checkInviteCode(code);
            if (result.status === "invalid") return "邀請碼無效或已過期";
            setIdentity({ code, nickname });
            setEditingIdentity(false);
            if (result.status === "used") {
              setMode("edit");
              // 只在還沒開始作畫時載入原作品，避免中途改邀請碼把畫到一半的圖蓋掉
              if (grid === null) {
                setGrid(result.creation.data.grid);
                setIntro(result.creation.intro ?? "");
                dispatchEditor({
                  type: "load",
                  pixels: fromPixelData(result.creation.data),
                });
              }
            } else {
              setMode("create");
            }
            return null;
          }}
        />
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">畫一張像素圖</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        以「{identity.nickname}」的名義創作。
        <button
          type="button"
          onClick={() => setEditingIdentity(true)}
          className="ml-2 underline hover:text-[var(--color-text)]"
        >
          修改邀請碼／暱稱
        </button>
      </p>

      {mode === "edit" && (
        <Alert variant="info" className="mt-4">
          這個邀請碼已經用過，現在是編輯模式——送出後會覆蓋你原本的作品。
        </Alert>
      )}

      {grid === null ? (
        <div className="mt-8 flex flex-col items-center gap-4">
          <p>選一個畫布尺寸（開始作畫後就不能改囉）</p>
          <div className="flex gap-4">
            {GRID_OPTIONS.map((option) => (
              <Button
                key={option}
                variant="secondary"
                size="lg"
                onClick={() => setGrid(option)}
              >
                {option} × {option}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              顏色
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-[var(--color-border)] bg-transparent"
              />
            </label>
            <Button
              size="sm"
              variant={tool === "paint" ? "primary" : "ghost"}
              onClick={() => setTool("paint")}
            >
              畫筆
            </Button>
            <Button
              size="sm"
              variant={tool === "fill" ? "primary" : "ghost"}
              onClick={() => setTool("fill")}
            >
              油漆桶
            </Button>
            <Button
              size="sm"
              variant={tool === "erase" ? "primary" : "ghost"}
              onClick={() => setTool("erase")}
            >
              橡皮擦
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={past.length === 0}
              onClick={() => dispatchEditor({ type: "undo" })}
            >
              上一步
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={future.length === 0}
              onClick={() => dispatchEditor({ type: "redo" })}
            >
              下一步
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={pixels.size === 0}
              onClick={() => dispatchEditor({ type: "clear" })}
            >
              清空
            </Button>
          </div>

          <EditorCanvas
            grid={grid}
            pixels={pixels}
            color={color}
            tool={tool}
            dispatch={dispatchEditor}
          />

          {pixelData && pixels.size > 0 && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
              縮圖預覽
              <PixelCanvas
                data={pixelData}
                className="h-16 w-16 rounded border border-[var(--color-border)]"
              />
            </div>
          )}

          <label className="w-full max-w-[480px] text-sm">
            <span className="mb-1 block text-[var(--color-text-muted)]">
              作品、個人敘述 or
              其他（選填，別人點開你的作品時會顯示，嚴禁不當內容）
            </span>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="想對看到這張圖的人說的話"
              className="w-full resize-none rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
            />
            <span className="mt-1 block text-right text-xs text-[var(--color-text-muted)]">
              {intro.length}/200
            </span>
          </label>

          {mutation.isError && (
            <Alert variant="error" className="w-full max-w-[480px]">
              送出失敗：{mutation.error.message}
            </Alert>
          )}

          <Button
            size="lg"
            disabled={pixels.size === 0 || mutation.isPending}
            onClick={() => {
              if (!pixelData) return;
              mutation.mutate({
                code: identity.code,
                nickname: identity.nickname,
                data: pixelData,
                intro: intro.trim() || undefined,
              });
            }}
          >
            {mutation.isPending
              ? "送出中…"
              : mode === "edit"
                ? "更新作品"
                : "送出作品"}
          </Button>
        </div>
      )}
    </section>
  );
}
