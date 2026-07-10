import type p5 from "p5";

// 原稿「TRII」用 windowWidth/2 x windowHeight 的畫布（見對話紀錄），且只在
// setup() 畫一次靜態構圖，沒有 draw()；改寫成 instance mode，width/height
// 從外部傳入。
//
// 原稿的位移量（±200px）、三角形大小（10~250px）都是針對「畫布寬 ~936px
// （視窗寬度 1872px 的一半）」寫死的絕對像素值，統一乘上
// k = width / REFERENCE_WIDTH 等比例縮小。
const REFERENCE_WIDTH = 1872 / 2;

export function createTRIISketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;

    const drawTRII = () => {
      p.background("#333");
      p.frameRate(0.5);
      const rndshape = p.int(p.random(100, 200));
      const rndclr = p.int(p.random(0, 360));

      for (let i = 0; i < rndshape; i++) {
        p.push();
        p.colorMode(p.HSB);
        const c1 = p.color((rndclr + p.noise(i) * 100) % 360, 75, 80);
        p.fill(c1);
        p.stroke(c1);
        p.translate(width / 2, height / 2);
        const x1 = p.int(p.random(-200, 200) * k);
        const y1 = p.int(p.random(-200, 200) * k);
        let trisize: number;
        if (i < rndshape / 1.1) {
          trisize = p.int(p.random(100, 250) * k);
        } else {
          trisize = p.int(p.random(10, 25) * k);
        }

        p.push();
        p.stroke("black");
        if (p.random() < 0.5) {
          p.triangle(x1, y1, x1 - trisize / 2, y1 + trisize, x1 + trisize / 2, y1 + trisize);
        } else {
          p.triangle(x1, y1, x1 - trisize / 2, y1 - trisize, x1 + trisize / 2, y1 - trisize);
        }
        p.pop();
        p.pop();
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background("#333");
      drawTRII();

      // 原稿只在 setup() 畫一次靜態構圖（見對話紀錄），這裡加上點擊重製：
      // 綁在 canvas 元素本身（而非 p.mousePressed），這樣只有點在畫布內才會
      // 重新跑一次 drawTRII() 換一組新的三角形排列，點畫布外的頁面不會誤觸。
      canvas.mousePressed(() => {
        drawTRII();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("TRII", "png", 1, 1);
      }
    };
  };
}
