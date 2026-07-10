import type p5 from "p5";

// 原稿「魚生」吃固定 900x900 的正方形畫布，改寫成 instance mode，size 從外部
// 傳入。原稿有 draw() 持續跑動畫（三角魚群隨 sin 波擺動），這裡保留同樣的
// 連續動畫，並加上點擊重製：綁在 canvas 元素本身，點畫布內重新洗一次魚群
// 排列（背景色、間距抖動、灰階配色）。
//
// 原稿的魚身大小（30px）、格線間距（55px）、擺動振幅（10px）都是針對
// 「900px 見方」寫死的絕對像素值，統一乘上 k = size / REFERENCE_SIZE 等比例
// 縮放，讓構圖不管畫布多大都保持原本的相對比例。
const REFERENCE_SIZE = 900;

interface Fish {
  x: number;
  yBase: number;
  i: number;
  j: number;
  dir: number;
  color: [number, number, number];
}

export function createFishLifeSketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    const fishSize = 30 * k;
    const spaceWidth = 55 * k;
    let t = 0;
    let fishArray: Fish[] = [];
    let bgcColor = 0;

    const setFish = () => {
      fishArray = [];
      for (let i = -1; i <= size / fishSize; i += 1) {
        const x = i * spaceWidth + p.random(-10, 10) * k;
        const direction = i % 2 === 0 ? 1 : -1;
        const hRnd = p.random(40, 80) * k;
        let colorR = 0;
        let colorG = 0;
        let colorB = 0;

        for (let j = -1; j <= size / fishSize; j += 1) {
          const yBase = j * spaceWidth + hRnd;

          if (j % 4 === 1) {
            const rndGrey = p.random(128);
            colorR = rndGrey;
            colorG = rndGrey;
            colorB = rndGrey;
            if (p.random() > 0.95) {
              colorR = p.random(40, 96);
              colorG = p.random(40, 96);
              colorB = p.random(40, 96);
            }
          }

          fishArray.push({
            x,
            yBase,
            i,
            j,
            dir: direction,
            color: [colorR, colorG, colorB],
          });
        }
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.noStroke();
      p.blendMode(p.BLEND);
      bgcColor = p.random(170, 230);
      setFish();

      // 原稿沒有互動（只有連續動畫），這裡加上點擊重製：綁在 canvas 元素本身
      // （而非 p.mousePressed），點畫布內重新洗一次背景色跟魚群排列，動畫本身
      // 持續跑不受影響。
      canvas.mousePressed(() => {
        bgcColor = p.random(170, 230);
        setFish();
      });
    };

    p.draw = () => {
      p.background(bgcColor);
      for (const f of fishArray) {
        const y = f.yBase + f.dir * p.sin(t + f.i * 0.5 + f.j * 0.3) * 10 * k;
        p.fill(f.color[0], f.color[1], f.color[2]);

        if (f.i % 4 === 0) {
          if (f.j % 4 === 0) continue;
          if (f.j % 2 === 0) {
            p.triangle(f.x, y - fishSize * Math.sqrt(3), f.x - fishSize, y, f.x + fishSize, y);
          } else {
            p.triangle(f.x, y, f.x - fishSize, y - fishSize * Math.sqrt(3), f.x + fishSize, y - fishSize * Math.sqrt(3));
          }
        } else if (f.i % 2 === 0) {
          if (f.j % 4 === 1) continue;
          if (f.j % 2 === 0) {
            p.triangle(f.x, y - fishSize * Math.sqrt(3), f.x - fishSize, y, f.x + fishSize, y);
          } else {
            p.triangle(f.x, y, f.x - fishSize, y - fishSize * Math.sqrt(3), f.x + fishSize, y - fishSize * Math.sqrt(3));
          }
        }
      }
      t += 0.01;
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Fish_Life", "png", 1, 1);
      }
    };
  };
}
