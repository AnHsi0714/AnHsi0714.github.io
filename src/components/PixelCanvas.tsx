import { useEffect, useRef } from "react";
import type { PixelData } from "../types/friends";

interface PixelCanvasProps {
  data: PixelData;
  className?: string;
}

// 把稀疏的 pixels 陣列重繪成圖（見 docs/ARCHITECTURE.md §6.1、§7：資料本身就是圖，不存縮圖檔）。
// canvas 內部解析度等於網格數，靠 CSS 放大 + pixelated 呈現方塊感。
export default function PixelCanvas({ data, className }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, data.grid, data.grid);
    for (const { x, y, color } of data.pixels) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={data.grid}
      height={data.grid}
      className={className}
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
