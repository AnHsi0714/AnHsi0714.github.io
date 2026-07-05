import type p5 from "p5";

// 原稿「山與月」是 global mode 且沒有 draw()，只在 setup() 畫一次靜態構圖
// （見對話紀錄）；改寫成 instance mode 時保留同樣的行為，size 從外部傳入。
export function createMoontainSketch(width: number) {
  return (p: p5) => {
    const size = width;
    let noiseimg: p5.Graphics;
    const colorScheme = [
      "#424200",
      "#003E3E",
      "#9F5000",
      "#EFD28D",
      "#f3f3f3",
      "#6C3365",
      "#613030",
    ];

    const drawMoontain = () => {
      p.blendMode(p.BLEND);
      p.background(p.random(colorScheme));
      p.frameRate(0.5);

      const difference = p.random(0, 30);

      let rndshape = p.random(4, 11);
      for (let i = 0; i < rndshape; i++) {
        p.stroke(p.random(0, 256), 100);
        const x1 = p.random(0 - difference, size + difference);
        const y1 = p.random(0 - difference, size + difference);
        const x2 = p.random(0 - difference, size + difference);
        const y2 = p.random(0 - difference, size + difference);
        p.line(x1, y1, x2, y2);
      }

      rndshape = p.random(3, 7);
      p.stroke("gray");
      for (let i = 0; i < rndshape; i++) {
        p.fill(p.random(0, 128), 200);
        const rndtype = p.int(p.random(3, 6));

        if (rndtype === 3) {
          const x1 = p.random(0 - difference, size * 0.5);
          const y1 = size;
          const x2 = p.random(size * 0.5, size + difference);
          const y2 = size;
          const x3 = p.random(x1, x2);
          const y3 = p.random(size * 0.2, size);
          p.triangle(x1, y1, x2, y2, x3, y3);
        } else if (rndtype === 4) {
          const x1 = p.random(0 - difference, size * 0.5);
          const y1 = size;
          const x2 = p.random(size * 0.5, size + difference);
          const y2 = size;
          const x3 = p.random((x1 + x2) * 0.5, x2);
          const y3 = p.random(size * 0.2, size * 0.8);
          const x4 = p.random(x1, (x1 + x2) * 0.5);
          const y4 = p.random(size * 0.2, size * 0.8);
          p.beginShape();
          p.vertex(x1, y1);
          p.vertex(x2, y2);
          p.vertex(x3, y3);
          p.vertex(x4, y4);
          p.endShape(p.CLOSE);
        } else if (rndtype === 5) {
          const x1 = p.random(0 - difference, size * 0.5);
          const y1 = size;
          const x2 = p.random(size * 0.5, size + difference);
          const y2 = size;
          const x3 = p.random((x1 + x2) * 0.5, x2);
          const y3 = p.random(size * 0.2, size * 0.8);
          const x5 = p.random(x1, (x1 + x2) * 0.5);
          const y5 = p.random(size * 0.2, size * 0.8);
          const x4 = p.random(x5, x3);
          const y4 = p.random(size * 0.2, size * 0.8);
          p.beginShape();
          p.vertex(x1, y1);
          p.vertex(x2, y2);
          p.vertex(x3, y3);
          p.vertex(x4, y4);
          p.vertex(x5, y5);
          p.endShape(p.CLOSE);
        }
      }

      const moonsize = p.random(30, 150);
      p.fill(p.random(128, 256), 210);
      const mx = p.random(moonsize, size - moonsize);
      const my = p.random(moonsize, size * 0.5);
      p.ellipse(mx, my, moonsize, moonsize);

      p.image(noiseimg, 0, 0);
    };

    p.setup = () => {
      p.createCanvas(size, size);
      p.background("#222");

      noiseimg = p.createGraphics(size, size);
      noiseimg.loadPixels();
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          noiseimg.set(
            i,
            j,
            p.color(
              255,
              p.noise(i / 10, j / 10, (i * j) / 50) * p.random([0, 20, 50]),
            ),
          );
        }
      }
      noiseimg.updatePixels();

      drawMoontain();
    };

    // 原稿只在 setup() 畫一次靜態構圖（見對話紀錄），這裡加上點擊重製：
    // 點畫布就重新跑一次 drawMoontain() 換一組新的山型／月亮／裂紋。
    p.mousePressed = () => {
      drawMoontain();
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Moontain", "png", 1, 1);
      }
    };
  };
}
