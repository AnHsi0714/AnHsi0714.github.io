import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import PixelCanvas from "../../components/PixelCanvas";
import { redeemInviteAndCreate } from "../../lib/friends";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import type { PixelData } from "../../types/friends";
import InviteGate from "./InviteGate";

const GRID_OPTIONS = [16, 32] as const;
const CELL_PX = 20; // 編輯畫布的內部解析度（每格 px），CSS 再縮放成響應式
const DEFAULT_COLOR = "#33dbdb";

type Tool = "paint" | "erase";

// 編輯中用 Map<"x,y", color> 方便增刪，送出時才轉成稀疏陣列格式
function toPixelData(grid: number, pixels: Map<string, string>): PixelData {
  return {
    grid,
    pixels: [...pixels].map(([key, color]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y, color };
    }),
  };
}

function EditorCanvas({
  grid,
  pixels,
  color,
  tool,
  onPixelsChange,
}: {
  grid: number;
  pixels: Map<string, string>;
  color: string;
  tool: Tool;
  onPixelsChange: (next: Map<string, string>) => void;
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
          (x + y) % 2 === 0 ? "rgba(127,127,127,0.06)" : "rgba(127,127,127,0.14)";
        ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX);
      }
    }
    for (const [key, pixelColor] of pixels) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = pixelColor;
      ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX);
    }
  }, [grid, pixels]);

  const applyTool = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * grid);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * grid);
    if (x < 0 || y < 0 || x >= grid || y >= grid) return;

    const key = `${x},${y}`;
    if (tool === "erase") {
      if (!pixels.has(key)) return;
      const next = new Map(pixels);
      next.delete(key);
      onPixelsChange(next);
    } else {
      if (pixels.get(key) === color) return;
      const next = new Map(pixels);
      next.set(key, color);
      onPixelsChange(next);
    }
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
        e.currentTarget.setPointerCapture(e.pointerId);
        paintingRef.current = true;
        applyTool(e);
      }}
      onPointerMove={(e) => {
        if (paintingRef.current) applyTool(e);
      }}
      onPointerUp={() => {
        paintingRef.current = false;
      }}
      onPointerCancel={() => {
        paintingRef.current = false;
      }}
    />
  );
}

export default function Creator2D() {
  // gate → 選網格 → 作畫；identity 存下來後可回頭改，不會弄丟畫到一半的圖
  const [identity, setIdentity] = useState<{
    code: string;
    nickname: string;
  } | null>(null);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [grid, setGrid] = useState<number | null>(null);
  const [pixels, setPixels] = useState<Map<string, string>>(new Map());
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [tool, setTool] = useState<Tool>("paint");

  const mutation = useMutation({ mutationFn: redeemInviteAndCreate });

  const pixelData = useMemo(
    () => (grid ? toPixelData(grid, pixels) : null),
    [grid, pixels],
  );

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
        <h1 className="text-2xl font-bold">作品已送出！</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          謝謝你，{mutation.data.nickname}，你的作品已經掛上創作牆了。
        </p>
        <PixelCanvas
          data={mutation.data.data}
          className="mt-6 h-48 w-48 rounded-md border border-[var(--color-border)]"
        />
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
          輸入邀請碼和暱稱就能開始作畫。邀請碼是否有效會在送出作品時檢查。
        </p>
        <InviteGate
          initialCode={identity?.code}
          initialNickname={identity?.nickname}
          onSubmit={(code, nickname) => {
            setIdentity({ code, nickname });
            setEditingIdentity(false);
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
              variant={tool === "erase" ? "primary" : "ghost"}
              onClick={() => setTool("erase")}
            >
              橡皮擦
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={pixels.size === 0}
              onClick={() => setPixels(new Map())}
            >
              清空
            </Button>
          </div>

          <EditorCanvas
            grid={grid}
            pixels={pixels}
            color={color}
            tool={tool}
            onPixelsChange={setPixels}
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
              });
            }}
          >
            {mutation.isPending ? "送出中…" : "送出作品"}
          </Button>
        </div>
      )}
    </section>
  );
}