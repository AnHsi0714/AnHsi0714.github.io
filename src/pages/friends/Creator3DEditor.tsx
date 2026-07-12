import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Grid, Instance, Instances, OrbitControls } from "@react-three/drei";
import { MOUSE } from "three";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import { pivotPosition } from "../../components/VoxelCreature";
import { CUBE_SIZE, REGIONS, type VoxelCoord, type VoxelRegion } from "../../lib/creatureBody";
import type { VoxelCreatureData } from "../../types/friends";

const DEFAULT_COLOR = "#33dbdb";
const HISTORY_LIMIT = 100;
const UNPAINTED_COLOR = "#d9d3c8";
// drei 的 <Instances> limit 只在掛載當下配置 buffer、不是 reactive 的，range 才是
// 每幀動態讀的值——這裡固定用夠大的值，不能綁塗色格數（CreatureBuilder.tsx 踩過這
// 個坑：格數一變 buffer 容量對不上，畫面會整組消失）。
const INSTANCE_LIMIT = 1024;

type Tool = "paint" | "erase";
type ColorMap = Map<string, string>; // key = "region,x,y,z"

function keyOf(region: VoxelRegion, c: VoxelCoord) {
  return `${region},${c.x},${c.y},${c.z}`;
}

function toVoxelCreatureData(colors: ColorMap): VoxelCreatureData {
  return {
    colors: [...colors].map(([key, color]) => {
      const [region, x, y, z] = key.split(",");
      return {
        region: region as VoxelRegion,
        x: Number(x),
        y: Number(y),
        z: Number(z),
        color,
      };
    }),
  };
}

function fromVoxelCreatureData(data: VoxelCreatureData): ColorMap {
  return new Map(data.colors.map((p) => [keyOf(p.region, p), p.color]));
}

// 跟 Creator2DEditor.tsx 的 editorReducer 同一個精神：一次拖曳塗色算一步（stroke-
// batched undo），只是這裡沒有油漆桶，只有上色／清除兩種操作。
interface EditorState {
  colors: ColorMap;
  past: ColorMap[];
  future: ColorMap[];
  strokeOpen: boolean;
}

type EditorAction =
  | { type: "paintCell"; key: string; color: string | null } // null = 清除
  | { type: "endStroke" }
  | { type: "clear" }
  | { type: "undo" }
  | { type: "redo" };

const emptyEditorState: EditorState = {
  colors: new Map(),
  past: [],
  future: [],
  strokeOpen: false,
};

function withHistory(state: EditorState, colors: ColorMap): EditorState {
  return {
    colors,
    past: [...state.past, state.colors].slice(-HISTORY_LIMIT),
    future: [],
    strokeOpen: false,
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "paintCell": {
      const { key, color } = action;
      if (
        color === null
          ? !state.colors.has(key)
          : state.colors.get(key) === color
      ) {
        return state;
      }
      const colors = new Map(state.colors);
      if (color === null) colors.delete(key);
      else colors.set(key, color);
      return {
        colors,
        past: state.strokeOpen
          ? state.past
          : [...state.past, state.colors].slice(-HISTORY_LIMIT),
        future: [],
        strokeOpen: true,
      };
    }
    case "endStroke":
      return state.strokeOpen ? { ...state, strokeOpen: false } : state;
    case "clear":
      return state.colors.size > 0 ? withHistory(state, new Map()) : state;
    case "undo": {
      if (state.past.length === 0) return state;
      return {
        colors: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [state.colors, ...state.future],
        strokeOpen: false,
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [colors, ...future] = state.future;
      return {
        colors,
        past: [...state.past, state.colors].slice(-HISTORY_LIMIT),
        future,
        strokeOpen: false,
      };
    }
  }
}

function PaintableRegion({
  region,
  colors,
  isPaintingRef,
  onPaint,
}: {
  region: (typeof REGIONS)[number];
  colors: ColorMap;
  isPaintingRef: React.RefObject<boolean>;
  onPaint: (key: string) => void;
}) {
  return (
    <group position={pivotPosition(region.origin)}>
      <Instances limit={INSTANCE_LIMIT} range={region.cubes.length}>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshStandardMaterial />
        {region.cubes.map((c) => {
          const key = keyOf(region.id, c);
          return (
            <Instance
              key={key}
              position={[c.x * CUBE_SIZE, c.y * CUBE_SIZE, c.z * CUBE_SIZE]}
              color={colors.get(key) ?? UNPAINTED_COLOR}
              onPointerDown={(e: ThreeEvent<PointerEvent>) => {
                // 只認左鍵：OrbitControls 已經把右鍵讓給轉視角，這裡不能連右鍵也塗色
                if (e.button !== 0) return;
                e.stopPropagation();
                isPaintingRef.current = true;
                onPaint(key);
              }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                if (isPaintingRef.current) onPaint(key);
              }}
            />
          );
        })}
      </Instances>
    </group>
  );
}

export interface Creator3DEditorProps {
  identity: { code: string; nickname: string };
  mode: "create" | "edit";
  initialData: VoxelCreatureData | null;
  initialIntro: string;
  onSubmit: (vars: {
    code: string;
    nickname: string;
    data: VoxelCreatureData;
    intro?: string;
  }) => void;
  submitting: boolean;
  submitError: string | null;
}

export default function Creator3DEditor({
  identity,
  mode,
  initialData,
  initialIntro,
  onSubmit,
  submitting,
  submitError,
}: Creator3DEditorProps) {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [tool, setTool] = useState<Tool>("paint");
  const [intro, setIntro] = useState(initialIntro);
  const [editor, dispatchEditor] = useReducer(
    editorReducer,
    initialData,
    (data): EditorState => ({
      ...emptyEditorState,
      colors: data ? fromVoxelCreatureData(data) : new Map(),
    }),
  );
  const { colors, past, future } = editor;
  const isPaintingRef = useRef(false);

  const voxelData = useMemo(() => toVoxelCreatureData(colors), [colors]);

  // 拖曳塗色：pointerdown 在方塊上開始畫，滑到別的方塊上（onPointerOver）持續畫，
  // 放開滑鼠（不管放在哪裡）就收筆——跟 Creator2DEditor 的 strokeAt/paintingRef
  // 同一個模式，只是這裡用 window 層級的 pointerup 收尾，因為拖過去的方塊不一定
  // 是同一個 <Instance>，沒辦法靠單一元素的 onPointerUp/setPointerCapture 收筆。
  useEffect(() => {
    const onPointerUp = () => {
      if (!isPaintingRef.current) return;
      isPaintingRef.current = false;
      dispatchEditor({ type: "endStroke" });
    };
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  useEffect(() => {
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
  }, []);

  const handlePaint = (key: string) => {
    dispatchEditor({ type: "paintCell", key, color: tool === "erase" ? null : color });
  };

  return (
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
          上色
        </Button>
        <Button
          size="sm"
          variant={tool === "erase" ? "primary" : "ghost"}
          onClick={() => setTool("erase")}
        >
          清除
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
          disabled={colors.size === 0}
          onClick={() => dispatchEditor({ type: "clear" })}
        >
          清空
        </Button>
      </div>

      <p className="text-sm text-[var(--color-text-muted)]">
        左鍵拖曳塗色，右鍵拖曳轉視角，滾輪縮放。
      </p>

      <div className="h-[60vh] w-full overflow-hidden rounded-md border border-[var(--color-border)]">
        <Canvas camera={{ position: [2.4, 1.9, 3.6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 2]} intensity={1.2} />
          {REGIONS.map((region) => (
            <PaintableRegion
              key={region.id}
              region={region}
              colors={colors}
              isPaintingRef={isPaintingRef}
              onPaint={handlePaint}
            />
          ))}
          <Grid args={[10, 10]} cellColor="#8a8a8a" sectionColor="#4a4a4a" fadeDistance={12} infiniteGrid />
          {/* 左鍵讓給塗色拖曳，只有右鍵轉視角、中鍵（滾輪）縮放：不指定 LEFT，
              three.js 內部對應不到任何動作就等於停用，不用特地塞 null（型別上也不收 null） */}
          <OrbitControls
            target={[0, 0.8, 0]}
            mouseButtons={{ MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }}
            makeDefault
          />
        </Canvas>
      </div>

      <label className="w-full max-w-[480px] text-sm">
        <span className="mb-1 block text-[var(--color-text-muted)]">
          作品、個人敘述 or 其他（選填，別人點開你的作品時會顯示，嚴禁不當內容）
        </span>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="想對看到這隻怪獸的人說的話"
          className="w-full resize-none rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
        />
        <span className="mt-1 block text-right text-xs text-[var(--color-text-muted)]">
          {intro.length}/200
        </span>
      </label>

      {submitError && (
        <Alert variant="error" className="w-full max-w-[480px]">
          送出失敗：{submitError}
        </Alert>
      )}

      <Button
        size="lg"
        disabled={colors.size === 0 || submitting}
        onClick={() => {
          onSubmit({
            code: identity.code,
            nickname: identity.nickname,
            data: voxelData,
            intro: intro.trim() || undefined,
          });
        }}
      >
        {submitting ? "送出中…" : mode === "edit" ? "更新作品" : "送出作品"}
      </Button>
    </div>
  );
}
