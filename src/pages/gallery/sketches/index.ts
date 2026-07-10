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
import { createFishLifeSketch } from "./fishlife";
import { createChessboardWorldSketch } from "./chessboardworld";
import { createBloomOfDeliriumSketch } from "./bloomofdelirium";
import { createHinaDaisySketch } from "./hinadaisy";
import { createMazeRacingSketch } from "./mazeracing";
import { createRPSSketch } from "./rps";
import { createBoxingMeleeSketch } from "./boxingmelee";
import { createMetalCollisionSketch } from "./metalcollision";

export type SketchFactory = (width: number, height: number) => (p: p5) => void;

// 每件作品支援的互動方式，GalleryDetail.tsx 依此組出對應的操作提示文字：
// - click-regenerate：點一下畫布就重新產生一次構圖（靜態作品的「重製」，或動畫
//   作品重新洗牌），例如山與月、觸手等等
// - drag-draw：按住滑鼠拖曳會即時在畫布上畫出筆觸，例如纏繞
// - keyboard-game：方向鍵／WASD 操控、點擊畫面上的按鈕跟選項開始遊戲，例如迷宮競速
// - button-game：純滑鼠的回合制遊戲，點擊 START 按鈕開始／進下一輪，例如拳擊混戰
// - drag-physics：滑鼠可以抓取、拖曳畫面上的物理物件，例如金屬碰撞
export type SketchInteraction =
  | "click-regenerate"
  | "drag-draw"
  | "keyboard-game"
  | "button-game"
  | "drag-physics";

export interface SketchEntry {
  factory: SketchFactory;
  // 容器寬高比（width / height），決定展場聚光燈容器要留多大的框給這件作品
  aspect: number;
  interactions: SketchInteraction[];
  // 「按下 S 儲存目前畫面」是大部分作品共通的操作，預設鍵是 S；迷宮競速的 S
  // 被 WASD 移動占用了，所以改用 H，這裡讓每件作品能覆寫自己實際綁定的鍵。
  saveKey?: string;
}

// 原稿拿 windowWidth/windowHeight 畫滿整個瀏覽器視窗，
// 截圖是在 1872x906 的視窗下拍的（見 public/images/gallery/）
// 這裡沿用同一個寬高比，讓構圖比例跟原始效果一致。
const WIDESCREEN_ASPECT = 1872 / 906;

// TRII 原稿吃 windowWidth/2 x windowHeight（見對話紀錄），畫面接近正方形。
const TRII_ASPECT = 1872 / 2 / 906;

// 污染的畫布跟著素材圖 ocean.png 的原始尺寸（1440x648，見
// public/images/gallery/pollute/），不是滿版視窗。
const POLLUTE_ASPECT = 1440 / 648;

// 迷宮競速跟 RPS 的原稿都吃固定 1800x900 的畫布（見 mazeracing.ts、rps.ts）。
const MAZE_ASPECT = 1800 / 900;

// slug -> instance-mode sketch factory + 容器寬高比。之後每移植一件作品，就在
// 這裡加一筆映射；沒有對應項目的作品維持原本的靜態截圖展示（見 GalleryDetail.tsx）。
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
  Fish_Life: {
    factory: (width) => createFishLifeSketch(width),
    aspect: 1,
    interactions: ["click-regenerate"],
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
};

export default sketches;
