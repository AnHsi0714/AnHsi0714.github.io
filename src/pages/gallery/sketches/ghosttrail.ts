import type p5 from "p5";

// 原稿「鬼道」是 global mode，改寫成 instance mode，size 從外部傳入。
// 字級 40 是針對 900x900 畫布寫死的，乘上 k = size / 900 等比例縮放。
//
// 畫面沒有每幀清底，鬼的位置用 lerp 慢慢追著滑鼠（x 軸 0.1、y 軸 0.2，
// 兩軸追的速度不同，軌跡才會有弧度），每一幀蓋一次章，殘影就疊成一條路徑。
// 加上點擊重製：殘影會一直累積到整張畫布被填滿，點一下重抽底色、清掉軌跡，
// 重新開始畫一條新的路。
const REFERENCE_SIZE = 900;
const TEXT_SIZE = 40;

export function createGhostTrailSketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    let x = 0;
    let y = 0;

    const resetBackground = () => {
      p.blendMode(p.BLEND);
      p.background(p.random(255));
      p.blendMode(p.DIFFERENCE);
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.textSize(TEXT_SIZE * k);
      resetBackground();

      canvas.mousePressed(() => {
        resetBackground();
      });
    };

    p.draw = () => {
      x = p.lerp(x, p.mouseX, 0.1);
      y = p.lerp(y, p.mouseY, 0.2);

      p.text("\u{1F47B}", x, y);
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveCanvas("GhostTrail", "png");
      }
    };
  };
}
