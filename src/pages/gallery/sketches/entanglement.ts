import type p5 from "p5";

// 原稿是 global mode（見對話紀錄），這裡改寫成 instance mode 以便掛載/卸載時不
// 互相污染全域命名空間。座標邏輯完全比照原稿，只把 size 從寫死的 800 改成外部
// 傳入，讓畫布能配合展場的聚光燈容器縮放。
export function createEntanglementSketch(size: number) {
  return (p: p5) => {
    p.setup = () => {
      p.createCanvas(size, size);
      p.background("#222");
    };

    p.draw = () => {
      p.background(150, 1);

      p.stroke("white");
      p.strokeWeight(0.5);
      p.frameRate(5);

      const recsize = size * 0.1;
      const recx1 = p.random(0, size - recsize);
      const recy1 = p.random(0, size - recsize);
      p.stroke(p.random(0, 256));
      p.noFill();

      if (p.frameCount % 2 === 0) {
        p.ellipse(recx1, recy1, recsize, recsize);
      } else {
        p.rect(recx1, recy1, recsize, recsize);

        p.line(recx1, recy1, 0, 0);
        p.line(recx1, recy1 + recsize, 0, size);
        p.line(recx1 + recsize, recy1, size, 0);
        p.line(recx1 + recsize, recy1 + recsize, size, size);
      }

      if (p.mouseIsPressed) {
        p.frameRate(20);
        const dsize = p.random(20, 30);
        p.strokeWeight(4);
        p.stroke(p.mouseX, p.mouseY, 0, 200);
        const step = p.int(p.random(1, 7));

        if (step === 1) {
          // |
          p.line(p.mouseX, p.mouseY - dsize, p.mouseX, p.mouseY + dsize);
        } else if (step === 2) {
          // -
          p.line(p.mouseX - dsize, p.mouseY, p.mouseX + dsize, p.mouseY);
        } else if (step === 3) {
          // +
          p.strokeWeight(1);
          p.line(p.mouseX, p.mouseY - dsize, p.mouseX, p.mouseY + dsize);
          p.line(p.mouseX - dsize, p.mouseY, p.mouseX + dsize, p.mouseY);
        } else if (step === 4) {
          // /
          p.line(p.mouseX + dsize, p.mouseY - dsize, p.mouseX - dsize, p.mouseY + dsize);
        } else if (step === 5) {
          // \
          p.line(p.mouseX - dsize, p.mouseY - dsize, p.mouseX + dsize, p.mouseY + dsize);
        } else if (step === 6) {
          // X
          p.strokeWeight(1);
          p.line(p.mouseX + dsize, p.mouseY - dsize, p.mouseX - dsize, p.mouseY + dsize);
          p.line(p.mouseX - dsize, p.mouseY - dsize, p.mouseX + dsize, p.mouseY + dsize);
        }
      }
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Entanglement", "png", 1, 1);
      }
    };
  };
}
