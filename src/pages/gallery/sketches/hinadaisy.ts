import type p5 from "p5";

// 原稿「雛」吃固定 900x900 的正方形畫布，改寫成 instance mode，size 從外部
// 傳入。原稿只在 setup() 畫一次靜態構圖（見對話紀錄），這裡加上點擊重製：
// 綁在 canvas 元素本身，點畫布內重新洗一次背景色跟花朵排列；雜訊材質圖
// （noiseimg）跟 bat/moontain 一樣只在 setup() 建一次、重製時直接重複使用，
// 不用每次點擊都重算。
//
// 原稿的花朵大小（75px）、花瓣中心偏移量（20px）、格線位移（20px/25px）、
// 花心圓點大小（20px）都是針對「900px 見方」寫死的絕對像素值，統一乘上
// k = size / REFERENCE_SIZE 等比例縮放；雜訊材質的取樣步距（2px）、noise()
// 頻率除數（10、100）沿用其他作品的既有慣例不額外縮放，因為那只影響取樣密度
// 跟顆粒頻率的相對比例，不是實際畫面距離。
const REFERENCE_SIZE = 900;

export function createHinaDaisySketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    const flowerSize = 75 * k;
    const petalCount = 12;
    let noiseimg: p5.Graphics;

    const drawFlowerOverlap = (x: number, y: number) => {
      const petals: p5.Image[] = [];
      for (let i = 1; i <= petalCount; i++) {
        const pg = p.createGraphics(flowerSize, flowerSize);
        pg.angleMode(p.DEGREES);
        pg.noStroke();
        pg.fill(255);
        const px = flowerSize / 2 + 20 * k * p.cos((360 / petalCount) * i);
        const py = flowerSize / 2 + 20 * k * p.sin((360 / petalCount) * i);
        pg.circle(px, py, flowerSize / 3);
        petals.push(pg.get());
      }

      const colorR = 255;
      const colorG = p.random(196, 255);
      const colorB = p.random(196, 255);

      // 任意兩個花瓣取交集，用 GPU mask
      for (let i = 0; i < petals.length; i++) {
        for (let j = i + 1; j < petals.length; j++) {
          const overlap = petals[i].get(); // 原圖
          overlap.mask(petals[j]); // GPU 遮罩
          p.tint(colorR, colorG, colorB, 200);
          p.image(overlap, x - flowerSize / 2, y - flowerSize / 2);
          p.noTint();
        }
      }
    };

    const generateScene = () => {
      const cols = 8;
      const rows = 7;
      const spacingX = size / cols;
      const spacingY = size / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * spacingX + spacingX / 2 + 20 * k;
          const y = j * spacingY + spacingY / 2;
          if (j % 2 === 0) x -= 25 * k;
          drawFlowerOverlap(x, y);
          const colorR = 255;
          const colorG = 255;
          const colorB = p.random(0, 128);
          p.fill(colorR, colorG, colorB);
          p.noStroke();
          p.ellipse(x, y, 20 * k);
        }
      }
    };

    const drawBackground = () => {
      p.background(p.random(0, 128), p.random(64, 128), p.random(96, 128));
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.angleMode(p.DEGREES);
      drawBackground();

      noiseimg = p.createGraphics(size, size);
      noiseimg.loadPixels();
      for (let i = 0; i < size; i += 2) {
        for (let j = 0; j < size; j += 2) {
          noiseimg.set(
            i,
            j,
            p.color(255, p.noise(i / 10, j / 10, (i * j) / 100) * p.random([0, 20, 50])),
          );
        }
      }
      noiseimg.updatePixels();

      generateScene();
      p.image(noiseimg, 0, 0);

      // 原稿只在 setup() 畫一次靜態構圖，這裡加上點擊重製：綁在 canvas 元素
      // 本身（而非 p.mousePressed），這樣只有點在畫布內才會重新洗一次背景色
      // 跟花朵構圖，雜訊材質圖沿用同一份不重算。
      canvas.mousePressed(() => {
        drawBackground();
        generateScene();
        p.image(noiseimg, 0, 0);
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Hina_Daisy", "png", 1, 1);
      }
    };
  };
}
