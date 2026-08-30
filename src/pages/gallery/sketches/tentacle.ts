import type p5 from "p5";

// 原稿用 windowWidth/windowHeight 畫滿視窗、無 draw()，只在 setup() 畫一次
// 靜態構圖；改寫成 instance mode，width/height 從外部傳入。
//
// 點位間距（100px 一格）、半徑範圍（150~200px）是針對「視窗寬度 ~1872px」
// 寫死的絕對像素值，展場畫布通常小很多，直接照搬會讓構圖大半畫到看不見的
// 畫布外。統一乘上 k = width / REFERENCE_WIDTH 等比例縮小維持相對比例。
const REFERENCE_WIDTH = 1872;

export function createTentacleSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;

    const drawTentacle = () => {
      p.blendMode(p.BLEND);
      p.background("#222");
      p.blendMode(p.DIFFERENCE);
      p.frameRate(0.5);

      const points = [{ x: 0, y: 0 }];
      for (let i = 1; i <= 9; i++) {
        const tmpx = (i * 2 - 1) * 100 * k;
        const tmpy = height;
        points.push({ x: tmpx, y: tmpy });
      }

      for (let i = 1; i < points.length; i++) {
        let r = p.random(150, 200) * k;
        const r2 = p.map(r, 100 * k, 350 * k, 10 * k, 50 * k);
        let x1 = width - points[i].x;
        let y1 = points[i].y;
        const rndrate = 0.97;
        let countshape = 10;
        p.stroke("black");

        if (rndrate < 1) {
          const clr1 = p.color(p.random(0, 360), 80, 80);
          const clr2 = p.color(p.random(0, 360), 80, 80);
          const rtmp = r;
          while (r >= 10 * k) {
            const ratio = p.map(r, rtmp, 10 * k, 1, 0);
            const midclr = p.lerpColor(clr1, clr2, ratio);
            p.fill(midclr);
            p.rect(x1, y1, r, r2);
            r *= rndrate;
            x1 = p.int(p.random(x1 - r / 2, x1 + r / 2));
            y1 -= countshape * 0.25 * k;
            countshape += 1;
          }
        }
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.rectMode(p.CENTER);
      p.colorMode(p.HSB);
      p.background("#222");
      p.blendMode(p.DIFFERENCE);
      drawTentacle();

      // 加上點擊重製：綁在 canvas 元素（而非 p.mousePressed）避免點畫布外
      // 誤觸，重新跑 drawTentacle() 換一組新觸手構圖。
      canvas.mousePressed(() => {
        drawTentacle();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Tentacle", "png", 1, 1);
      }
    };
  };
}
