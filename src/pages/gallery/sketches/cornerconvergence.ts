import type p5 from "p5";

// 原稿吃固定 910x910 正方形畫布，改寫成 instance mode，size 從外部傳入。
// 原稿靠 910/70 整除成 13 的巧合讓每個角落畫滿 13 條線（用 countNode 倒數
// 計數）；size 換成外部傳入後不保證整除，會導致四角線條數量不對稱
// （countNode 跨角落共用，一角跑掉全部跟著歪）。改成固定跑 13 次
// （ORIGINAL_NODE + 1）、用 index 算 i，不再依賴整除巧合。
//
// space（節點間距）、lineWeight 是針對「910px 見方」寫死的絕對像素值，乘上
// k = size / REFERENCE_SIZE 等比例縮放。原稿只有 S 鍵存檔，這裡加上點擊
// 畫布重製，換一組新配色。
const REFERENCE_SIZE = 910;
const SPACE = 70;
const ORIGINAL_NODE = 12;
const NODE_COUNT = ORIGINAL_NODE + 1;
const LINE_WEIGHT = 2;

const LIGHT_BACKGROUNDS = [
  "#F7F1E8",
  "#FFF8E7",
  "#F2E9DC",
  "#EDE7DE",
  "#F8E8E8",
  "#E8F1F2",
  "#EEF2E3",
  "#F4E9F7",
  "#FFF1D6",
  "#E9E4D4",
];

const DARK_BACKGROUNDS = [
  "#111827",
  "#24162B",
  "#071E2B",
  "#10251D",
  "#210B08",
  "#12091C",
  "#11100D",
  "#1B1B2F",
  "#20251F",
  "#29201A",
];

type RGB = [number, number, number];

const LIGHT_PALETTES: RGB[][] = [
  [
    [190, 45, 45],
    [220, 90, 30],
    [230, 140, 40],
    [100, 50, 90],
    [45, 45, 80],
  ],
  [
    [0, 60, 100],
    [0, 100, 150],
    [0, 140, 170],
    [20, 110, 120],
    [40, 70, 100],
  ],
  [
    [30, 70, 50],
    [45, 100, 65],
    [80, 120, 65],
    [120, 110, 50],
    [70, 80, 55],
  ],
  [
    [100, 35, 35],
    [150, 70, 40],
    [190, 130, 50],
    [60, 80, 65],
    [45, 60, 70],
  ],
  [
    [70, 30, 100],
    [110, 50, 150],
    [150, 60, 180],
    [180, 80, 150],
    [80, 50, 110],
  ],
  [
    [100, 55, 35],
    [150, 90, 45],
    [180, 130, 60],
    [70, 90, 65],
    [70, 65, 50],
  ],
];

const DARK_PALETTES: RGB[][] = [
  [
    [255, 0, 110],
    [255, 80, 0],
    [255, 220, 0],
    [0, 255, 180],
    [0, 180, 255],
  ],
  [
    [0, 220, 255],
    [50, 150, 255],
    [100, 80, 255],
    [180, 50, 255],
    [0, 255, 200],
  ],
  [
    [255, 60, 30],
    [255, 100, 0],
    [255, 170, 20],
    [255, 220, 60],
    [255, 240, 150],
  ],
  [
    [255, 80, 150],
    [255, 150, 200],
    [255, 220, 80],
    [80, 240, 220],
    [150, 120, 255],
  ],
  [
    [180, 60, 255],
    [220, 80, 255],
    [255, 120, 220],
    [100, 180, 255],
    [120, 255, 220],
  ],
  [
    [255, 210, 80],
    [255, 180, 40],
    [220, 140, 30],
    [255, 235, 150],
    [180, 130, 50],
  ],
];

export function createCornerConvergenceSketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    const space = SPACE * k;

    const drawCornerConvergence = () => {
      const isDark = p.random() < 0.5;
      const backgrounds = isDark ? DARK_BACKGROUNDS : LIGHT_BACKGROUNDS;
      const palettes = isDark ? DARK_PALETTES : LIGHT_PALETTES;
      const palette = p.random(palettes);

      p.background(p.random(backgrounds));

      const corners: [number, number, (i: number) => [number, number]][] = [
        [0, 0, (i) => [size, i]],
        [size, 0, (i) => [size - i, size]],
        [size, size, (i) => [0, size - i]],
        [0, size, (i) => [i, 0]],
      ];

      for (const [fromX, fromY, toPoint] of corners) {
        for (let index = 0; index < NODE_COUNT; index++) {
          const i = index * space;
          p.stroke(p.random(palette));
          const [toX, toY] = toPoint(i);
          p.line(fromX, fromY, toX, toY);
        }
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.strokeWeight(LINE_WEIGHT * k);
      drawCornerConvergence();

      canvas.mousePressed(() => {
        p.strokeWeight(LINE_WEIGHT * k);
        drawCornerConvergence();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveCanvas("Corner_Convergence", "png");
      }
    };
  };
}
