import { useEffect, useMemo, useReducer, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Grid, Instance, Instances, OrbitControls } from "@react-three/drei";
import type { Vector3 } from "three";
import Button from "../../components/Button";
import { CubeGroup, pivotPosition } from "../../components/VoxelCreature";
import {
  CUBE_SIZE,
  creatureColors,
  headCubes,
  hornCubes,
  legs,
  tail,
  torsoCubes,
  type LegName,
  type VoxelCoord,
} from "../../lib/creatureBody";

// 拋棄式 /dev 工具頁：用滑鼠「堆積木」的方式雕共用怪獸的形狀，取代手動改
// creatureBody.ts 座標陣列來回調整。雕完用下面的「複製座標」貼回
// creatureBody.ts 對應的匯出，這個頁面本身不寫檔、不接 Supabase。
//
// 五個部位（軀幹/頭/角/尾巴/腳樣板）各自的方塊清單、undo 歷史都同時存在記憶體裡
// ——不是只有「目前正在編輯的那個部位」才有資料，其他四個也是各自最新編輯過的
// 版本，只是沒有點擊互動而已。這樣切換部位檢視時，才看得出「已經雕好的部位」
// 彼此搭配起來的樣子，不會切走了就打回原始 creatureBody.ts 的舊樣子。

type PartId = "torso" | "head" | "horn" | "tail" | "leg";

const PARTS: {
  id: PartId;
  label: string;
  color: string;
  origin: VoxelCoord;
}[] = [
  {
    id: "torso",
    label: "軀幹",
    color: creatureColors.torso,
    origin: { x: 0, y: 0, z: 0 },
  },
  {
    id: "head",
    label: "頭",
    color: creatureColors.head,
    origin: { x: 0, y: 0, z: 0 },
  },
  {
    id: "horn",
    label: "角",
    color: creatureColors.horn,
    origin: { x: 0, y: 0, z: 0 },
  },
  { id: "tail", label: "尾巴", color: creatureColors.tail, origin: tail.pivot },
  {
    id: "leg",
    label: "腳（共用樣板）",
    color: creatureColors.leg,
    origin: legs.frontLeft.pivot,
  },
];

const LEG_PIVOTS: [LegName, VoxelCoord][] = [
  ["frontLeft", legs.frontLeft.pivot],
  ["frontRight", legs.frontRight.pivot],
  ["backLeft", legs.backLeft.pivot],
  ["backRight", legs.backRight.pivot],
];

function seedFor(part: PartId): VoxelCoord[] {
  switch (part) {
    case "torso":
      return torsoCubes;
    case "head":
      return headCubes;
    case "horn":
      return hornCubes;
    case "tail":
      return tail.cubes;
    case "leg":
      return legs.frontLeft.cubes;
  }
}

function keyOf(c: VoxelCoord) {
  return `${c.x},${c.y},${c.z}`;
}

function parseKey(key: string): VoxelCoord {
  const [x, y, z] = key.split(",").map(Number);
  return { x, y, z };
}

function mirrorOf(c: VoxelCoord): VoxelCoord {
  return { x: -c.x, y: c.y, z: c.z };
}

const STORAGE_PREFIX = "creature-builder:";
const HISTORY_LIMIT = 100;

function loadPart(part: PartId): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + part);
    if (raw) {
      const parsed = JSON.parse(raw) as VoxelCoord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return new Set(parsed.map(keyOf));
      }
    }
  } catch {
    // localStorage 壞掉或格式不對就退回種子資料
  }
  return new Set(seedFor(part).map(keyOf));
}

interface BuilderState {
  cubesByPart: Record<PartId, Set<string>>;
  pastByPart: Record<PartId, Set<string>[]>;
  futureByPart: Record<PartId, Set<string>[]>;
}

function initBuilderState(): BuilderState {
  const cubesByPart = {} as Record<PartId, Set<string>>;
  const pastByPart = {} as Record<PartId, Set<string>[]>;
  const futureByPart = {} as Record<PartId, Set<string>[]>;
  for (const p of PARTS) {
    cubesByPart[p.id] = loadPart(p.id);
    pastByPart[p.id] = [];
    futureByPart[p.id] = [];
  }
  return { cubesByPart, pastByPart, futureByPart };
}

type Action =
  | { type: "add"; part: PartId; coord: VoxelCoord; mirror: boolean }
  | { type: "remove"; part: PartId; coord: VoxelCoord; mirror: boolean }
  | { type: "undo"; part: PartId }
  | { type: "redo"; part: PartId };

function reducer(state: BuilderState, action: Action): BuilderState {
  const part = action.part;
  const current = state.cubesByPart[part];

  switch (action.type) {
    case "add": {
      const keys = [keyOf(action.coord)];
      if (action.mirror && action.coord.x !== 0)
        keys.push(keyOf(mirrorOf(action.coord)));
      const missing = keys.filter((k) => !current.has(k));
      if (missing.length === 0) return state;
      const next = new Set(current);
      missing.forEach((k) => next.add(k));
      return {
        cubesByPart: { ...state.cubesByPart, [part]: next },
        pastByPart: {
          ...state.pastByPart,
          [part]: [...state.pastByPart[part], current].slice(-HISTORY_LIMIT),
        },
        futureByPart: { ...state.futureByPart, [part]: [] },
      };
    }
    case "remove": {
      // 至少留一顆，保證這個部位永遠有東西可以繼續點擊延伸，不會被清成完全空的
      if (current.size <= 1) return state;
      const keys = [keyOf(action.coord)];
      if (action.mirror && action.coord.x !== 0)
        keys.push(keyOf(mirrorOf(action.coord)));
      const present = keys.filter((k) => current.has(k));
      if (present.length === 0 || present.length >= current.size) return state;
      const next = new Set(current);
      present.forEach((k) => next.delete(k));
      return {
        cubesByPart: { ...state.cubesByPart, [part]: next },
        pastByPart: {
          ...state.pastByPart,
          [part]: [...state.pastByPart[part], current].slice(-HISTORY_LIMIT),
        },
        futureByPart: { ...state.futureByPart, [part]: [] },
      };
    }
    case "undo": {
      const past = state.pastByPart[part];
      if (past.length === 0) return state;
      return {
        cubesByPart: { ...state.cubesByPart, [part]: past[past.length - 1] },
        pastByPart: { ...state.pastByPart, [part]: past.slice(0, -1) },
        futureByPart: {
          ...state.futureByPart,
          [part]: [current, ...state.futureByPart[part]],
        },
      };
    }
    case "redo": {
      const future = state.futureByPart[part];
      if (future.length === 0) return state;
      return {
        cubesByPart: { ...state.cubesByPart, [part]: future[0] },
        pastByPart: {
          ...state.pastByPart,
          [part]: [...state.pastByPart[part], current].slice(-HISTORY_LIMIT),
        },
        futureByPart: { ...state.futureByPart, [part]: future.slice(1) },
      };
    }
  }
}

// 把 raycast 打到的面法向量吸附到最近的軸方向：我們的方塊都是軸對齊的，
// 新方塊只會長在 ±x/±y/±z 六個方向之一。
function snapDirection(worldNormal: Vector3): VoxelCoord {
  const ax = Math.abs(worldNormal.x);
  const ay = Math.abs(worldNormal.y);
  const az = Math.abs(worldNormal.z);
  if (ax >= ay && ax >= az) return { x: Math.sign(worldNormal.x), y: 0, z: 0 };
  if (ay >= ax && ay >= az) return { x: 0, y: Math.sign(worldNormal.y), z: 0 };
  return { x: 0, y: 0, z: Math.sign(worldNormal.z) };
}

// drei 的 <Instances> 用 limit 在掛載當下配置底層 buffer、之後不會再變動；range
// 才是每幀都會重讀的動態值。這裡的 cubes 會隨新增/刪除即時變動，limit 一定要用
// 固定值，不能綁 cubes.length，不然格數一變 buffer 容量就對不上，畫面會整組消失。
const INSTANCE_LIMIT = 1024;

function InteractiveCubeGroup({
  cubes,
  color,
  mode,
  onAdd,
  onRemove,
  onHover,
}: {
  cubes: VoxelCoord[];
  color: string;
  mode: "add" | "remove";
  onAdd: (coord: VoxelCoord) => void;
  onRemove: (coord: VoxelCoord) => void;
  onHover: (coord: VoxelCoord | null) => void;
}) {
  return (
    <Instances limit={INSTANCE_LIMIT} range={cubes.length}>
      <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
      <meshStandardMaterial />
      {cubes.map((c) => (
        <Instance
          key={keyOf(c)}
          position={[c.x * CUBE_SIZE, c.y * CUBE_SIZE, c.z * CUBE_SIZE]}
          color={mode === "remove" ? "#c0392b" : color}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (mode === "remove") {
              onRemove(c);
              return;
            }
            if (!e.face) return;
            const worldNormal = e.face.normal
              .clone()
              .transformDirection(e.object.matrixWorld);
            const dir = snapDirection(worldNormal);
            onAdd({ x: c.x + dir.x, y: c.y + dir.y, z: c.z + dir.z });
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (mode !== "add" || !e.face) {
              onHover(null);
              return;
            }
            const worldNormal = e.face.normal
              .clone()
              .transformDirection(e.object.matrixWorld);
            const dir = snapDirection(worldNormal);
            onHover({ x: c.x + dir.x, y: c.y + dir.y, z: c.z + dir.z });
          }}
          onPointerOut={() => onHover(null)}
        />
      ))}
    </Instances>
  );
}

function PartSlot({
  origin,
  cubes,
  color,
  interactive,
  mode,
  onAdd,
  onRemove,
  onHover,
  hover,
}: {
  origin: VoxelCoord;
  cubes: VoxelCoord[];
  color: string;
  interactive: boolean;
  mode: "add" | "remove";
  onAdd: (c: VoxelCoord) => void;
  onRemove: (c: VoxelCoord) => void;
  onHover: (c: VoxelCoord | null) => void;
  hover: VoxelCoord | null;
}) {
  return (
    <group position={pivotPosition(origin)}>
      {interactive ? (
        <InteractiveCubeGroup
          cubes={cubes}
          color={color}
          mode={mode}
          onAdd={onAdd}
          onRemove={onRemove}
          onHover={onHover}
        />
      ) : (
        <CubeGroup cubes={cubes} color={color} />
      )}
      {interactive && hover && (
        <mesh
          position={[
            hover.x * CUBE_SIZE,
            hover.y * CUBE_SIZE,
            hover.z * CUBE_SIZE,
          ]}
        >
          <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
          <meshStandardMaterial color="#4fd1c5" transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

function BuilderScene({
  part,
  cubesByPart,
  mode,
  onAdd,
  onRemove,
}: {
  part: PartId;
  cubesByPart: Record<PartId, VoxelCoord[]>;
  mode: "add" | "remove";
  onAdd: (c: VoxelCoord) => void;
  onRemove: (c: VoxelCoord) => void;
}) {
  const [hover, setHover] = useState<VoxelCoord | null>(null);
  // 切換部位/模式時舊的預覽方塊沒意義了，避免殘留一顆對不上的鬼影
  useEffect(() => setHover(null), [part, mode]);

  return (
    <>
      <PartSlot
        origin={{ x: 0, y: 0, z: 0 }}
        cubes={cubesByPart.torso}
        color={creatureColors.torso}
        interactive={part === "torso"}
        mode={mode}
        onAdd={onAdd}
        onRemove={onRemove}
        onHover={setHover}
        hover={hover}
      />
      <PartSlot
        origin={{ x: 0, y: 0, z: 0 }}
        cubes={cubesByPart.head}
        color={creatureColors.head}
        interactive={part === "head"}
        mode={mode}
        onAdd={onAdd}
        onRemove={onRemove}
        onHover={setHover}
        hover={hover}
      />
      <PartSlot
        origin={{ x: 0, y: 0, z: 0 }}
        cubes={cubesByPart.horn}
        color={creatureColors.horn}
        interactive={part === "horn"}
        mode={mode}
        onAdd={onAdd}
        onRemove={onRemove}
        onHover={setHover}
        hover={hover}
      />
      <PartSlot
        origin={tail.pivot}
        cubes={cubesByPart.tail}
        color={creatureColors.tail}
        interactive={part === "tail"}
        mode={mode}
        onAdd={onAdd}
        onRemove={onRemove}
        onHover={setHover}
        hover={hover}
      />
      {LEG_PIVOTS.map(([name, pivot], i) => (
        <PartSlot
          key={name}
          origin={pivot}
          cubes={cubesByPart.leg}
          color={creatureColors.leg}
          interactive={part === "leg" && i === 0}
          mode={mode}
          onAdd={onAdd}
          onRemove={onRemove}
          onHover={setHover}
          hover={hover}
        />
      ))}
    </>
  );
}

function formatExport(cubes: VoxelCoord[]): string {
  const sorted = [...cubes].sort((a, b) => a.x - b.x || a.y - b.y || a.z - b.z);
  return `[\n${sorted.map((c) => `  { x: ${c.x}, y: ${c.y}, z: ${c.z} },`).join("\n")}\n]`;
}

export default function CreatureBuilder() {
  const [part, setPart] = useState<PartId>("torso");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [mirror, setMirror] = useState(true);
  const [copied, setCopied] = useState(false);
  const [state, dispatch] = useReducer(reducer, undefined, initBuilderState);

  const cubesByPart = useMemo(() => {
    const result = {} as Record<PartId, VoxelCoord[]>;
    for (const p of PARTS) {
      result[p.id] = Array.from(state.cubesByPart[p.id], parseKey);
    }
    return result;
  }, [state.cubesByPart]);

  const activePart = PARTS.find((p) => p.id === part)!;
  const activeCubes = cubesByPart[part];
  const mirrorApplies = part !== "leg";
  const past = state.pastByPart[part];
  const future = state.futureByPart[part];

  // 每次改動都把全部部位存一份，重整頁面不會弄丟雕到一半的東西
  useEffect(() => {
    for (const p of PARTS) {
      window.localStorage.setItem(
        STORAGE_PREFIX + p.id,
        JSON.stringify(cubesByPart[p.id]),
      );
    }
  }, [cubesByPart]);

  useEffect(() => {
    setCopied(false);
  }, [part, activeCubes]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo", part });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [part]);

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h1 className="text-2xl font-bold">怪獸建模工具</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          點方塊的某一面朝那個方向長出新方塊；「刪除」模式點方塊移除。切換部位不會蓋掉其他部位已經雕好的樣子，可以互相搭配著看。雕好用下面的「複製座標」貼回{" "}
          <code>creatureBody.ts</code>。
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {PARTS.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={part === p.id ? "primary" : "ghost"}
            onClick={() => setPart(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "add" ? "primary" : "ghost"}
            onClick={() => setMode("add")}
          >
            新增
          </Button>
          <Button
            size="sm"
            variant={mode === "remove" ? "danger" : "ghost"}
            onClick={() => setMode("remove")}
          >
            刪除
          </Button>
        </div>

        <label
          className={`flex items-center gap-2 text-sm ${mirrorApplies ? "" : "opacity-40"}`}
          title={
            mirrorApplies
              ? undefined
              : "腳已經靠樞軸系統自動鏡射到四個角落，這個開關對腳沒有效果"
          }
        >
          <input
            type="checkbox"
            checked={mirror}
            disabled={!mirrorApplies}
            onChange={(e) => setMirror(e.target.checked)}
          />
          左右鏡射
        </label>

        <Button
          size="sm"
          variant="ghost"
          disabled={past.length === 0}
          onClick={() => dispatch({ type: "undo", part })}
        >
          上一步
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={future.length === 0}
          onClick={() => dispatch({ type: "redo", part })}
        >
          下一步
        </Button>

        <span className="text-sm text-[var(--color-text-muted)]">
          目前「{activePart.label}」{activeCubes.length} 格
        </span>
      </div>

      <div className="h-[60vh] w-full overflow-hidden rounded-md border border-[var(--color-border)]">
        <Canvas camera={{ position: [2.4, 1.9, 3.6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 2]} intensity={1.2} />
          <BuilderScene
            part={part}
            cubesByPart={cubesByPart}
            mode={mode}
            onAdd={(c) =>
              dispatch({
                type: "add",
                part,
                coord: c,
                mirror: mirrorApplies && mirror,
              })
            }
            onRemove={(c) =>
              dispatch({
                type: "remove",
                part,
                coord: c,
                mirror: mirrorApplies && mirror,
              })
            }
          />
          <Grid
            args={[10, 10]}
            cellColor="#8a8a8a"
            sectionColor="#4a4a4a"
            fadeDistance={12}
            infiniteGrid
          />
          <OrbitControls target={[0, 0.8, 0]} makeDefault />
        </Canvas>
      </div>

      <section>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">匯出「{activePart.label}」座標</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(formatExport(activeCubes));
              setCopied(true);
            }}
          >
            {copied ? "已複製！" : "複製座標"}
          </Button>
        </div>
        <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs">
          {formatExport(activeCubes)}
        </pre>
      </section>
    </div>
  );
}
