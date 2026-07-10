import type p5 from "p5";

// 原稿「迷幻綻放」吃固定 900x900 的正方形畫布，改寫成 instance mode，size 從
// 外部傳入。原稿的 draw() 是「生長動畫」：petalCount 每幀 +1 直到隨機決定的
// finalCount 就停止（畫面凍結在最後一幀），這裡保留同樣的行為，並加上點擊
// 重製：綁在 canvas 元素本身，點畫布內重設 petalCount、重新抽一個 finalCount，
// 讓生長動畫重新跑一次。
//
// 原稿的花朵大小（75px）、花瓣中心偏移量（20px）都是針對「900px 見方」寫死的
// 絕對像素值，統一乘上 k = size / REFERENCE_SIZE 等比例縮放；cols/rows 固定
// 10 格是格數不是像素值，不需要縮放。
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

      // 原稿沒有互動（生長到 finalCount 就凍結畫面），這裡加上點擊重製：
      // 綁在 canvas 元素本身（而非 p.mousePressed），點畫布內重設生長進度，
      // 讓動畫從頭重新綻放一次。
      //
      // generateScene() 裡的 background(0) 是在 DIFFERENCE blend mode 下執行
      // 的，跟黑色相減等於沒清除（這正是生長過程中花瓣會疊色的關鍵），所以這裡
      // 必須先切回 BLEND 模式真的清成黑底，再切回 DIFFERENCE，否則重製只會把
      // 新的花疊在舊的最終畫面上，越點越花。
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
