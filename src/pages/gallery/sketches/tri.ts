import type p5 from "p5";

// 原稿「TRI」用 windowWidth/windowHeight 畫滿整個瀏覽器視窗，且 draw() 在
// frameRate(0.5) 下持續重跑，每隔約 2 秒就整批換一組新的三角形構圖（見對話
// 紀錄）。這裡改寫成 instance mode 並抽出 drawTRI()：setup() 先畫一次，之後
// 改由點擊觸發重製，而不是背景持續自動重繪，避免作品頁在使用者沒有互動時
// 也一直耗用效能。
//
// 原稿的位移量（±200px）、三角形大小（200~400px）都是針對「視窗寬度
// ~1872px」寫死的絕對像素值，統一乘上 k = width / REFERENCE_WIDTH 等比例縮小。
const REFERENCE_WIDTH = 1872;

export function createTRISketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;

    const drawTRI = () => {
      p.background("#333");
      p.frameRate(0.5);
      const rndshape = p.int(p.random(150, 250));
      const rndclr = p.int(p.random(0, 360));

      for (let i = 0; i < rndshape; i++) {
        p.push();
        p.colorMode(p.HSB);
        const c1 = p.color((rndclr + p.noise(i) * 100) % 360, 80, 80);
        p.fill(c1);
        p.stroke(c1);
        p.translate(width / 2, height / 2);
        const rndshear = p.random(-4, 4);
        const x1 = p.int(p.random(-200, 200) * k);
        const y1 = p.int(p.random(-200, 200) * k);
        const trisize = p.int(p.random(200 - i, 400 - i) * k);

        p.push();
        p.shearX(p.PI / rndshear);
        p.stroke("black");
        p.triangle(
          0,
          0,
          x1 - trisize / 2,
          y1 + trisize + height,
          x1 + trisize / 2,
          y1 + trisize + height,
        );
        p.triangle(
          0,
          0,
          x1 - trisize / 2,
          y1 - trisize + height,
          x1 + trisize / 2,
          y1 - trisize + height,
        );
        p.triangle(0, 0, x1 - trisize / 2, y1 + trisize, x1 + trisize / 2, y1 + trisize);
        p.triangle(0, 0, x1 - trisize / 2, y1 - trisize, x1 + trisize / 2, y1 - trisize);
        p.pop();

        p.line(-10, 0, -width / 2, p.random(-200, 200) * k);
        p.line(10, 0, width / 2, p.random(-200, 200) * k);
        p.pop();
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background("#333");
      p.noLoop();
      drawTRI();

      // 綁在 canvas 元素本身（而非 p.mousePressed），這樣只有點在畫布內才會
      // 觸發重製，點畫布外的頁面不會誤觸。
      canvas.mousePressed(() => {
        drawTRI();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("TRI", "png", 1, 1);
      }
    };
  };
}
