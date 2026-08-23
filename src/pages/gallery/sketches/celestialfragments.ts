import type p5 from "p5";

// 原稿「天體碎片」用 windowWidth/windowHeight 畫滿整個瀏覽器視窗、靠
// windowResized() 在視窗改變大小時重新 generate()（見對話紀錄，截圖是在
// 1912x897 下拍的）；改寫成 instance mode，width/height 從外部傳入、容器大小
// 固定，不需要監聽 resize。
//
// 多邊形的位置、半徑都已經是用 width/height 的比例算出來的，天生就會跟著
// 容器等比例縮放；只有描邊粗細（2px）跟頂點圓點直徑（7px）、還有每個頂點的
// 漂移速度（±0.5px/frame）是原稿針對「視窗寬度 ~1912px」寫死的絕對像素值，
// 統一乘上 k = width / REFERENCE_WIDTH 等比例縮小。
//
// 原稿只有 R 鍵手動重製，這裡比照專案其他作品加上點擊畫布重製。
const REFERENCE_WIDTH = 1912;

const POLYGON_COUNT = 12;

const RAINBOW_COLORS = [
  "#FF003C",
  "#FF7A00",
  "#FFE600",
  "#00D26A",
  "#0066FF",
  "#4B0082",
  "#7A3CFF",
];

const GOLD = "#a98";

const ALPHA_SPEED_MULTIPLIER = 5;

interface PolygonPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  changeTimer: number;
}

interface Polygon {
  points: PolygonPoint[];
  edges: boolean[];
  vertices: boolean[];
  color: string;
  alpha: number;
  alphaSpeed: number;
  alphaDirection: number;
  mode: p5.BLEND_MODE;
}

export function createCelestialFragmentsSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;

    let blendModes: p5.BLEND_MODE[];
    let polygons: Polygon[] = [];

    const createPolygon = (index: number): Polygon => {
      const sides = Math.floor(p.random(5, 10));
      const centerX = p.random(width * 0.15, width * 0.85);
      const centerY = p.random(height * 0.15, height * 0.85);
      const maxRadius = Math.min(width, height) * 0.25;

      const points: PolygonPoint[] = [];
      for (let i = 0; i < sides; i++) {
        const angle = p.random(p.TWO_PI);
        const radius = p.random(maxRadius * 0.3, maxRadius);
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: p.random(-0.5, 0.5) * k,
          vy: p.random(-0.5, 0.5) * k,
          changeTimer: p.random(20, 100),
        });
      }

      points.sort((a, b) => {
        const angleA = Math.atan2(a.y - centerY, a.x - centerX);
        const angleB = Math.atan2(b.y - centerY, b.x - centerX);
        return angleA - angleB;
      });

      const edges: boolean[] = [];
      for (let i = 0; i < sides; i++) {
        edges[i] = p.random() < 0.65;
      }

      const vertices: boolean[] = [];
      for (let i = 0; i < sides; i++) {
        const previousEdge = edges[(i - 1 + sides) % sides];
        const nextEdge = edges[i];
        vertices[i] = previousEdge || nextEdge ? p.random() < 0.7 : false;
      }

      return {
        points,
        edges,
        vertices,
        color: RAINBOW_COLORS[index % RAINBOW_COLORS.length],
        alpha: p.random(0.3, 0.5) * 255,
        alphaSpeed: p.random(0.05, 0.25),
        alphaDirection: p.random() < 0.5 ? 1 : -1,
        mode: p.random(blendModes),
      };
    };

    const generate = () => {
      polygons = [];
      for (let i = 0; i < POLYGON_COUNT; i++) {
        polygons.push(createPolygon(i));
      }
    };

    const updatePolygon = (polygon: Polygon) => {
      for (const point of polygon.points) {
        point.changeTimer--;
        if (point.changeTimer <= 0) {
          point.vx += p.random(-0.2, 0.2) * k;
          point.vy += p.random(-0.2, 0.2) * k;
          point.vx = p.constrain(point.vx, -1 * k, 1 * k);
          point.vy = p.constrain(point.vy, -1 * k, 1 * k);
          point.changeTimer = p.random(30, 120);
        }

        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > width) {
          point.vx *= -1;
          point.x = p.constrain(point.x, 0, width);
        }
        if (point.y < 0 || point.y > height) {
          point.vy *= -1;
          point.y = p.constrain(point.y, 0, height);
        }
      }

      polygon.alpha +=
        polygon.alphaSpeed * polygon.alphaDirection * ALPHA_SPEED_MULTIPLIER;

      const minAlpha = 0.3 * 255;
      const maxAlpha = 0.7 * 255;
      if (polygon.alpha >= maxAlpha || polygon.alpha <= minAlpha) {
        polygon.alphaDirection *= -1;
        polygon.alpha = p.constrain(polygon.alpha, minAlpha, maxAlpha);
        polygon.alphaSpeed = p.random(0.05, 0.25);
      }
    };

    const drawEdges = (points: PolygonPoint[], edges: boolean[]) => {
      p.push();
      p.blendMode(p.BLEND);
      p.stroke(GOLD);
      p.strokeWeight(2 * k);
      p.noFill();

      for (let i = 0; i < points.length; i++) {
        if (!edges[i]) continue;
        const a = points[i];
        const b = points[(i + 1) % points.length];
        p.line(a.x, a.y, b.x, b.y);
      }
      p.pop();
    };

    const drawVertices = (points: PolygonPoint[], vertices: boolean[]) => {
      p.push();
      p.blendMode(p.BLEND);
      p.fill(GOLD);
      p.noStroke();

      for (let i = 0; i < points.length; i++) {
        if (!vertices[i]) continue;
        p.circle(points[i].x, points[i].y, 7 * k);
      }
      p.pop();
    };

    const drawPolygon = (polygon: Polygon) => {
      const polyColor = p.color(polygon.color);
      polyColor.setAlpha(polygon.alpha);

      p.push();
      p.blendMode(polygon.mode);
      p.noStroke();
      p.fill(polyColor);

      p.beginShape();
      for (const point of polygon.points) {
        p.vertex(point.x, point.y);
      }
      p.endShape(p.CLOSE);
      p.pop();

      drawEdges(polygon.points, polygon.edges);
      drawVertices(polygon.points, polygon.vertices);
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.pixelDensity(1);

      blendModes = [p.SCREEN, p.ADD, p.MULTIPLY];
      generate();

      canvas.mousePressed(() => {
        generate();
      });
    };

    p.draw = () => {
      p.background(0);
      for (const polygon of polygons) {
        updatePolygon(polygon);
        drawPolygon(polygon);
      }
    };

    p.keyPressed = () => {
      if (p.key === "r" || p.key === "R") {
        generate();
      }
      if (p.key === "s" || p.key === "S") {
        p.saveCanvas("Celestial_Fragments", "png");
      }
    };
  };
}
