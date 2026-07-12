import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import type { Group } from "three";
import {
  CUBE_SIZE,
  bodyGroundOffset,
  creatureColors,
  headCubes,
  hornCubes,
  legs,
  tail,
  torsoCubes,
  trotPairs,
  type LegName,
  type PivotPart,
  type VoxelCoord,
} from "../lib/creatureBody";

// 對角步態（trot）：兩組腳互為反相位；前後踱步／搖尾的頻率、幅度都是拋棄式 demo
// 常數，純粹讓走路動畫看起來「像在走」，不追求精準的物理或 IK。
const WALK_SPEED = 4;
const SWING_AMPLITUDE = Math.PI / 5;
const TAIL_SWING_SPEED = 1.5;
const TAIL_SWING_AMPLITUDE = Math.PI / 10;
const PACE_RADIUS = 1.4;
const PACE_SPEED = 0.3;

// drei 的 <Instances> 用 limit 在「掛載當下」配置底層 buffer 大小，之後就固定了——
// limit 本身不是 reactive 的，只有 range 每幀都會重讀。如果把 limit 綁到會變動的
// cubes.length（CreatureBuilder.tsx 動態新增/刪除方塊時就是這樣），buffer 大小停在
// 第一次掛載時的格數，之後每次格數變動、count 超出實際 buffer 容量就會整組畫不出來，
// 直到父層元件型別改變、Instances 整個重新掛載（例如切換部位）buffer 才會重配、畫面才回來。
// 用固定夠大的 limit（不隨 cubes 變動）＋動態 range 才是正確用法。
const INSTANCE_LIMIT = 1024;

// 匯出給 CreatureBuilder.tsx 重用：靜態（不可點擊）渲染一組方塊，作為雕刻中
// 其他部位的比例參考。
export function CubeGroup({ cubes, color }: { cubes: VoxelCoord[]; color: string }) {
  return (
    <Instances limit={INSTANCE_LIMIT} range={cubes.length}>
      <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
      <meshStandardMaterial />
      {cubes.map((c, i) => (
        <Instance
          key={i}
          position={[c.x * CUBE_SIZE, c.y * CUBE_SIZE, c.z * CUBE_SIZE]}
          color={color}
        />
      ))}
    </Instances>
  );
}

export function pivotPosition(pivot: VoxelCoord): [number, number, number] {
  return [pivot.x * CUBE_SIZE, pivot.y * CUBE_SIZE, pivot.z * CUBE_SIZE];
}

function Leg({ name, part }: { name: LegName; part: PivotPart }) {
  const ref = useRef<Group>(null);
  const phase = trotPairs[0].includes(name) ? 0 : Math.PI;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = Math.sin(t * WALK_SPEED + phase) * SWING_AMPLITUDE;
  });

  return (
    <group ref={ref} position={pivotPosition(part.pivot)}>
      <CubeGroup cubes={part.cubes} color={creatureColors.leg} />
    </group>
  );
}

function Tail({ part }: { part: PivotPart }) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * TAIL_SWING_SPEED) * TAIL_SWING_AMPLITUDE;
  });

  return (
    <group ref={ref} position={pivotPosition(part.pivot)}>
      <CubeGroup cubes={part.cubes} color={creatureColors.tail} />
    </group>
  );
}

// Phase 1 demo：整隻怪獸沿小圓圈慢慢踱步、朝向前進方向，純粹用來驗證
// 「造型＋走路動畫」看起來像不像在走路，不是正式的隨機閒晃邏輯。
export default function VoxelCreature() {
  const rootRef = useRef<Group>(null);

  useFrame((state) => {
    if (!rootRef.current) return;
    const t = state.clock.elapsedTime * PACE_SPEED;
    rootRef.current.position.x = Math.sin(t) * PACE_RADIUS;
    rootRef.current.position.z = Math.cos(t) * PACE_RADIUS;
    rootRef.current.rotation.y = Math.atan2(Math.cos(t), -Math.sin(t));
  });

  const legNames = Object.keys(legs) as LegName[];

  return (
    <group ref={rootRef} position={[0, bodyGroundOffset, 0]}>
      <CubeGroup cubes={torsoCubes} color={creatureColors.torso} />
      <CubeGroup cubes={headCubes} color={creatureColors.head} />
      <CubeGroup cubes={hornCubes} color={creatureColors.horn} />
      <Tail part={tail} />
      {legNames.map((name) => (
        <Leg key={name} name={name} part={legs[name]} />
      ))}
    </group>
  );
}
