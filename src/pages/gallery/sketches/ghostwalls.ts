import type p5 from "p5";

// 原稿「鬼打牆」是 global mode，改寫成 instance mode，size 從外部傳入。
// 原稿所有像素值（格距 35、鬼圖 48、波幅 3、間距變化 3）都是針對 900x900
// 畫布寫死的，統一乘上 k = size / 900 等比例縮放。
//
// 兩層網格一層不動、一層依滑鼠旋轉並微調間距，在 DIFFERENCE 混合下干涉出
// 莫爾紋。鬼 emoji 預先畫進一張小圖再用 image() 貼，比每幀 text() 快很多。
// 滑鼠還沒進過畫布時 mouseX/mouseY 都是 0，會讓第二層一開始就卡在最大旋轉角，
// 這種情況改用畫布中心當作滑鼠位置。
const REFERENCE_SIZE = 900;
const GAP = 35;
const GHOST_SIZE = 48;
const GHOST_TEXT_SIZE = 40;
const WAVE_AMPLITUDE = 3;
const MAX_ANGLE = 0.1;
const MAX_STEP_OFFSET = 3;

export function createGhostWallsSketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    let ghost: p5.Graphics;
    let t = 0;

    const drawGrid = (step: number, angle: number) => {
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(angle);
      const half = Math.ceil((size * 0.75) / step) * step; // 旋轉後仍要蓋滿畫面
      for (let y = -half; y <= half; y += step) {
        for (let x = -half; x <= half; x += step) {
          const wave = p.sin((x + y) * (0.01 / k) + t) * WAVE_AMPLITUDE * k;
          p.image(ghost, x + wave, y + wave);
        }
      }
      p.pop();
    };

    p.setup = () => {
      p.createCanvas(size, size);
      const ghostSize = Math.ceil(GHOST_SIZE * k);
      ghost = p.createGraphics(ghostSize, ghostSize);
      ghost.textSize(GHOST_TEXT_SIZE * k);
      ghost.textAlign(p.CENTER, p.CENTER);
      ghost.text("\u{1F47B}", ghostSize / 2, ghostSize / 2 + 2 * k);
      p.imageMode(p.CENTER);
    };

    p.draw = () => {
      p.blendMode(p.BLEND);
      p.background(220);
      p.blendMode(p.DIFFERENCE);

      t += 0.02;
      const hasMouse = p.mouseX !== 0 || p.mouseY !== 0;
      const mx = hasMouse ? p.mouseX : p.width / 2;
      const my = hasMouse ? p.mouseY : p.height / 2;
      const angle =
        p.map(mx, 0, p.width, -MAX_ANGLE, MAX_ANGLE) + p.sin(t * 0.5) * 0.01;
      const step = GAP * k;
      const step2 = step + p.map(my, 0, p.height, 0, MAX_STEP_OFFSET * k);

      drawGrid(step, 0);
      drawGrid(step2, angle);
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveCanvas("GhostWalls", "png");
      }
    };
  };
}
