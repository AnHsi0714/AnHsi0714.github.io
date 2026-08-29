import type p5 from "p5";

// 原稿「迷幻綻放」吃固定 900x900 畫布，改寫成 instance mode，size 從外部傳入。
// draw() 是生長動畫：petalCount 每幀 +1 到隨機的 finalCount 就凍結畫面，這裡
// 保留此行為，並加上點擊重製（綁在 canvas 元素本身，重設 petalCount、重抽
// finalCount）。
//
// 花朵大小（75px）、花瓣中心偏移量（20px）是針對「900px 見方」寫死的像素值，
// 乘上 k = size / REFERENCE_SIZE 縮放；cols/rows 固定 10 格是格數不需縮放。
const REFERENCE_SIZE = 900;

export function createBloomOfDeliriumSketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    const flowerSize = 75 * k;
    let petalCount = 5;
    let finalCount = 16;

    const drawFlowerOrSnowflake = (x: number, y: number) => {
      const colorR = p.random(85);
      const colorG = p.random(colorR, colorR + 85);
      const colorB = p.random(colorG, colorG + 85);
      for (let i = 1; i <= petalCount; i++) {
        p.push();
        p.fill(colorR, colorG, colorB);
        p.circle(
          x + 20 * k * p.cos((360 / petalCount) * i),
          y + 20 * k * p.sin((360 / petalCount) * i),
          flowerSize / 3,
        );
        p.pop();
      }
    };

    const generateScene = () => {
      p.background(0);
      const cols = 10;
      const rows = 10;
      const spacingX = size / cols;
      const spacingY = size / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * spacingX + spacingX / 2;
          const y = j * spacingY + spacingY / 2;
          if (j % 2 === 0) {
            // 變斜著排
            x -= flowerSize / 3;
            if (petalCount % 2 === 0) drawFlowerOrSnowflake(x, y);
          } else {
            if (petalCount % 2 === 1) drawFlowerOrSnowflake(x, y);
          }
        }
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.background(0);
      p.blendMode(p.DIFFERENCE);
      p.angleMode(p.DEGREES);
      p.frameRate(5);
      finalCount = p.random(12, 17);

      // 原稿沒有互動，這裡加上點擊重製：綁在 canvas 元素本身，重設生長進度
      // 重新綻放。
      //
      // generateScene() 的 background(0) 在 DIFFERENCE blend mode 下等於沒
      // 清除（這正是花瓣疊色的關鍵），所以重製時要先切回 BLEND 真的清成黑底，
      // 再切回 DIFFERENCE，否則新花會疊在舊的最終畫面上。
      canvas.mousePressed(() => {
        p.blendMode(p.BLEND);
        p.background(0);
        p.blendMode(p.DIFFERENCE);
        petalCount = 5;
        finalCount = p.random(12, 17);
      });
    };

    p.draw = () => {
      if (petalCount < finalCount) {
        petalCount += 1;
        generateScene();
      }
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("BloomOfDelirium", "png", 1, 1);
      }
    };
  };
}
