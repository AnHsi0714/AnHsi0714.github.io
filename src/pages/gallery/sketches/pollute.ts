import type p5 from "p5";

// 原稿載入海洋背景圖跟雜訊材質圖疊加做色偏，畫布吃圖片原始寬高，非滿版
// 視窗。素材放在 public/images/gallery/pollute/ 用 same-origin 載入：原稿的
// CDN 素材沒有 CORS header，跨網域載入會讓 canvas 被 taint，img.get() 讀
// 像素會丟例外，所以自己放一份。
const OCEAN_URL = "/images/gallery/pollute/ocean.png";
const NOISE_URL = "/images/gallery/pollute/noise2.png";

export function createPolluteSketch(width: number, height: number) {
  return (p: p5) => {
    let img: p5.Image;
    let noiseImg: p5.Image;

    // 取樣格子大小（10px）是針對圖片原始寬度寫死的絕對像素值，用
    // k = 展場畫布寬 / 圖片原始寬度 等比例縮放維持相對比例。
    const drawPollute = () => {
      const k = width / img.width;
      const rsize = 10 * k;

      p.frameRate(0.5);
      p.noStroke();
      p.background("black");
      p.rectMode(p.CENTER);

      const rndclrR = p.int(p.random(0, 150));
      const rndclrG = p.int(p.random(100, 150));
      const rndclrB = p.int(p.random(0, 150));

      for (let i = 0; i < img.width; i += 10) {
        for (let j = 0; j < img.height; j += 10) {
          const c = img.get(i, j);
          p.fill(
            (c[0] + rndclrR) % 256,
            (c[1] + rndclrG) % 256,
            (c[2] + rndclrB) % 256,
          );
          p.rect(i * k + p.random(-2, 2), j * k + p.random(-2, 2), rsize);
        }
      }

      p.push();
      p.blendMode(p.MULTIPLY);
      p.image(noiseImg, 0, 0, width, height);
      p.pop();
    };

    p.preload = () => {
      img = p.loadImage(OCEAN_URL);
      noiseImg = p.loadImage(NOISE_URL);
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background("black");
      p.image(img, 0, 0, width, height);
      drawPollute();

      // 加上點擊重製：綁在 canvas 元素（而非 p.mousePressed）避免點畫布外
      // 誤觸，重新跑 drawPollute() 換一組新色偏。
      canvas.mousePressed(() => {
        drawPollute();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Pollute", "png", 1, 1);
      }
    };
  };
}
