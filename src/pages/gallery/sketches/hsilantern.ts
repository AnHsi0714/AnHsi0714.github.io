import type p5 from "p5";

// 原稿「西瓜燈」原本吃固定 900x900 的正方形畫布（見對話紀錄，windowWidth/
// windowHeight 那行是被註解掉的舊版殘留）；改寫成 instance mode，size 從外部
// 傳入。原稿只在 setup() 生一次西瓜圖案跟畫一次場景（noLoop() + 沒有互動），
// 這裡加上點擊重製：綁在 canvas 元素本身，點畫布內重新生一顆全新的西瓜燈
// （新的條紋色、切口高度、牙齒數、背景色）。
//
// 原稿的條紋間距（10~15px）、寬度（10~60px）、波浪取樣步距與振幅（10px/5px）、
// 蒂頭線寬（8px）跟彎曲控制點偏移（20~40px）、發光模糊半徑（60px）都是針對
// 「900px 見方」寫死的絕對像素值，統一乘上 k = size / REFERENCE_SIZE 等比例
// 縮放；眼睛、鼻子、嘴巴則原稿就是用半徑 r 的比例算的，不需要額外縮放。
const REFERENCE_SIZE = 900;

interface WatermelonMask extends p5.Graphics {
  cutHeight: number;
  stripeColor: p5.Color;
}

export function createHsiLanternSketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;
    let watermelonMask: WatermelonMask;

    const drawVerticalStripe = (
      gfx: p5.Graphics,
      x: number,
      diameter: number,
      stripeWidth: number,
    ) => {
      const yStep = 10 * k;
      const waveAmp = 5 * k;
      gfx.beginShape();
      for (let y = 0; y <= diameter; y += yStep) {
        const offset = p.sin(y * 0.05 + p.random(1000)) * waveAmp;
        gfx.vertex(x + offset, y);
      }
      for (let y = diameter; y >= 0; y -= yStep) {
        const offset = p.sin(y * 0.05 + p.random(1000)) * waveAmp;
        gfx.vertex(x + stripeWidth + offset, y);
      }
      gfx.endShape(p.CLOSE);
    };

    const drawEye = (gfx: p5.Graphics, r: number, side: -1 | 1) => {
      const eyeSize = r * 0.3;
      const eyeOffsetX = r * 0.4;
      const eyeOffsetY = r * 0.3;
      const ex = r + side * eyeOffsetX;
      const angle = side * 25;
      const startAngle = side === -1 ? p.QUARTER_PI : -p.QUARTER_PI;
      const endAngle = side === -1 ? p.PI + p.QUARTER_PI : p.PI - p.QUARTER_PI;

      // 眼睛底色（黑）、放大一圈的黃色光暈、再蓋一次黑色縮回原本大小，
      // 露出邊緣那圈黃光。
      for (const [glow, sizeScale] of [
        [false, 1],
        [true, 1.2],
        [false, 1],
      ] as const) {
        gfx.push();
        gfx.translate(ex, r - eyeOffsetY);
        gfx.rotate(p.radians(angle));
        gfx.fill(glow ? p.color(255, 220, 0) : p.color(0));
        gfx.arc(
          0,
          0,
          eyeSize * sizeScale,
          eyeSize * sizeScale,
          startAngle,
          endAngle,
          p.PIE,
        );
        gfx.pop();
      }
    };

    const drawNose = (gfx: p5.Graphics, r: number) => {
      const noseSize = r * 0.15;
      // 鼻子同樣是黑／放大黃光／黑三層堆疊，做法跟眼睛一致。
      for (const [glow, sizeScale] of [
        [false, 1],
        [true, 1.2],
        [false, 1],
      ] as const) {
        const s = noseSize * sizeScale;
        gfx.push();
        gfx.translate(r, r);
        gfx.fill(glow ? p.color(255, 220, 0) : p.color(0));
        gfx.triangle(0, -s / 2, -s / 2, s / 2, s / 2, s / 2);
        gfx.pop();
      }
    };

    const drawMouth = (gfx: p5.Graphics, r: number) => {
      const mouthWidth = r * 1.2;
      const mouthHeight = r * 0.3;
      const mouthY = r + r * 0.5;

      let numTeeth = p.int(p.random(3, 9));
      if (numTeeth % 2 === 0) numTeeth -= 1;
      const toothWidth = mouthWidth / numTeeth;
      const mouthGlowScale = 1.1;

      const drawJagged = (glowScale: number) => {
        gfx.push();
        gfx.translate(r - mouthWidth / 2, mouthY);
        gfx.fill(glowScale === 1 ? p.color(0) : p.color(255, 220, 0));
        gfx.beginShape();
        gfx.vertex(0, 0);
        for (let i = 0; i < numTeeth; i++) {
          const x1 = i * toothWidth;
          const x2 = x1 + toothWidth / 2;
          const x3 = x1 + toothWidth;
          const y1 = 0;
          const y2 = i % 2 === 0 ? -mouthHeight : -mouthHeight * 0.6;
          gfx.vertex(x1, y1);
          gfx.vertex(x2, y2 * glowScale);
          gfx.vertex(x3, y1);
        }
        gfx.endShape(p.CLOSE);
        gfx.pop();
      };

      // 發光底層（黃色，放大一點露出邊緣）先畫，黑色嘴巴蓋在上面。
      drawJagged(mouthGlowScale);
      drawJagged(1);
    };

    const drawStemOnCanvas = (
      centerX: number,
      startY: number,
      baseColor: p5.Color,
    ) => {
      p.push();
      p.noFill();
      p.stroke(baseColor);
      p.strokeWeight(8 * k);
      p.strokeCap(p.ROUND);

      const endX = centerX + p.random(-20, 20) * k;
      const endY = startY - 30 * k;

      const controlX1 = centerX + p.random(20, 25) * k;
      const controlY1 = startY - p.random(20, 25) * k;
      const controlX2 = centerX - p.random(35, 40) * k;
      const controlY2 = startY - 30 * k;

      p.bezier(centerX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY);
      p.pop();
    };

    const generateWatermelon = () => {
      const r = size * 0.4;
      const diameter = r * 2;

      const baseR = p.random(255);
      const baseG = p.random(255);
      const baseB = p.random(255);
      const baseColor = p.color(baseR, baseG, baseB);
      const stripeColor =
        p.random() < 0.5
          ? p.color(baseR - 20, baseG - 40, baseB - 20)
          : p.color(baseR + 20, baseG + 40, baseB + 20);

      const stripesGraphics = p.createGraphics(diameter, diameter);
      stripesGraphics.noStroke();
      stripesGraphics.fill(baseColor);
      stripesGraphics.circle(r, r, diameter);

      const spacing = p.int(p.random(10, 15) * k);
      const stripeWidth = p.int(p.random(10, 60) * k);
      for (let x = 0; x < diameter; x += stripeWidth + spacing) {
        stripesGraphics.fill(stripeColor);
        drawVerticalStripe(stripesGraphics, x, diameter, stripeWidth);
      }

      drawEye(stripesGraphics, r, -1);
      drawEye(stripesGraphics, r, 1);
      drawNose(stripesGraphics, r);
      drawMouth(stripesGraphics, r);

      // 遮罩：整顆西瓜先裁成圓形，上下再各切一刀，做出西瓜「切一片」的缺口。
      const maskGraphics = p.createGraphics(diameter, diameter);
      maskGraphics.noStroke();
      maskGraphics.fill(255);
      maskGraphics.circle(r, r, diameter);

      maskGraphics.erase();
      const cutHeight = p.random(40, 80) * k;
      maskGraphics.rect(0, 0, diameter, cutHeight);
      maskGraphics.rect(0, r * 2 - cutHeight, diameter, cutHeight);
      maskGraphics.noErase();

      const stripesMasked = stripesGraphics.get();
      stripesMasked.mask(maskGraphics.get());

      const finalGraphics = p.createGraphics(diameter, diameter) as WatermelonMask;
      finalGraphics.image(stripesMasked, 0, 0);
      finalGraphics.cutHeight = cutHeight;
      finalGraphics.stripeColor = stripeColor;

      watermelonMask = finalGraphics;
    };

    const drawScene = () => {
      const bgcR = p.random(25);
      const bgcG = p.random(25);
      const bgcB = p.random(50);
      p.background(bgcR, bgcG, bgcB);
      p.imageMode(p.CENTER);

      p.push();
      p.drawingContext.shadowBlur = 60 * k;
      p.drawingContext.shadowColor = p.color(255, 220, 0, 180);
      p.image(watermelonMask, size / 2, size / 2);
      p.pop();

      // 補畫蒂頭在畫布上（畫在西瓜外）
      const stemX = size / 2;
      const stemY = size / 2 - watermelonMask.height / 2 + watermelonMask.cutHeight;
      drawStemOnCanvas(stemX, stemY, watermelonMask.stripeColor);
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      generateWatermelon();
      drawScene();

      canvas.mousePressed(() => {
        generateWatermelon();
        drawScene();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Hsi_Lantern", "png", 1, 1);
      }
    };
  };
}
