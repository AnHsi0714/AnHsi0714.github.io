import type p5 from "p5";

// 原稿「POP」用 windowWidth/windowHeight 畫滿整個瀏覽器視窗（見對話紀錄），
// 這裡改成吃外部傳入的 width/height，讓畫布落在展場的聚光燈容器裡。
//
// 泡泡大小（30~100px）、位移速度（±20px/frame）、文字大小（120px）都是針對
// 「視窗寬度 ~1872px」寫死的絕對像素值，展場畫布通常小很多，直接照搬會讓泡泡
// 相對畫布顯得過大過密。統一乘上 k = width / REFERENCE_WIDTH 等比例縮小。
const REFERENCE_WIDTH = 1872;

export function createPopSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    let popCount = 0;
    const popX: number[] = [];
    const popY: number[] = [];
    const popType: number[] = [];
    const popSize: number[] = [];
    let switchNight = -1;

    p.setup = () => {
      p.createCanvas(width, height);
      p.background("#222");
      popCount = p.int(p.random(30, 80));
      for (let i = 0; i < popCount; i++) {
        popX.push(p.random(10 * k, width - 10 * k));
        popY.push(p.random(10 * k, height - 10 * k));
        popType.push(p.random() < 0.5 ? 0 : 1);
        popSize.push(p.int(p.random(30, 100) * k));
      }
      p.textSize(120 * k);
      p.textAlign(p.CENTER);
      p.rectMode(p.CENTER);
      p.colorMode(p.HSB);
    };

    p.mousePressed = () => {
      switchNight *= -1;
      popCount = p.int(p.random(50, 80));
      for (let i = 0; i < popCount; i++) {
        popX[i] = p.random(10 * k, width - 10 * k);
        popY[i] = p.random(10 * k, height - 10 * k);
        popType[i] = p.random() < 0.5 ? 0 : 1;
        popSize[i] = p.int(p.random(30, 100) * k);
      }
    };

    p.draw = () => {
      p.blendMode(p.BLEND);
      if (switchNight === 1) {
        p.background("white");
        p.blendMode(p.MULTIPLY);
        p.stroke("#222");
      } else {
        p.background("#222");
        p.blendMode(p.SCREEN);
        p.stroke("white");
      }

      p.fill("white");
      p.text(popCount, width / 2, height / 2);

      p.strokeWeight(2 * k);
      p.frameRate(10);

      for (let i = 0; i < popCount; i++) {
        if (popX[i] < 0) popX[i] = width - 10 * k;
        if (popX[i] > width) popX[i] = 10 * k;
        if (popY[i] < 0) popY[i] = height - 10 * k;
        if (popY[i] > height) popY[i] = 10 * k;
        popX[i] = popX[i] + p.random(-20, 20) * k;
        popY[i] = popY[i] + p.random(-20, 20) * k;
      }

      for (let i = 0; i < popCount; i++) {
        const h = p.map(i, 0, popCount, 0, 360);
        p.fill(h, 50, 100);
        if (popType[i] === 0) {
          p.ellipse(popX[i], popY[i], popSize[i]);
        } else {
          const rectBorder = p.int(p.random(0, 20) * k);
          p.rect(popX[i], popY[i], popSize[i], popSize[i], rectBorder);
        }
      }
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("POP", "png", 1, 1);
      }
    };
  };
}
