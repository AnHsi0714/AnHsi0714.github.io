import type p5 from "p5";

// 原稿「海底城市」吃固定 900x900 的正方形畫布，改寫成 instance mode，size
// 從外部傳入。原稿只在 setup() 生一次構圖（noLoop() + 沒有互動），這裡加上
// 點擊重製：綁在 canvas 元素本身，點畫布內重新洗一次全新的色塊排列。
//
// 原稿的格線邊長（area = width*2 / cellCount）本來就跟畫布寬度成比例，不需要
// 額外縮放；只有 edgeToEdgeLines 的線條間距（5~20px）是針對「900px 見方」寫死
// 的絕對像素值，統一乘上 k = size / REFERENCE_SIZE 等比例縮放。
const REFERENCE_SIZE = 900;

const colors = ["#4DE2D4", "#4BEAFB", "#00A6A9"];
const sides: Array<"v" | "h" | "both"> = ["v", "h", "both"];

export function createOceanCitySketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;

    const edgeToEdgeLines = (
      w: number,
      h: number,
      step: number,
      side: "c" | "r" | "l",
      mode: "v" | "h" | "both",
    ) => {
      p.noFill();
      if (mode === "both" || mode === "h") {
        if (side === "c") {
          for (let y = -h / 2; y <= h / 2; y += step) {
            p.line(-w / 2, y, w / 2, y);
          }
        } else if (side === "r") {
          for (let x = -w / 2; x <= 0; x += step) {
            p.line(x, -h / 2, x, h / 2);
          }
        } else {
          for (let y = -h / 2; y <= 0; y += step) {
            p.line(-w / 2, y, w / 2, y);
          }
        }
      }
      if (mode === "both" || mode === "v") {
        if (side === "c") {
          for (let x = -w / 2; x <= w / 2; x += step) {
            p.line(x, -h / 2, x, h / 2);
          }
        } else if (side === "r") {
          for (let y = -h / 2; y <= h / 2; y += step) {
            p.line(-w / 2, y, 0, y);
          }
        } else {
          for (let x = -w / 2; x <= w / 2; x += step) {
            p.line(x, -h / 2, x, 0);
          }
        }
      }
    };

    const drawPrismBlock = (x: number, y: number, w: number, h: number, d: number) => {
      p.push();
      // 底面
      p.translate(x, y);
      p.fill(p.random(colors));
      p.noStroke();
      p.rect(0, 0, w, h);
      p.stroke(p.random(["#333", "#fff"]));
      edgeToEdgeLines(w, h, p.random(5, 20) * k, "c", p.random(sides));

      // 讓矩形變成「右斜牆」
      p.push();
      p.translate(-w / 2, 0);
      p.shearY(45);
      p.fill(p.random(colors));
      p.noStroke();
      p.rect(-d / 2, 0, d, h);
      p.stroke(p.random(["#333", "#fff"]));
      edgeToEdgeLines(d + w, h, p.random(5, 20) * k, "r", p.random(sides));
      p.pop();

      // 讓矩形變成「左斜牆」
      p.push();
      p.translate(0, -h / 2);
      p.shearX(45);
      p.fill(p.random(colors));
      p.noStroke();
      p.rect(0, -d / 2, w, d);
      p.stroke(p.random(["#333", "#fff"]));
      edgeToEdgeLines(w, d + h, p.random(5, 20) * k, "l", p.random(sides));
      p.pop();
      p.pop();
    };

    const drawOceanCity = () => {
      p.background("#333");
      p.push();
      p.translate(size / 2, size / 2);

      // 未旋轉會像蜂窩格子
      p.rotate(30);

      // 旋轉後的格子「壓斜」，形成類似菱形的格子。
      // 從正方形轉換成「斜方形」的關鍵。
      p.shearX(-30);
      p.scale(Math.sqrt(2) / Math.sqrt(3), Math.sqrt(2) / 2);
      p.translate(-size / 2, -size / 2);

      const area = size * 2;
      const cellCount = 9;
      const cellSize = area / cellCount;
      for (let i = 0; i <= cellCount; i++) {
        for (let j = 0; j <= cellCount; j++) {
          const x = i * cellSize + cellSize / 2 + (size - area) / 2;
          const y = j * cellSize + cellSize / 2 + (size - area) / 2;
          const side = cellSize / 2;
          const num = i + j + 2;
          if (num % 3 === 0) {
            drawPrismBlock(x - side / 2, y + side / 2, side, side, side);
            drawPrismBlock(x + side / 2, y - side / 2, side, side, side);
          } else if (num % 3 === 1) {
            drawPrismBlock(x + side / 2, y + side / 2, side, side, side);
          } else if (num % 3 === 2) {
            drawPrismBlock(x - side / 2, y - side / 2, side, side, side);
          }
        }
      }
      p.pop();
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.angleMode(p.DEGREES);
      p.rectMode(p.CENTER);
      drawOceanCity();

      // 原稿只在 setup() 畫一次靜態構圖，這裡加上點擊重製：綁在 canvas 元素
      // 本身（而非 p.mousePressed），這樣只有點在畫布內才會重新洗一次構圖。
      canvas.mousePressed(() => {
        drawOceanCity();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Ocean_City", "png", 1, 1);
      }
    };
  };
}
