import type p5 from "p5";
import { createEntanglementSketch } from "./entanglement";
import { createMoontainSketch } from "./moontain";
import { createPopSketch } from "./pop";
import { createTentacleSketch } from "./tentacle";
import { createAudioSketch } from "./audio";
import { createBatSketch } from "./bat";
import { createPrismSketch } from "./prism";
import { createTRISketch } from "./tri";
import { createTRIISketch } from "./trii";
import { createPolluteSketch } from "./pollute";
import { createEruptionSketch } from "./eruption";
import { createHsiLanternSketch } from "./hsilantern";
import { createOceanCitySketch } from "./oceancity";
import { createOceanCityV2Sketch } from "./oceancityv2";
import { createFishLifeSketch } from "./fishlife";
import { createChessboardWorldSketch } from "./chessboardworld";
import { createBloomOfDeliriumSketch } from "./bloomofdelirium";
import { createHinaDaisySketch } from "./hinadaisy";
import { createMazeRacingSketch } from "./mazeracing";
import { createRPSSketch } from "./rps";
import { createBoxingMeleeSketch } from "./boxingmelee";
import { createMetalCollisionSketch } from "./metalcollision";
import { createALostFaceSketch } from "./alostface";
import { createPlaidSketch } from "./plaid";
import { createChromaticCycleSketch } from "./chromaticcycle";
import { createChromaticCycleV2Sketch } from "./chromaticcyclev2";
import { createChromaticCycleV3Sketch } from "./chromaticcyclev3";
import { createCelestialFragmentsSketch } from "./celestialfragments";
import { createCornerConvergenceSketch } from "./cornerconvergence";
import { createLavaVeinsSketch } from "./lavaveins";

export type SketchFactory = (width: number, height: number) => (p: p5) => void;

// 每件作品支援的互動方式，GalleryDetail.tsx 依此組出操作提示文字：
// - click-regenerate：點畫布重新產生構圖（重製或動畫洗牌），例如山與月、觸手
// - drag-draw：拖曳即時畫出筆觸，例如纏繞
// - keyboard-game：方向鍵／WASD 操控 + 按鈕開始遊戲，例如迷宮競速
// - button-game：純滑鼠回合制，點 START 開始／進下一輪，例如拳擊混戰
// - drag-physics：滑鼠抓取拖曳物理物件，例如金屬碰撞
export type SketchInteraction =
  | "click-regenerate"
  | "drag-draw"
  | "keyboard-game"
  | "button-game"
  | "drag-physics";

export interface SketchEntry {
  factory: SketchFactory;
  // 容器寬高比（width / height），決定展場聚光燈容器留多大的框
  aspect: number;
  interactions: SketchInteraction[];
  // 「按 S 儲存畫面」預設鍵是 S；迷宮競速的 S 被 WASD 占用，改用 H，
  // 這裡讓每件作品能覆寫實際綁定的鍵。
  saveKey?: string;
  // 不用操作就持續變化的作品（draw() 每幀跑、無終止狀態，跟畫一次就凍結的
  // click-regenerate 不同）。GalleryGrid.tsx 依此疊加「持續變動」篩選標籤，
  // 跟 interactions 是兩件事，可同時存在（例如色彩循環系列）。
  animated?: boolean;
}

// 原稿拿 windowWidth/windowHeight 畫滿視窗，截圖是在 1872x906 下拍的
// （見 public/images/gallery/），沿用同一寬高比讓構圖跟原效果一致。
const WIDESCREEN_ASPECT = 1872 / 906;

// TRII 原稿吃 windowWidth/2 x windowHeight，畫面接近正方形。
const TRII_ASPECT = 1872 / 2 / 906;

// 污染的畫布跟著素材圖 ocean.png 原始尺寸（1440x648），不是滿版視窗。
const POLLUTE_ASPECT = 1440 / 648;

// 迷宮競速跟 RPS 原稿都吃固定 1800x900 畫布。
const MAZE_ASPECT = 1800 / 900;

// 天體碎片原稿也是滿版視窗，但截圖是 1912x897，跟 WIDESCREEN_ASPECT 不同，
// 另訂一個比例常數；熔岩地脈截圖同尺寸，一併沿用。
const CELESTIAL_FRAGMENTS_ASPECT = 1912 / 897;

// slug -> instance-mode sketch factory + 容器寬高比。之後移植新作品在這裡加一筆
// 映射，沒有對應項目的作品維持靜態截圖展示（見 GalleryDetail.tsx）。
const sketches: Record<string, SketchEntry> = {
  entanglement: {
    factory: (width) => createEntanglementSketch(width),
    aspect: 1,
    interactions: ["drag-draw"],
  },
  moontain: {
    factory: (width) => createMoontainSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  POP: {
    factory: createPopSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["click-regenerate"],
    animated: true,
  },
  tentacle: {
    factory: createTentacleSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["click-regenerate"],
  },
  audio: {
    factory: createAudioSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["click-regenerate"],
  },
  bat: {
    factory: createBatSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["click-regenerate"],
  },
  prism: {
    factory: createPrismSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["click-regenerate"],
  },
  TRI: {
    factory: createTRISketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["click-regenerate"],
  },
  TRII: {
    factory: createTRIISketch,
    aspect: TRII_ASPECT,
    interactions: ["click-regenerate"],
  },
  pollute: {
    factory: createPolluteSketch,
    aspect: POLLUTE_ASPECT,
    interactions: ["click-regenerate"],
  },
  Eruption: {
    factory: createEruptionSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["click-regenerate"],
    animated: true,
  },
  Hsi_lantern: {
    factory: (width) => createHsiLanternSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  ocean_city: {
    factory: (width) => createOceanCitySketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  ocean_city_v2: {
    factory: (width) => createOceanCityV2Sketch(width),
    aspect: 1,
    interactions: ["drag-draw"],
    animated: true,
  },
  Fish_Life: {
    factory: (width) => createFishLifeSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
    animated: true,
  },
  Chessboard_World: {
    factory: (width) => createChessboardWorldSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  BloomOfDelirium: {
    factory: (width) => createBloomOfDeliriumSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  Hina_Daisy: {
    factory: (width) => createHinaDaisySketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  Maze_Racing: {
    factory: createMazeRacingSketch,
    aspect: MAZE_ASPECT,
    interactions: ["keyboard-game"],
    saveKey: "h",
  },
  RPS: {
    factory: createRPSSketch,
    aspect: MAZE_ASPECT,
    interactions: ["click-regenerate"],
  },
  boxing_melee: {
    factory: createBoxingMeleeSketch,
    aspect: MAZE_ASPECT,
    interactions: ["button-game"],
  },
  metal_collision: {
    factory: createMetalCollisionSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: ["drag-physics"],
  },
  A_Lost_Face: {
    factory: createALostFaceSketch,
    aspect: WIDESCREEN_ASPECT,
    interactions: [],
    animated: true,
  },
  Plaid: {
    factory: (width) => createPlaidSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  Chromatic_Cycle: {
    factory: (width) => createChromaticCycleSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
    animated: true,
  },
  Chromatic_Cycle_v2: {
    factory: (width) => createChromaticCycleV2Sketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
    animated: true,
  },
  Chromatic_Cycle_v3: {
    factory: (width) => createChromaticCycleV3Sketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
    animated: true,
  },
  Celestial_Fragments: {
    factory: createCelestialFragmentsSketch,
    aspect: CELESTIAL_FRAGMENTS_ASPECT,
    interactions: ["click-regenerate"],
    animated: true,
  },
  Corner_Convergence: {
    factory: (width) => createCornerConvergenceSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
  },
  lava_veins: {
    factory: createLavaVeinsSketch,
    aspect: CELESTIAL_FRAGMENTS_ASPECT,
    interactions: ["drag-draw"],
    animated: true,
  },
};

export default sketches;
