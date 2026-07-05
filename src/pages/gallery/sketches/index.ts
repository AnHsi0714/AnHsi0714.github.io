import type p5 from "p5";
import { createEntanglementSketch } from "./entanglement";

export type SketchFactory = (size: number) => (p: p5) => void;

// slug -> instance-mode sketch factory。之後每移植一件作品，就在這裡加一筆映射；
// 沒有對應項目的作品維持原本的靜態截圖展示（見 GalleryDetail.tsx）。
const sketches: Record<string, SketchFactory> = {
  entanglement: createEntanglementSketch,
};

export default sketches;
