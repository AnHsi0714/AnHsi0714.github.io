import type p5 from "p5";

// 原稿存檔檔名是 Chromatic_Infection_v3，是六色版感染型元胞
// 自動機：格子只鋪在畫布中央的圓形範圍內（半徑 canvasSize*0.45），圓外的格
// 子狀態固定為 -1、不參與演化也不繪製。canvasSize／cellSize 的縮放邏輯跟
// v1、v2 一樣（k = size / REFERENCE_SIZE），圓形半徑跟著等比例縮放。
//
// 跟 v1／v2 的鄰域計數投票不同，這版每格每輪只用 Perlin noise 選一個方向
// （8 個方向對應 noise 值切成 8 段），去看該方向鄰居是否剋制自己
// （(attacker+1) % 6 === defender），剋制就被感染。noise 的 z 軸用
// frameCount * noiseSpeed 推進，維持原稿的參數。
//
// 原稿只有 R 鍵手動重灑，這裡比照其他 Chromatic 系列加上點擊畫布重置。
const REFERENCE_SIZE = 900;

const COLORS = [
  "#168CFF",
  "#FF304F",
  "#FFD51C",
  "#39D98A",
  "#A855F7",
  "#FF8A3D",
];
const GLOW_COLORS: [number, number, number][] = [
  [22, 140, 255],
  [255, 48, 79],
  [255, 213, 28],
  [57, 217, 138],
  [168, 85, 247],
  [255, 138, 61],
];

const DIRECTIONS: [number, number][] = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const NOISE_SCALE = 0.05;
const NOISE_SPEED = 0.5;

function beats(attacker: number, defender: number): boolean {
  return (attacker + 1) % COLORS.length === defender;
}

export function createChromaticCycleV3Sketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    const cellSize = 15 * k;
    const cols = Math.floor(size / cellSize);
    const rows = Math.floor(size / cellSize);
    const circleRadius = size * 0.45;

    let grid: number[][];
    let nextGrid: number[][];

    const createGrid = (): number[][] => {
      const newGrid: number[][] = [];
      for (let y = 0; y < rows; y++) {
        newGrid[y] = [];
        for (let x = 0; x < cols; x++) {
          const px = x * cellSize + cellSize / 2;
          const py = y * cellSize + cellSize / 2;
          newGrid[y][x] =
            p.dist(px, py, size / 2, size / 2) < circleRadius
              ? Math.floor(p.random(COLORS.length))
              : -1;
        }
      }
      return newGrid;
    };

    const drawGrid = () => {
      p.noStroke();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const state = grid[y][x];
          if (state === -1) continue;

          const glow = GLOW_COLORS[state];
          p.fill(glow[0], glow[1], glow[2], 25);
          p.rect(
            x * cellSize - 3 * k,
            y * cellSize - 3 * k,
            cellSize + 6 * k,
            cellSize + 6 * k,
          );

          p.fill(COLORS[state]);
          p.rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    };

    const updateGrid = () => {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const currentState = grid[y][x];
          if (currentState === -1) {
            nextGrid[y][x] = -1;
            continue;
          }

          const noiseValue = p.noise(
            x * NOISE_SCALE,
            y * NOISE_SCALE,
            p.frameCount * NOISE_SPEED,
          );
          const [dx, dy] =
            DIRECTIONS[Math.floor(noiseValue * DIRECTIONS.length)];
          const nx = x + dx;
          const ny = y + dy;

          let nextState = currentState;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const neighborState = grid[ny][nx];
            if (neighborState !== -1 && beats(neighborState, currentState)) {
              nextState = neighborState;
            }
          }

          nextGrid[y][x] = nextState;
        }
      }

      const temp = grid;
      grid = nextGrid;
      nextGrid = temp;
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.pixelDensity(1);
      p.frameRate(10);

      grid = createGrid();
      nextGrid = createGrid();

      canvas.mousePressed(() => {
        grid = createGrid();
      });
    };

    p.draw = () => {
      p.background("#111");
      drawGrid();
      updateGrid();
    };

    p.keyPressed = () => {
      if (p.key === "r" || p.key === "R") {
        grid = createGrid();
      }
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Chromatic_Infection_v3", "png", 1, 1);
      }
    };
  };
}
