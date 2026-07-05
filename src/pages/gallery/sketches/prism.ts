import type p5 from "p5";

// 原稿「稜鏡」用 windowWidth/windowHeight 畫滿整個瀏覽器視窗（見對話紀錄，
// w=900/h=900 是被註解掉的舊版殘留，實際用的是滿版視窗）；改寫成 instance
// mode，width/height 從外部傳入，讓這件作品可以在展場用滿版寬螢幕呈現。
//
// 原稿的方塊大小（130px）、格線間距（橫 90px、直 100px、起始位移 -50px）都是
// 針對「視窗寬度 ~1872px」寫死的絕對像素值，統一乘上 k = width / REFERENCE_WIDTH
// 等比例縮小，讓構圖不管畫布多寬都保持原本的相對比例。
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

      // 原稿只在 setup() 畫一次靜態構圖（見對話紀錄），這裡加上點擊重製：
      // 綁在 canvas 元素本身（而非 p.mousePressed），這樣只有點在畫布內才會
      // 重新跑一次 drawPrism() 換一組新的色相與剪切排列，點畫布外的頁面不會誤觸。
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
