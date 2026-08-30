import type p5 from "p5";

// 原稿「稜鏡」用 windowWidth/windowHeight 畫滿視窗（w=900/h=900 是被註解掉的舊版
// 殘留，實際用滿版視窗）；改寫成 instance mode，width/height 從外部傳入。
//
// 方塊大小（130px）、格線間距（橫 90px、直 100px、起始位移 -50px）是原稿針對
// 「視窗寬 ~1872px」寫死的像素值，統一乘上 k = width / REFERENCE_WIDTH 等比例縮放。
const REFERENCE_WIDTH = 1872;

export function createPrismSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;

    const drawPrism = () => {
      p.blendMode(p.BLEND);
      p.background("white");
      p.frameRate(0.5);
      p.noStroke();
      p.strokeWeight(1);
      const recsize = 130 * k;
      p.blendMode(p.DARKEST);
      const rndclr = p.int(p.random(0, 360));

      for (let j = -50 * k; j < height + 100 * k; j += 90 * k) {
        const clr1 = p.color(
          (rndclr + p.noise(j / 100) * 250) % 255,
          p.random(0, 250),
          80,
        );
        p.fill(clr1);
        let col = 0;
        for (let i = 0; i < width + 100 * k; i += 100 * k, col++) {
          p.push();
          if (col % 2 === 0) {
            p.translate(i, j);
            p.rotate(90);
            p.shearX(45);
            p.line(0, 0, 0, recsize - 1);
            p.noStroke();
            p.rect(0, 0, recsize, recsize);
          } else {
            p.translate(i, height - j);
            p.rotate(90);
            p.shearX(-45);
            p.line(0, 0, 0, recsize - 1);
            p.noStroke();
            p.rect(0, 0, recsize, recsize);
          }
          p.pop();
        }
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background("#fff");
      p.angleMode(p.DEGREES);
      p.rectMode(p.CENTER);
      drawPrism();

      // 加上點擊重製：綁在 canvas 元素上（而非 p.mousePressed）避免點畫布外誤觸，
      // 重新跑 drawPrism() 換一組新的色相與剪切排列。
      canvas.mousePressed(() => {
        drawPrism();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Prism", "png", 1, 1);
      }
    };
  };
}
