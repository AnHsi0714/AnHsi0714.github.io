import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import VoxelCreature from "../../components/VoxelCreature";

// 拋棄式 /dev 頁面（比照 ComponentsPreview.tsx）：驗證共用怪獸的造型＋走路
// 動畫看起來像不像在走路，不接任何資料、不做上色/塗色功能。
export default function CreatureDemo() {
  return (
    <div className="flex flex-col gap-4">
      <section>
        <h1 className="text-2xl font-bold">怪獸 demo</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          拖曳旋轉、滾輪縮放檢視共用怪獸模型的造型與走路動畫（對角步態）。
        </p>
      </section>

      <div className="h-[70vh] w-full overflow-hidden rounded-md border border-[var(--color-border)]">
        <Canvas camera={{ position: [2.4, 1.9, 3.6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 2]} intensity={1.2} />
          <VoxelCreature />
          <Grid
            args={[10, 10]}
            cellColor="#8a8a8a"
            sectionColor="#4a4a4a"
            fadeDistance={12}
            infiniteGrid
          />
          <OrbitControls target={[0, 0.8, 0]} />
        </Canvas>
      </div>
    </div>
  );
}
