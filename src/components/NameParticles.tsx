import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface NameParticlesProps {
  // 寬螢幕一行顯示；窄螢幕（< 640px）每個元素一行，避免字被縮到太小
  lines: string[];
  // 粒子組成的「公仔」用這張照片：上半部（頭）與下半部（衣服）分開替換
  photoSrc: string;
  // 頁面上真正的「About Me」標題。畫面上看到的是粒子組成的字，標題本身只留給螢幕閱讀器；
  // 粒子字沿用它的字型與文字。寬螢幕時它佔住左欄，公仔就放在這一欄
  headingRef: RefObject<HTMLElement | null>;
  // 寬螢幕時右欄的內容容器；依它捲過的比例決定衣服何時換成「About Me」
  contentRef: RefObject<HTMLElement | null>;
}

interface Point {
  x: number;
  y: number;
}

interface PhotoPoint extends Point {
  r: number;
  g: number;
  b: number;
}

// 粒子組成一個「公仔」：上半部是頭（一開始是名字，之後變成照片的頭），
// 下半部是底座（一開始是照片的衣服，之後變成「About Me」）。每次只換一個部位。
interface Particle {
  // 是不是底座（照片最下面那段衣服）的粒子
  shirt: boolean;
  // 進場時從哪裡飛進來（canvas 座標）
  sx: number;
  sy: number;
  // 頭部：組成名字時的位置（canvas 座標）
  nx: number;
  ny: number;
  // 在照片上的位置，相對於照片中心；照片中心每幀依捲動位置計算
  px: number;
  py: number;
  // 照片像素顏色；-1 表示照片沒載入，沿用文字色
  r: number;
  g: number;
  b: number;
  // 底座：組成「About Me」時的位置，相對於照片中心
  ax: number;
  ay: number;
  // 變形途中往側邊彎出去的量，讓路徑是弧線而不是直線
  bend: number;
  // 持續輕微晃動（noise）的相位與頻率，每顆粒子不同，看起來才不會整片同步
  phase: number;
  freq: number;
  // 文字狀態下這顆粒子看不看得到（1 / 0）。粒子比文字的點多時，同一點只留一顆，
  // 其餘的縮到看不見，字才保有一顆顆的空隙
  nameVisible: number;
  aboutVisible: number;
  // 進場與變形的延遲（0–1），讓粒子不要同時到位
  delay: number;
  morphDelay: number;
  nameSize: number;
  photoSize: number;
  aboutSize: number;
}

const ASSEMBLE_MS = 1600;
// 寬螢幕 = About 頁的兩欄版面（Tailwind lg）
const WIDE_QUERY = "(min-width: 1024px)";
// 照片最下面這個比例（以高度算）是衣服，也就是公仔的底座
const SHIRT_SHARE = 0.2;
// 窄螢幕沒有左欄，兩次替換都在固定住的軌道裡完成，用軌道進度的這兩段
const NARROW_PHOTO = [0.1, 0.4] as const;
const NARROW_ABOUT = [0.55, 0.85] as const;
// 寬螢幕：右欄內容捲過畫面中線的比例在這一段時，衣服換成「About Me」
const WIDE_ABOUT = [0.5, 0.7] as const;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const range = (t: number, from: number, to: number) =>
  clamp01((t - from) / (to - from));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function shuffled<T>(items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// 在離屏 canvas 上畫一次，每隔 gap px 取一個點，有墨水的地方就放一顆粒子
function sampleInk(
  width: number,
  height: number,
  gap: number,
  paint: (ctx: CanvasRenderingContext2D) => void,
): Point[] {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.ceil(width));
  off.height = Math.max(1, Math.ceil(height));
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.fillStyle = "#000";
  paint(ctx);
  const { data } = ctx.getImageData(0, 0, off.width, off.height);
  const points: Point[] = [];
  for (let y = 0; y < off.height; y += gap) {
    for (let x = 0; x < off.width; x += gap) {
      if (data[(y * off.width + x) * 4 + 3] < 128) continue;
      // 加一點隨機偏移，不然取樣格線太整齊，字看起來像點陣字
      points.push({
        x: x + (Math.random() - 0.5) * gap * 0.6,
        y: y + (Math.random() - 0.5) * gap * 0.6,
      });
    }
  }
  return points;
}

// 名字：畫面正中間的大字（canvas 座標）
function sampleName(
  lines: string[],
  width: number,
  height: number,
  minGap = 0,
) {
  const narrow = width < 640;
  const textLines = narrow ? lines : [lines.join(" ")];
  const fontFamily = getComputedStyle(document.body).fontFamily;
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return { points: [] as Point[], gap: 4 };
  // 先用 100px 量寬度，再等比例放大到佔畫面寬 86%，同時不超過高度可容納的大小
  measure.font = `700 100px ${fontFamily}`;
  const widest = Math.max(
    ...textLines.map((line) => measure.measureText(line).width),
  );
  const lineHeight = 1.1;
  const fontSize = Math.min(
    (width * 0.86 * 100) / widest,
    (height * 0.45) / (textLines.length * lineHeight),
  );
  // 取樣間距跟著字級走，粒子數大約固定，手機不會多到卡
  const gap = Math.max(3, Math.round(fontSize / 22), minGap);
  const points = sampleInk(width, height, gap, (ctx) => {
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const blockHeight = fontSize * lineHeight * textLines.length;
    textLines.forEach((line, i) => {
      const y =
        height / 2 - blockHeight / 2 + fontSize * lineHeight * (i + 0.5);
      ctx.fillText(line, width / 2, y);
    });
  });
  return { points, gap };
}

// 「About Me」：一行字，縮到放得進底座的框裡，座標相對於框的中心
function sampleAbout(
  text: string,
  font: { family: string; weight: string },
  maxWidth: number,
  maxHeight: number,
  minGap = 0,
) {
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return { points: [] as Point[], gap: 4 };
  measure.font = `${font.weight} 100px ${font.family}`;
  const m100 = measure.measureText(text);
  const inkHeight100 =
    m100.actualBoundingBoxAscent + m100.actualBoundingBoxDescent;
  const fontSize = Math.min(
    (maxWidth * 100) / m100.width,
    (maxHeight * 100) / inkHeight100,
  );
  const gap = Math.max(2, Math.round(fontSize / 20), minGap);
  const scale = fontSize / 100;
  const w = m100.width * scale;
  const ascent = m100.actualBoundingBoxAscent * scale;
  const inkHeight = inkHeight100 * scale;
  const pad = gap * 2;
  const points = sampleInk(w + pad * 2, inkHeight + pad * 2, gap, (ctx) => {
    ctx.font = `${font.weight} ${fontSize}px ${font.family}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, pad, pad + ascent);
  }).map((p) => ({
    x: p.x - pad - w / 2,
    y: p.y - pad - inkHeight / 2,
  }));
  return { points, gap };
}

// 照片等比例縮進給定的框裡，格狀取樣，每格的像素顏色就是那顆粒子的顏色；座標相對於照片中心。
// 證件照是白底，接近純白的像素當背景略過，只留下人的輪廓
function samplePhoto(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
) {
  const scale = Math.min(
    maxHeight / img.naturalHeight,
    maxWidth / img.naturalWidth,
  );
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  // 大約 140 列粒子，夠認得出臉，又不會多到捲動卡頓
  const gap = Math.max(3, Math.round(h / 140));

  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { points: [] as PhotoPoint[], gap, width: w, height: h };
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const points: PhotoPoint[] = [];
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (Math.min(r, g, b) > 236) continue;
      // 只加很小的偏移：看得出是粒子而不是死板的格子，但臉仍然清楚
      points.push({
        x: x - w / 2 + (Math.random() - 0.5) * gap * 0.25,
        y: y - h / 2 + (Math.random() - 0.5) * gap * 0.25,
        r,
        g,
        b,
      });
    }
  }
  return { points, gap, width: w, height: h };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function parseRgb(color: string): [number, number, number] {
  const m = color.match(/\d+(\.\d+)?/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [0, 0, 0];
}

// 把元素從版面上拿掉但保留給螢幕閱讀器（等同 sr-only）
const VISUALLY_HIDDEN: Partial<CSSStyleDeclaration> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

export default function NameParticles({
  lines,
  photoSrc,
  headingRef,
  contentRef,
}: NameParticlesProps) {
  // 減少動態效果時整段不出現，直接看到 About 內容（標題也維持一般文字）
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  // canvas 要用 position: fixed 蓋住整個畫面，但這個元件的外層有 translate，
  // fixed 會變成相對那層定位，所以 portal 到 body。掛載後才建立，預先渲染時不碰 document
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const linesKey = lines.join("\n");

  useEffect(() => setPortalTarget(document.body), []);

  useEffect(() => {
    if (prefersReducedMotion || !portalTarget) return;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const heading = headingRef.current;
    const content = contentRef.current;
    if (!track || !canvas || !heading || !content) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const wideQuery = window.matchMedia(WIDE_QUERY);
    let particles: Particle[] = [];
    // 名字、標題的取樣點；粒子每次要組成文字前重新隨機分配，所以每次出現排法都不一樣
    let namePoints: Point[] = [];
    let aboutPoints: Point[] = [];
    let nameShown = false;
    let aboutShown = false;
    let photoHeight = 0;
    // 照片座標裡衣服開始的那條線（相對於照片中心）
    let shirtLine = 0;
    // 各形狀的取樣間距，用來決定晃動幅度
    let nameGap = 4;
    let photoGap = 4;
    let aboutGap = 4;
    // 每顆粒子的顏色（照片像素色），換主題時重算，畫的時候不用每幀組字串
    let photoColors: string[] = [];
    let image: HTMLImageElement | null = null;
    let width = 0;
    let height = 0;
    let startTime = 0;
    let frame = 0;
    let disposed = false;

    const navHeight = () =>
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
      ) || 0;

    const readColor = () => {
      // canvas 本身套了 text-[var(--color-text)]，computed color 會跟著深淺色主題
      const textColor = getComputedStyle(canvas).color;
      const [tr, tg, tb] = parseRgb(textColor);
      // 文字是亮色 = 深色主題。黑衣服、黑頭髮在深色底上會整片消失，所以暗部往上提一點
      const dark = 0.299 * tr + 0.587 * tg + 0.114 * tb > 128;
      const lift = (c: number) => (dark ? Math.round(55 + c * 0.8) : c);
      photoColors = particles.map((p) =>
        p.r < 0 ? textColor : `rgb(${lift(p.r)},${lift(p.g)},${lift(p.b)})`,
      );
    };

    // 標題在寬螢幕佔住左欄（透明），窄螢幕直接從版面拿掉，避免留下一塊空白
    const applyHeadingStyle = () => {
      heading.removeAttribute("style");
      if (wideQuery.matches) heading.style.opacity = "0";
      else Object.assign(heading.style, VISUALLY_HIDDEN);
    };

    // 兩次替換的進度（0–1），以及照片中心在 canvas 裡的位置
    const progress = (canvasTop: number) => {
      const vh = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const pinnedDistance = rect.height - canvas.clientHeight;
      const pinned =
        pinnedDistance > 0
          ? clamp01((navHeight() - rect.top) / pinnedDistance)
          : 1;

      if (wideQuery.matches) {
        // 寬螢幕：公仔在左欄，頂端跟右欄內容的第一行對齊，跟著內容一起上來，
        // 到畫面中間就停住（像 sticky），區塊結束時再跟著捲走
        const section = (
          heading.parentElement ?? heading
        ).getBoundingClientRect();
        const box = heading.getBoundingClientRect();
        const restTop = canvasTop + (canvas.clientHeight - photoHeight) / 2;
        const photoTop = Math.min(
          Math.max(section.top, restTop),
          section.bottom - photoHeight,
        );
        // 右欄內容已經捲過畫面中線的比例
        const column = content.getBoundingClientRect();
        const contentProgress =
          column.height > 0 ? (vh / 2 - column.top) / column.height : 0;
        return {
          pinned,
          // 名字在內容上升到畫面約 45% 處就換成頭，之後整個公仔跟內容一起上升
          toPhoto: range(section.top, vh, Math.max(restTop, vh * 0.45)),
          toAbout: range(contentProgress, WIDE_ABOUT[0], WIDE_ABOUT[1]),
          photoX: box.left + box.width / 2,
          photoY: photoTop + photoHeight / 2 - canvasTop,
        };
      }
      // 窄螢幕：沒有左欄，公仔在畫面正中間，兩次替換都在固定住的軌道裡完成；
      // 軌道捲完後，公仔跟著內容一起往上捲走
      const scrolledPast = Math.max(0, vh - rect.bottom);
      return {
        pinned,
        toPhoto: range(pinned, NARROW_PHOTO[0], NARROW_PHOTO[1]),
        toAbout: range(pinned, NARROW_ABOUT[0], NARROW_ABOUT[1]),
        photoX: width / 2,
        photoY: vh / 2 - scrolledPast - canvasTop,
      };
    };

    const draw = (now: number) => {
      frame = 0;
      const assemble = startTime ? clamp01((now - startTime) / ASSEMBLE_MS) : 0;
      const canvasTop = canvas.getBoundingClientRect().top;
      const { pinned, toPhoto, toAbout, photoX, photoY } = progress(canvasTop);

      // 文字不在畫面上的時候才重新分配，換位置的瞬間看不到
      if (toPhoto < 1) nameShown = true;
      else if (nameShown) {
        assignName();
        nameShown = false;
      }
      if (toAbout > 0) aboutShown = true;
      else if (aboutShown) {
        assignAbout();
        aboutShown = false;
      }

      ctx.clearRect(0, 0, width, height);
      // 公仔整個捲出畫面上方了就不用再畫
      const offscreen = photoY + photoHeight / 2 < 0;
      if (!offscreen) {
        const t = now / 1000;
        let lastFill = "";
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const enter = easeOutCubic(
            clamp01((assemble - p.delay) / (1 - p.delay)),
          );
          const photoPx = photoX + p.px;
          const photoPy = photoY + p.py;
          let x: number;
          let y: number;
          let size: number;
          let amp: number;
          if (!p.shirt) {
            // 頭：名字 → 照片的頭；之後就留在原地
            const m = easeInOutCubic(
              clamp01((toPhoto - p.morphDelay) / (1 - p.morphDelay)),
            );
            const arc = Math.sin(m * Math.PI) * p.bend;
            x = mix(mix(p.sx, p.nx, enter), photoPx, m) + arc;
            y = mix(mix(p.sy, p.ny, enter), photoPy, m) - arc * 0.5;
            size = mix(p.nameSize * p.nameVisible, p.photoSize, m);
            amp = mix(nameGap * 0.35, photoGap * 0.12, m);
          } else {
            // 底座：名字階段看不到，一直在照片的位置等著；頭快組好時才在原地浮現，
            // 讓完整的照片在捲到位時出現。之後才換成「About Me」
            const appearFrom = 0.55 + p.morphDelay * 0.5;
            const appear = easeOutCubic(
              range(toPhoto, appearFrom, appearFrom + 0.3),
            );
            const m = easeInOutCubic(
              clamp01((toAbout - p.morphDelay) / (1 - p.morphDelay)),
            );
            const arc = Math.sin(m * Math.PI) * p.bend * 0.6;
            // 浮現時從稍低的位置輕輕升上來
            x = mix(photoPx, photoX + p.ax, m) + arc;
            y = mix(photoPy + (1 - appear) * 16, photoY + p.ay, m) - arc * 0.5;
            size = mix(p.photoSize * appear, p.aboutSize * p.aboutVisible, m);
            amp = mix(photoGap * 0.12, aboutGap * 0.35, m);
          }
          if (size < 0.3) continue;
          // noise：文字晃得明顯一點，照片晃得很小，臉才不會糊掉
          x += Math.sin(t * p.freq + p.phase) * amp;
          y += Math.cos(t * p.freq * 0.87 + p.phase * 1.3) * amp;

          // 顏色從頭到尾都是這顆粒子在照片上的像素色
          const fill = photoColors[i];
          if (fill !== lastFill) {
            ctx.fillStyle = fill;
            lastFill = fill;
          }
          ctx.fillRect(x, y, size, size);
        }
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = String(
          assemble * (1 - clamp01(pinned * 30)),
        );
      }
      // 粒子在畫面上就持續重畫（noise 晃動）；捲出畫面後停下，等捲動再喚醒。
      // 分頁切到背景時瀏覽器會自動暫停 requestAnimationFrame
      if (assemble < 1 || !offscreen) requestDraw();
    };

    // 把文字的取樣點打亂後分給負責的那組粒子：名字給頭，「About Me」給底座。
    // 粒子比點多時循環使用，每個點只有第一顆看得到；粒子順序已打亂，看得到的那顆顏色是隨機的
    const assignName = () => {
      const pts = shuffled(namePoints);
      particles
        .filter((p) => !p.shirt)
        .forEach((p, i) => {
          const pt = pts[i % pts.length];
          p.nx = pt.x;
          p.ny = pt.y;
          p.nameVisible = i < pts.length ? 1 : 0;
        });
    };
    const assignAbout = () => {
      const pts = shuffled(aboutPoints);
      particles
        .filter((p) => p.shirt)
        .forEach((p, i) => {
          const pt = pts[i % pts.length];
          p.ax = pt.x;
          p.ay = pt.y;
          p.aboutVisible = i < pts.length ? 1 : 0;
        });
    };

    const requestDraw = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    };

    const layout = () => {
      applyHeadingStyle();
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 照片寬度不超過左欄（寬螢幕）或內容寬（窄螢幕）
      const columnWidth = wideQuery.matches
        ? heading.getBoundingClientRect().width
        : width - 32;
      const photo = image
        ? samplePhoto(image, columnWidth * 0.95, height * 0.8)
        : { points: [] as PhotoPoint[], gap: 4, width: 0, height: 0 };
      let name = sampleName(linesKey.split("\n"), width, height);
      // 照片載入失敗時，公仔就用名字的形狀代替
      const photoPoints: PhotoPoint[] =
        photo.points.length > 0
          ? photo.points
          : name.points.map((p) => ({
              x: p.x - width / 2,
              y: p.y - height / 2,
              r: -1,
              g: -1,
              b: -1,
            }));
      if (photoPoints.length === 0) {
        particles = [];
        return;
      }
      const ys = photoPoints.map((p) => p.y);
      const top = Math.min(...ys);
      const bottom = Math.max(...ys);
      photoHeight = photo.height || bottom - top;
      shirtLine = bottom - (bottom - top) * SHIRT_SHARE;
      const shirtCount = photoPoints.filter((p) => p.y >= shirtLine).length;
      const headCount = photoPoints.length - shirtCount;

      // 「About Me」放進底座的框：寬度跟照片一樣，高度是衣服那一段
      const headingStyle = getComputedStyle(
        (heading.firstElementChild as HTMLElement | null) ?? heading,
      );
      const aboutFont = {
        family: headingStyle.fontFamily,
        weight: headingStyle.fontWeight,
      };
      // 標題的每個子元素是一段文字（About / Me），中間沒有空白字元，要自己補空格
      const aboutText =
        Array.from(heading.children)
          .map((el) => el.textContent?.trim() ?? "")
          .filter(Boolean)
          .join(" ") || "About Me";
      const boxWidth = (photo.width || width * 0.5) * 0.95;
      const boxHeight = (bottom - shirtLine) * 1.1;
      let about = sampleAbout(aboutText, aboutFont, boxWidth, boxHeight);
      // 文字的點比負責的粒子多時，放大取樣間距重取，讓每個點都有粒子、字是完整的
      for (let k = 0; k < 4 && about.points.length > shirtCount; k++) {
        const scale = Math.sqrt(about.points.length / Math.max(1, shirtCount));
        about = sampleAbout(
          aboutText,
          aboutFont,
          boxWidth,
          boxHeight,
          Math.ceil(about.gap * scale),
        );
      }
      for (let k = 0; k < 4 && name.points.length > headCount; k++) {
        const scale = Math.sqrt(name.points.length / Math.max(1, headCount));
        name = sampleName(
          linesKey.split("\n"),
          width,
          height,
          Math.ceil(name.gap * scale),
        );
      }
      // 「About Me」的中心對準衣服那一段的中心
      const aboutCenterY = (shirtLine + bottom) / 2;
      namePoints = name.points;
      aboutPoints = about.points.map((p) => ({
        x: p.x,
        y: p.y + aboutCenterY,
      }));
      nameGap = name.gap;
      photoGap = photo.points.length > 0 ? photo.gap : name.gap;
      aboutGap = about.gap;

      const reach = Math.max(width, height);
      particles = shuffled(
        photoPoints.map((ph) => ({
          shirt: ph.y >= shirtLine,
          sx: Math.random() * width,
          sy: Math.random() * height,
          nx: 0,
          ny: 0,
          px: ph.x,
          py: ph.y,
          r: ph.r,
          g: ph.g,
          b: ph.b,
          ax: 0,
          ay: 0,
          bend: (Math.random() - 0.5) * reach * 0.25,
          phase: Math.random() * Math.PI * 2,
          freq: 0.8 + Math.random() * 1.6,
          nameVisible: 1,
          aboutVisible: 1,
          delay: Math.random() * 0.35,
          morphDelay: Math.random() * 0.3,
          nameSize: name.gap * (0.45 + Math.random() * 0.3),
          // 照片的粒子大小只有些微差異，接近點陣但不死板
          photoSize: photoGap * (0.75 + Math.random() * 0.15),
          // 跟名字一樣，粒子比間距小，字是一顆顆分開的點而不是實心
          aboutSize: about.gap * (0.6 + Math.random() * 0.25),
        })),
      );
      // 名字、About Me 只在有點可以分的時候分配（照片失敗時可能沒有衣服那組）
      if (namePoints.length > 0) assignName();
      if (aboutPoints.length > 0) assignAbout();
      nameShown = false;
      aboutShown = false;
      readColor();
      requestDraw();
    };

    applyHeadingStyle();

    // 等字型、照片都載入完再取樣，不然會用到備用字型的字形
    Promise.all([document.fonts.ready, loadImage(photoSrc)]).then(([, img]) => {
      if (disposed) return;
      image = img;
      layout();
      startTime = performance.now();
      requestDraw();
    });

    let resizeTimer = 0;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 150);
    });
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readColor();
      requestDraw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("scroll", requestDraw, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("scroll", requestDraw);
      heading.removeAttribute("style");
    };
  }, [
    prefersReducedMotion,
    linesKey,
    photoSrc,
    headingRef,
    contentRef,
    portalTarget,
  ]);

  if (prefersReducedMotion) return null;

  return (
    <>
      {/* 全寬、抵銷 main 的上 padding；軌道比一個畫面高，多出來的捲動距離讓名字停留。
          窄螢幕兩次替換都在這段完成，所以比較長 */}
      <div
        ref={trackRef}
        aria-hidden="true"
        className="relative left-1/2 -mt-8 mb-8 h-[calc(360dvh-var(--nav-h,4rem))] w-screen -translate-x-1/2 lg:h-[calc(150dvh-var(--nav-h,4rem))]"
      >
        <div
          className="sticky"
          style={{
            top: "var(--nav-h, 0px)",
            height: "calc(100dvh - var(--nav-h, 4rem))",
          }}
        >
          <div
            ref={hintRef}
            className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center text-[var(--color-text-muted)] opacity-0"
          >
            <FontAwesomeIcon icon={faChevronDown} className="animate-bounce" />
          </div>
        </div>
      </div>
      {portalTarget &&
        createPortal(
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 z-40 block w-full text-[var(--color-text)]"
            style={{
              top: "var(--nav-h, 0px)",
              height: "calc(100dvh - var(--nav-h, 4rem))",
            }}
          />,
          portalTarget,
        )}
    </>
  );
}
