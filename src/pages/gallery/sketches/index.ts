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

export type SketchFactory = (width: number, height: number) => (p: p5) => void;

// 每件作品支援的互動方式，GalleryDetail.tsx 依此組出對應的操作提示文字：
// - click-regenerate：點一下畫布就重新產生一次構圖（靜態作品的「重製」，或動畫
//   作品重新洗牌），例如山與月、觸手等等
// - drag-draw：按住滑鼠拖曳會即時在畫布上畫出筆觸，例如纏繞
export type SketchInteraction = "click-regenerate" | "drag-draw";

export interface SketchEntry {
  factory: SketchFactory;
  // 容器寬高比（width / height），決定展場聚光燈容器要留多大的框給這件作品
  aspect: number;
  interactions: SketchInteraction[];
}

// 原稿拿 windowWidth/windowHeight 畫滿整個瀏覽器視窗，
// 截圖是在 1872x906 的視窗下拍的（見 public/images/gallery/）
// 這裡沿用同一個寬高比，讓構圖比例跟原始效果一致。
const WIDESCREEN_ASPECT = 1872 / 906;

// TRII 原稿吃 windowWidth/2 x windowHeight（見對話紀錄），畫面接近正方形。
const TRII_ASPECT = 1872 / 2 / 906;

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
};

export default sketches;