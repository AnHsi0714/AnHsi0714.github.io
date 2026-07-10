import type p5 from "p5";

// 原稿「蝙蝠」用 windowWidth/windowHeight 畫滿整個瀏覽器視窗、且沒有 draw()，
// 只在 setup() 畫一次靜態構圖（見對話紀錄）；改寫成 instance mode，
// width/height 從外部傳入。
//
// 原稿的方塊大小（130px）、格線間距（橫 90px、直 100px、起始位移 -50px）都是
// 針對「視窗寬度 ~1872px」寫死的絕對像素值，統一乘上 k = width / REFERENCE_WIDTH
// 等比例縮小，讓構圖不管畫布多大都保持原本的相對比例。
const REFERENCE_WIDTH = 1872;

export function createBatSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    let noiseimg: p5.Graphics;

    const drawBat = () => {
      p.blendMode(p.BLEND);
      p.background("#fff");
      p.frameRate(0.5);
      p.noStroke();
      p.strokeWeight(1);
      const recsize = 130 * k;
      p.blendMode(p.DARKEST);

      for (let j = -50 * k; j < height + 100 * k; j += 90 * k) {
        const clr = p.color(p.noise(j / 100) * 200, p.random(30, 80), 100);
        p.fill(clr);
        let col = 0;
        for (let i = 0; i < width + 100 * k; i += 100 * k, col++) {
          p.push();
          p.translate(i, j);
          p.rotate(90);
          if (col % 2 === 0) {
            p.shearX(45);
          } else {
            p.shearX(-45);
          }
          p.line(0, 0, 0, recsize - 1);
          p.noStroke();
          p.rect(0, 0, recsize, recsize, 10);
          p.pop();
        }
      }

      p.blendMode(p.BLEND);
      p.image(noiseimg, 0, 0);
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background("#fff");
      p.angleMode(p.DEGREES);
      p.rectMode(p.CENTER);

      noiseimg = p.createGraphics(width, height);
      noiseimg.loadPixels();
      for (let i = 0; i < width; i += 5) {
        for (let j = 0; j < height; j += 5) {
          noiseimg.set(
            i,
            j,
            p.color(
              255,
              p.noise(i / 10, j / 10, (i * j) / 50) * p.random([0, 20, 50]),
            ),
          );
        }
      }
      noiseimg.updatePixels();

      drawBat();

      // 原稿只在 setup() 畫一次靜態構圖（見對話紀錄），這裡加上點擊重製：
      // 綁在 canvas 元素本身（而非 p.mousePressed），這樣只有點在畫布內才會
      // 重新跑一次 drawBat() 換一組新的色調與剪切排列，點畫布外的頁面不會誤觸。
      canvas.mousePressed(() => {
        drawBat();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Bat", "png", 1, 1);
      }
    };
  };
}
