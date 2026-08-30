import type p5 from "p5";

// 原稿「色彩循環 v2」是六色版的「剪刀石頭布」元胞自動機（原稿存檔檔名
// Chromatic_Clash_v2），在 v1 基礎上加了隨機突變（mutationRate）、變色機率
// （changeRate），並讓細胞自身在鄰域計數中權重加倍，演化得比 v1 更緩慢抗噪。
// canvasSize／cellSize 縮放邏輯同 v1（k = size / REFERENCE_SIZE）。原稿沒呼叫
// frameRate()，維持 p5 預設值。
//
// 原稿用 R 鍵手動重灑色彩跳出演化僵局，這裡額外把同一動作綁到點擊畫布上
// （比照 v1 與「爆發」），R 鍵仍保留。
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
const MUTATION_RATE = 0.05;
const CHANGE_RATE = 0.9;

function beats(a: number, b: number): boolean {
  return (a + 1) % COLORS.length === b;
}

export function createChromaticCycleV2Sketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    const cellSize = 15 * k;
    const cols = Math.floor(size / cellSize);
    const rows = Math.floor(size / cellSize);

    let grid: number[][];
    let nextGrid: number[][];

    const createGrid = (): number[][] => {
      const newGrid: number[][] = [];
      for (let y = 0; y < rows; y++) {
        newGrid[y] = [];
        for (let x = 0; x < cols; x++) {
          newGrid[y][x] = Math.floor(p.random(COLORS.length));
        }
      }
      return newGrid;
    };

    const drawGrid = () => {
      p.noStroke();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const state = grid[y][x];
          const glow = GLOW_COLORS[state];

          p.fill(glow[0], glow[1], glow[2], 25);
          p.rect(
            x * cellSize - 4 * k,
            y * cellSize - 4 * k,
            cellSize + 8 * k,
            cellSize + 8 * k,
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
          const count = new Array(COLORS.length).fill(0);

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                const state = grid[ny][nx];
                count[state] += dx === 0 && dy === 0 ? 2 : 1;
              }
            }
          }

          let nextState = currentState;

          if (p.random() < MUTATION_RATE) {
            nextState = Math.floor(p.random(COLORS.length));
          } else {
            const present: number[] = [];
            for (let state = 0; state < COLORS.length; state++) {
              if (count[state] > 0) present.push(state);
            }

            if (present.length === 2) {
              const [a, b] = present;
              const winner = beats(a, b) ? a : b;
              const loser = winner === a ? b : a;

              if (count[winner] > count[loser] && p.random() < CHANGE_RATE) {
                nextState = winner;
              }
            } else if (present.length >= 3) {
              const sorted = [...present].sort((a, b) => count[b] - count[a]);
              const strongest = sorted[0];
              const second = sorted[1];

              if (
                count[strongest] >= count[second] + 2 &&
                p.random() < CHANGE_RATE
              ) {
                nextState = strongest;
              }
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
        p.saveFrames("Chromatic_Clash_v2", "png", 1, 1);
      }
    };
  };
}
