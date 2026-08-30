import type p5 from "p5";

// 原稿「熔岩地脈」用 windowWidth/windowHeight 畫滿視窗，改寫成 instance mode，
// width/height 從外部傳入；截圖跟天體碎片一樣是 1912x897，共用同一個
// CELESTIAL_FRAGMENTS_ASPECT 比例常數（見 index.ts）。
//
// 格子大小（10px）是原稿針對「視窗寬 ~1912px」寫死的像素值，統一乘上
// k = width / REFERENCE_WIDTH 等比例縮放，cols/rows 再依縮放後的格子大小重新
// 計算，讓格子密度不管畫布多大都跟原稿一致。
const REFERENCE_WIDTH = 1912;
const CELL_SIZE = 10;
const INITIAL_WALL_CHANCE = 0.48;
// 前 15 步是細胞自動機收斂洞穴輪廓的過程，這段時間內地貌還沒穩定，滑鼠互動
// 先關閉，避免使用者在牆壁還在跳動時就注入岩漿或挖穿地道。
const SETTLE_STEPS = 15;
const DIG_BRUSH_SIZE = 2;

const EMPTY = 0;
const WALL = 1;
const LAVA = 2;

export function createLavaVeinsSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    const cellSize = CELL_SIZE * k;
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    let grid: number[][];
    let nextGrid: number[][];
    let stepCount = 0;

    const create2DArray = (): number[][] =>
      Array.from({ length: cols }, () => new Array(rows).fill(EMPTY));

    const initializeMap = () => {
      stepCount = 0;
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
            grid[x][y] = WALL;
          } else {
            grid[x][y] = p.random(1) < INITIAL_WALL_CHANCE ? WALL : EMPTY;
          }
        }
      }
    };

    const getAdjacentWalls = (gridX: number, gridY: number) => {
      let count = 0;
      for (let nx = gridX - 1; nx <= gridX + 1; nx++) {
        for (let ny = gridY - 1; ny <= gridY + 1; ny++) {
          if (nx === gridX && ny === gridY) continue;
          if (grid[nx][ny] === WALL) count++;
        }
      }
      return count;
    };

    const generateNextStep = () => {
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          nextGrid[x][y] = grid[x][y];
        }
      }

      // 階段 A：地形初期凝聚，依鄰居牆壁數收斂成自然的洞穴輪廓
      if (stepCount < SETTLE_STEPS) {
        for (let x = 1; x < cols - 1; x++) {
          for (let y = 1; y < rows - 1; y++) {
            const wallCount = getAdjacentWalls(x, y);
            if (grid[x][y] === WALL) {
              nextGrid[x][y] = wallCount >= 4 ? WALL : EMPTY;
            } else {
              nextGrid[x][y] = wallCount >= 5 ? WALL : EMPTY;
            }
          }
        }
      }
      // 階段 B：岩漿流體模擬，優先下墜，受阻改斜向流動，再受阻就向兩側滿溢
      else {
        for (let y = rows - 2; y >= 1; y--) {
          for (let x = 1; x < cols - 1; x++) {
            if (grid[x][y] !== LAVA) continue;

            // 岩漿黏度高，每 2 幀才更新一次位置
            if (stepCount % 2 !== 0) continue;

            if (grid[x][y + 1] === EMPTY && nextGrid[x][y + 1] === EMPTY) {
              nextGrid[x][y] = EMPTY;
              nextGrid[x][y + 1] = LAVA;
              continue;
            }

            const leftOpen =
              grid[x - 1][y + 1] === EMPTY && nextGrid[x - 1][y + 1] === EMPTY;
            const rightOpen =
              grid[x + 1][y + 1] === EMPTY && nextGrid[x + 1][y + 1] === EMPTY;

            if (leftOpen && rightOpen) {
              const dir = p.random(1) < 0.5 ? -1 : 1;
              nextGrid[x][y] = EMPTY;
              nextGrid[x + dir][y + 1] = LAVA;
            } else if (leftOpen) {
              nextGrid[x][y] = EMPTY;
              nextGrid[x - 1][y + 1] = LAVA;
            } else if (rightOpen) {
              nextGrid[x][y] = EMPTY;
              nextGrid[x + 1][y + 1] = LAVA;
            } else {
              const sideLeftOpen =
                grid[x - 1][y] === EMPTY && nextGrid[x - 1][y] === EMPTY;
              const sideRightOpen =
                grid[x + 1][y] === EMPTY && nextGrid[x + 1][y] === EMPTY;

              if (sideLeftOpen && sideRightOpen) {
                const dir = p.random(1) < 0.5 ? -1 : 1;
                nextGrid[x + dir][y] = LAVA;
              } else if (sideLeftOpen) {
                nextGrid[x - 1][y] = LAVA;
              } else if (sideRightOpen) {
                nextGrid[x + 1][y] = LAVA;
              }
            }
          }
        }
      }

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          grid[x][y] = nextGrid[x][y];
        }
      }
    };

    // 挖地道：拖曳時清空游標周圍一圈格子，讓岩漿能改道流動
    const handleMouseDrag = () => {
      if (stepCount < SETTLE_STEPS) return;
      if (!p.mouseIsPressed || (p.mouseX === p.pmouseX && p.mouseY === p.pmouseY)) {
        return;
      }

      const gridX = Math.floor(p.mouseX / cellSize);
      const gridY = Math.floor(p.mouseY / cellSize);
      if (gridX <= 0 || gridX >= cols - 1 || gridY <= 0 || gridY >= rows - 1) return;

      for (let xOffset = -DIG_BRUSH_SIZE; xOffset <= DIG_BRUSH_SIZE; xOffset++) {
        for (let yOffset = -DIG_BRUSH_SIZE; yOffset <= DIG_BRUSH_SIZE; yOffset++) {
          const targetX = gridX + xOffset;
          const targetY = gridY + yOffset;
          if (
            targetX > 0 &&
            targetX < cols - 1 &&
            targetY > 0 &&
            targetY < rows - 1
          ) {
            grid[targetX][targetY] = EMPTY;
          }
        }
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      grid = create2DArray();
      nextGrid = create2DArray();
      initializeMap();
      p.frameRate(30);

      // 點一下注入一滴岩漿；綁在 canvas 元素上避免點畫布外誤觸。
      canvas.mousePressed(() => {
        if (stepCount < SETTLE_STEPS) return;

        const gridX = Math.floor(p.mouseX / cellSize);
        const gridY = Math.floor(p.mouseY / cellSize);
        if (gridX > 0 && gridX < cols - 1 && gridY > 0 && gridY < rows - 1) {
          grid[gridX][gridY] = LAVA;
        }
      });
    };

    p.draw = () => {
      p.background(15);
      handleMouseDrag();

      p.noStroke();
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          if (grid[x][y] === WALL) {
            p.fill(40, 35, 40); // 牆壁：深暗岩石色
          } else if (grid[x][y] === LAVA) {
            p.fill(p.random(235, 255), p.random(60, 110), 15); // 岩漿：高飽和橘紅閃爍
          } else {
            p.fill(22, 18, 22); // 空地
          }
          p.rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }

      generateNextStep();
      stepCount++;
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Lava_Veins", "png", 1, 1);
      }
    };
  };
}
