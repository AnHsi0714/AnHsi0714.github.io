import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Instance, Instances, OrbitControls } from "@react-three/drei";
import { CUBE_SIZE, REGIONS, creatureViewCenter } from "../lib/creatureBody";
import { pivotPosition } from "./VoxelCreature";
import type { VoxelCreatureData } from "../types/friends";

const UNPAINTED_COLOR = "#d9d3c8";
// 跟 CubeGroup/InteractiveCubeGroup 同樣的理由：drei 的 <Instances> limit 只在掛載
// 當下配置 buffer，不能綁動態值，這裡固定用夠大的值。
const INSTANCE_LIMIT = 1024;

interface VoxelPaintedCreatureProps {
  data: VoxelCreatureData;
  className?: string;
  // 慢速自轉展示（創作牆置中卡片用）；靜態縮圖不用開
  autoRotate?: boolean;
  // 允許拖曳旋轉／滾輪縮放（創作牆放大檢視用）
  interactive?: boolean;
}

// 唯讀渲染一份朋友塗好色的 3D 怪獸（不接走路動畫），給 Creator.tsx 的成功畫面
// 當縮圖、創作牆卡片與放大檢視用。走訪 creatureBody.ts 的 REGIONS，塗過色的
// 格子用存的顏色，沒塗到的格子用中性底色（跟塗色編輯器的未塗色底色一致）。
export default function VoxelPaintedCreature({
  data,
  className,
  autoRotate = false,
  interactive = false,
}: VoxelPaintedCreatureProps) {
  const colorByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of data.colors) {
      map.set(`${p.region},${p.x},${p.y},${p.z}`, p.color);
    }
    return map;
  }, [data]);

  return (
    <div className={className}>
      <Canvas camera={{ position: [2.2, 1.8, 3.2], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} />
        {REGIONS.map((region) => (
          <group key={region.id} position={pivotPosition(region.origin)}>
            <Instances limit={INSTANCE_LIMIT} range={region.cubes.length}>
              <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
              <meshStandardMaterial />
              {region.cubes.map((c) => (
                <Instance
                  key={`${c.x},${c.y},${c.z}`}
                  position={[c.x * CUBE_SIZE, c.y * CUBE_SIZE, c.z * CUBE_SIZE]}
                  color={colorByKey.get(`${region.id},${c.x},${c.y},${c.z}`) ?? UNPAINTED_COLOR}
                />
              ))}
            </Instances>
          </group>
        ))}
        {/* target 對準怪獸的視覺重心（動態算的，見 creatureBody.ts），它同時是
            autoRotate 的軸心。靜態縮圖時 enabled=false，只借 OrbitControls 建構時的
            update() 把鏡頭對準目標；drei 的 OrbitControls 只在 enabled 時每幀
            update()，所以自轉展示也要 enabled，再把各輸入關掉。 */}
        <OrbitControls
          target={creatureViewCenter}
          enabled={autoRotate || interactive}
          enableRotate={interactive}
          enableZoom={interactive}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}
