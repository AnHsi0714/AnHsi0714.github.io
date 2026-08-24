import type p5 from "p5";

// 原稿「色彩循環」是三色版的「剪刀石頭布」元胞自動機：canvasSize 固定 900、
// cellSize 固定 15（見對話紀錄），改寫成 instance mode 時把兩者都改成跟外部
// 傳入的 size 等比例縮放（k = size / REFERENCE_SIZE），維持約 60x60 格的密度
// 不隨展場容器大小改變。
//
// 原稿只靠 draw() 持續演化、沒有任何互動，這裡仿照「爆發」的做法加上點擊
// 重製：綁在 canvas 元素本身，點畫布內會重新灑一次隨機色彩，跳出目前的
// 演化僵局。
const REFERENCE_SIZE = 900;

const COLORS = ["#168CFF", "#FF304F", "#FFD51C"];
const GLOW_COLORS: [number, number, number][] = [
  [22, 140, 255],
  [255, 48, 79],
  [255, 213, 28],
];

function beats(a: number, b: number): boolean {
  return (a === 0 && b === 2) || (a === 1 && b === 0) || (a === 2 && b === 1);
}

export function createChromaticCycleSketch(size: number) {
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
          newGrid[y][x] = Math.floor(p.random(3));
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
          const count = [0, 0, 0];

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                count[grid[ny][nx]]++;
              }
            }
          }

          const present: number[] = [];
          for (let state = 0; state < 3; state++) {
            if (count[state] > 0) present.push(state);
          }

          if (present.length === 1) {
            nextGrid[y][x] = present[0];
          } else if (present.length === 2) {
            const [a, b] = present;
            nextGrid[y][x] = beats(a, b) ? a : b;
          } else {
            const maxCount = Math.max(...count);
            const winners: number[] = [];
            for (let state = 0; state < 3; state++) {
              if (count[state] === maxCount) winners.push(state);
            }
            nextGrid[y][x] = winners.length === 1 ? winners[0] : grid[y][x];
          }
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
        nextGrid = createGrid();
      });
    };

    p.draw = () => {
      p.background("#111");
      drawGrid();
      updateGrid();
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Chromatic_Cycle", "png", 1, 1);
      }
    };
  };
}
