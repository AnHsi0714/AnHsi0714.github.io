import type p5 from "p5";

// 原稿「交錯格紋」是 global mode 且無 draw()，只在 setup() 畫一次靜態構圖；
// 改寫成 instance mode，size 從外部傳入。背景色原本只在 setup() 選一次，
// 併進 drawPlaid() 後點擊重製時會跟格紋色組、線條排列一起換新。

export function createPlaidSketch(size: number) {
  return (p: p5) => {
    const backgroundColors = ["#1E1E1E", "#F0F0DC", "#14283C", "#DCC8B4"];

    const colorSets = [
      ["#FF5050", "#FFB450", "#782828", "#FFD080"],
      ["#3C78FF", "#50C8DC", "#283C96", "#90D8FF"],
      ["#50C878", "#DCF064", "#287850", "#A0E890"],
      ["#B450DC", "#F078C8", "#502878", "#D8A0F0"],
    ];

    const drawPlaid = () => {
      p.background(p.random(backgroundColors));

      const colors = p.random(colorSets);
      let lineCount = p.random(10, 100);

      for (let i = 0; i <= size; i++) {
        lineCount--;
        if (lineCount < 0) {
          p.stroke(p.random(colors));
          lineCount = p.random(10, 100);
        }
        if (p.random() < 0.5) continue;
        p.strokeWeight(p.random(2));
        p.line(i, 0, i, size);
      }

      lineCount = p.random(10, 100);
      for (let i = 0; i <= size; i++) {
        lineCount--;
        if (lineCount < 0) {
          p.stroke(p.random(colors));
          lineCount = p.random(10, 100);
        }
        if (p.random() < 0.5) continue;
        p.strokeWeight(p.random(2));
        p.line(0, i, size, i);
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      drawPlaid();

      // 加上點擊重製：綁在 canvas 元素上避免點畫布外誤觸，重新跑 drawPlaid()
      // 換一組新的背景色、格紋色組與線條排列。
      canvas.mousePressed(() => {
        drawPlaid();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Plaid", "png", 1, 1);
      }
    };
  };
}
