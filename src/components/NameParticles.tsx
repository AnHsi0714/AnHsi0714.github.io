import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface NameParticlesProps {
  // 寬螢幕一行顯示；窄螢幕（< 640px）每個元素一行，避免字被縮到太小
  lines: string[];
}

interface Particle {
  // 組成文字時的位置（CSS px）
  tx: number;
  ty: number;
  // 進場時從哪裡飛進來
  sx: number;
  sy: number;
  // 捲動散開時往哪個方向、飛多遠
  dx: number;
  dy: number;
  // 進場的延遲（0–1，佔整段進場時間的比例），讓粒子不要同時到位
  delay: number;
  size: number;
}

const ASSEMBLE_MS = 1600;
// 捲動軌道的總高度（以可視高度為單位）。畫面固定在原地的那段捲動距離 = TRACK_VH − 1 個畫面
const TRACK_VH = 1.6;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInCubic = (t: number) => t ** 3;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// 把文字畫到離屏 canvas 上，每隔 gap px 取一個點，有墨水的地方就放一顆粒子
function sampleText(
  lines: string[],
  width: number,
  height: number,
): Particle[] {
  const narrow = width < 640;
  const textLines = narrow ? lines : [lines.join(" ")];
  const off = document.createElement("canvas");
  off.width = Math.ceil(width);
  off.height = Math.ceil(height);
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  const fontFamily = getComputedStyle(document.body).fontFamily;
  // 先用 100px 量寬度，再等比例放大到佔畫面寬 86%，同時不超過高度可容納的大小
  ctx.font = `700 100px ${fontFamily}`;
  const widest = Math.max(
    ...textLines.map((line) => ctx.measureText(line).width),
  );
  const lineHeight = 1.1;
  const fontSize = Math.min(
    (width * 0.86 * 100) / widest,
    (height * 0.6) / (textLines.length * lineHeight),
  );
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  const blockHeight = fontSize * lineHeight * textLines.length;
  textLines.forEach((line, i) => {
    const y = height / 2 - blockHeight / 2 + fontSize * lineHeight * (i + 0.5);
    ctx.fillText(line, width / 2, y);
  });

  // 取樣間距跟著字級走，粒子數大約固定，手機不會多到卡
  const gap = Math.max(3, Math.round(fontSize / 22));
  const { data } = ctx.getImageData(0, 0, off.width, off.height);
  const reach = Math.max(width, height);
  const particles: Particle[] = [];
  for (let y = 0; y < off.height; y += gap) {
    for (let x = 0; x < off.width; x += gap) {
      if (data[(y * off.width + x) * 4 + 3] < 128) continue;
      const angle = Math.random() * Math.PI * 2;
      const distance = reach * (0.35 + Math.random() * 0.9);
      particles.push({
        // 加一點隨機偏移，不然取樣格線太整齊，字看起來像點陣字
        tx: x + (Math.random() - 0.5) * gap * 0.6,
        ty: y + (Math.random() - 0.5) * gap * 0.6,
        sx: Math.random() * width,
        sy: Math.random() * height,
        dx: Math.cos(angle) * distance,
        // 散開時整體稍微往上飄，像被捲動帶走
        dy: Math.sin(angle) * distance - height * 0.3,
        delay: Math.random() * 0.35,
        size: gap * (0.45 + Math.random() * 0.3),
      });
    }
  }
  return particles;
}

export default function NameParticles({ lines }: NameParticlesProps) {
  // 減少動態效果時整段不出現，直接看到 About 內容
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const linesKey = lines.join("\n");

  useEffect(() => {
    if (prefersReducedMotion) return;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    if (!track || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let color = "";
    let startTime = 0;
    let frame = 0;
    let disposed = false;

    const readColor = () => {
      // canvas 本身套了 text-[var(--color-text)]，computed color 會跟著深淺色主題
      color = getComputedStyle(canvas).color;
    };

    // 0 = 剛進頁面，1 = 粒子完全散開。軌道頂端一開始就貼在 NavBar 下緣，所以從 --nav-h 起算。
    // 散開不在畫面固定的那段就結束，而是延續到畫面往上捲出一半，
    // 這樣粒子還在飛的時候 About 內容就從下方接上來，中間不會出現一整個空白畫面
    const scrollProgress = () => {
      const rect = track.getBoundingClientRect();
      const navHeight =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-h",
          ),
        ) || 0;
      const pinned = rect.height - canvas.clientHeight;
      const distance = pinned + canvas.clientHeight * 0.5;
      return distance > 0 ? clamp01((navHeight - rect.top) / distance) : 0;
    };

    const draw = (now: number) => {
      frame = 0;
      const assemble = startTime ? clamp01((now - startTime) / ASSEMBLE_MS) : 0;
      const scatter = easeInCubic(scrollProgress());

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.globalAlpha = 1 - scatter;
      if (scatter < 1) {
        for (const p of particles) {
          const local = easeOutCubic(
            clamp01((assemble - p.delay) / (1 - p.delay)),
          );
          const x = p.sx + (p.tx - p.sx) * local + p.dx * scatter;
          const y = p.sy + (p.ty - p.sy) * local + p.dy * scatter;
          ctx.fillRect(x, y, p.size, p.size);
        }
      }
      ctx.globalAlpha = 1;

      if (hintRef.current) {
        hintRef.current.style.opacity = String(
          assemble * (1 - clamp01(scatter * 6)),
        );
      }
      // 進場還沒結束就繼續畫；之後只在捲動、縮放、換主題時才重畫，靜止時不佔 CPU
      if (assemble < 1) requestDraw();
    };

    const requestDraw = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    };

    const layout = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = sampleText(linesKey.split("\n"), width, height);
      readColor();
      requestDraw();
    };

    // 等字型載入完再取樣，不然會用到備用字型的字形
    document.fonts.ready.then(() => {
      if (disposed) return;
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
    };
  }, [prefersReducedMotion, linesKey]);

  if (prefersReducedMotion) return null;

  return (
    // 全寬、抵銷 main 的上 padding；軌道比一個畫面高，多出來的捲動距離用來讓粒子散開
    <div
      ref={trackRef}
      aria-hidden="true"
      className="relative left-1/2 -mt-8 mb-8 w-screen -translate-x-1/2"
      style={{ height: `calc(${TRACK_VH * 100}dvh - var(--nav-h, 4rem))` }}
    >
      <div
        className="sticky overflow-hidden"
        style={{
          top: "var(--nav-h, 0px)",
          height: "calc(100dvh - var(--nav-h, 4rem))",
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full text-[var(--color-text)]"
        />
        <div
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center text-[var(--color-text-muted)] opacity-0"
        >
          <FontAwesomeIcon icon={faChevronDown} className="animate-bounce" />
        </div>
      </div>
    </div>
  );
}
