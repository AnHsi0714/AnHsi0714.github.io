import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import type { Artwork } from "../../types/content";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const SPEED = 1; // px / frame
const RESUME_DELAY = 400; // ms，拖曳／滾輪／hover 結束後多久恢復自動橫移

// 跟 GalleryGrid.module.scss 的 .wallRow[data-row="1"/"2"] margin-left 15%／7%
// 對應：那組 margin 是磚牆式交錯排列的視覺效果（避免每列畫框對齊成直向格線），
// 但單靠 CSS margin 會讓這幾列在剛進場時左側露出一截空牆，要等自動橫移把
// margin 「走」完才會填滿，進場那幾秒會看到明顯的空白。這裡在初始化跟每次
// 重新分配作品時，直接把該列的位移量預先推進到等同 margin 的距離，讓視覺上
// 從第一幀就已經是填滿的錯位效果，不需要真的播放「走過去」的過程。
const ROW_STAGGER_RATIOS = [0, 0.15, 0.07];

export interface WallSlot {
  artwork: Artwork;
  imageSrc: string;
}

// 每件作品只出現一份：捲出左緣就從隊伍前端移走、扣掉等量位移（畫面不跳動），
// 接到目前最短的那一列尾端排隊，同時换下一張截圖。
function pickRandomImageIndex(artwork: Artwork) {
  return Math.floor(Math.random() * artwork.images.length);
}

function distributeInitialRows(artworks: Artwork[], rowCount: number): WallSlot[][] {
  const rows: WallSlot[][] = Array.from({ length: rowCount }, () => []);
  artworks.forEach((artwork, i) => {
    rows[i % rowCount].push({
      artwork,
      imageSrc: artwork.images[pickRandomImageIndex(artwork)],
    });
  });
  return rows;
}

export function useWallAutoScroll(artworks: Artwork[], rowCount: number) {
  const wallRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const distancesRef = useRef<number[]>([]);
  // 每列的錯位下限（等同該列的 CSS margin 換算成 px）：初始化時當作
  // distancesRef 的起始值，往回捲（wheel）時也拿它當夾住的下限，避免捲回
  // 超過起點、重新露出那截交錯用的空牆。
  const staggerOffsetsRef = useRef<number[]>([]);
  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartDistancesRef = useRef<number[]>([]);
  const draggedRef = useRef(false);

  const [rows, setRows] = useState<WallSlot[][]>(() =>
    distributeInitialRows(artworks, rowCount),
  );
  // rows state 更新是非同步的，回收當下需要即時讀最新內容，額外鏡射一份。
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // 作品數量太少、內容撐不滿展牆時整批凍結＋放大（見 CSS .wall[data-sparse]）。
  const sparseRef = useRef(false);

  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const setRowRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      rowRefs.current[index] = el;
    },
    [],
  );

  const applyTransforms = useCallback(() => {
    rowRefs.current.forEach((row, i) => {
      const distance = distancesRef.current[i] ?? 0;
      if (!row) return;
      row.style.transform = `translateX(${-distance}px)`;
    });
  }, []);

  // 內容量最少的那一列夠不夠寬，決定要不要進 sparse 模式（判斷而已，實際
  // 凍結／置中交給 CSS）。
  const recalcSparse = useCallback(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const wallWidth = wall.clientWidth;
    if (!wallWidth) return;

    let minSpan = Infinity;
    for (const row of rowRefs.current) {
      if (!row) continue;
      const first = row.firstElementChild as HTMLElement | null;
      const last = row.lastElementChild as HTMLElement | null;
      if (!first || !last) {
        minSpan = 0;
        continue;
      }
      const span = last.getBoundingClientRect().right - first.getBoundingClientRect().left;
      if (span < minSpan) minSpan = span;
    }

    // 門檻從 0.9 降到 0.55：0.9 對現有作品量太嚴，滿版寬螢幕下常誤判成撐不滿。
    const isSparse = Number.isFinite(minSpan) && minSpan < wallWidth * 0.55;
    sparseRef.current = isSparse;
    wall.dataset.sparse = isSparse ? "true" : "false";
  }, []);

  // 依目前展牆寬度算出每列的錯位下限（px），寫進 staggerOffsetsRef 供 wheel
  // 夾值使用，同時回傳一份給呼叫端當這次重置的起始位移。
  const resetStagger = useCallback(() => {
    const wall = wallRef.current;
    const wallWidth = wall?.clientWidth ?? 0;
    const offsets = Array.from(
      { length: rowCount },
      (_, i) => wallWidth * (ROW_STAGGER_RATIOS[i] ?? 0),
    );
    staggerOffsetsRef.current = offsets;
    return offsets;
  }, [rowCount]);

  // 作品清單或列數變動時整份重新分配、位移重置回各列的錯位起點（不是單純
  // 歸零，見上方 ROW_STAGGER_RATIOS 說明）。擋掉掛載後第一次執行——初始值
  // 已經在 useState lazy initializer 挑過一次截圖，不擋會在進場瞬間又重挑
  // 一次、閃一下換圖。
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      requestAnimationFrame(() => {
        distancesRef.current = resetStagger();
        applyTransforms();
        recalcSparse();
      });
      return;
    }
    const next = distributeInitialRows(artworks, rowCount);
    distancesRef.current = resetStagger();
    setRows(next);
    rowsRef.current = next;
    requestAnimationFrame(() => {
      applyTransforms();
      recalcSparse();
    });
  }, [artworks, rowCount, applyTransforms, recalcSparse, resetStagger]);

  // 視窗尺寸改變也可能讓 sparse 判斷結果變化，重新量一次。
  useEffect(() => {
    window.addEventListener("resize", recalcSparse);
    return () => window.removeEventListener("resize", recalcSparse);
  }, [recalcSparse]);

  // 找到作品目前所在列，把那一列的位移量設到「這件作品置中」，不做動畫。
  const scrollToSlug = useCallback((slug: string) => {
    const wall = wallRef.current;
    if (!wall) return;
    for (let i = 0; i < rowRefs.current.length; i++) {
      const row = rowRefs.current[i];
      const tile = row?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
      if (!tile) continue;
      distancesRef.current[i] =
        tile.offsetLeft + tile.offsetWidth / 2 - wall.clientWidth / 2;
      applyTransforms();
      return;
    }
  }, [applyTransforms]);

  const pause = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
    }, RESUME_DELAY);
  }, []);

  // 每列排最前面的作品滑出左緣就移到目前最短的那一列尾端排隊。flushSync
  // 立刻同步畫出來，避免下一幀 transform 已更新、DOM 還沒跟上而閃一下。
  const recycleIfNeeded = useCallback(() => {
    if (sparseRef.current) return; // sparse 模式整批凍結
    const wall = wallRef.current;
    if (!wall) return;
    const wallLeft = wall.getBoundingClientRect().left;

    for (let i = 0; i < rowRefs.current.length; i++) {
      const row = rowRefs.current[i];
      const front = row?.firstElementChild as HTMLElement | null;
      if (!row || !front) continue;
      const frontRect = front.getBoundingClientRect();
      if (frontRect.right > wallLeft) continue; // 還沒完全滑出去，不用回收

      const second = front.nextElementSibling as HTMLElement | null;
      const shift = second
        ? second.getBoundingClientRect().left - frontRect.left
        : frontRect.width;
      distancesRef.current[i] -= shift;

      // 最右緣位置最小（最快見底）的那一列當接收者。
      let targetIndex = 0;
      let smallestRight = Infinity;
      for (let j = 0; j < rowRefs.current.length; j++) {
        const candidateRow = rowRefs.current[j];
        const lastTile = candidateRow?.lastElementChild as HTMLElement | null;
        const right = lastTile
          ? lastTile.getBoundingClientRect().right
          : wallLeft; // 空列視為最需要補件
        if (right < smallestRight) {
          smallestRight = right;
          targetIndex = j;
        }
      }

      const current = rowsRef.current;
      const recycled = current[i][0];
      const nextRows = current.map((r) => r.slice());
      nextRows[i].shift();
      // 依序換下一張截圖（只有一張就保持不變）。
      const images = recycled.artwork.images;
      const currentImageIndex = images.indexOf(recycled.imageSrc);
      const nextImageIndex = (currentImageIndex + 1) % images.length;
      nextRows[targetIndex].push({
        artwork: recycled.artwork,
        imageSrc: images[nextImageIndex],
      });

      flushSync(() => setRows(nextRows));
      rowsRef.current = nextRows;
      applyTransforms();
      return; // 一幀只處理一件，避免連續 flushSync 太多次
    }
  }, [applyTransforms]);

  // 進入 sparse 後 recycleIfNeeded 不會再被呼叫，沒有事件能讓它自己重新
  // 量測修正，這裡固定每隔 500ms 主動重算一次，避免誤判卡住出不來。
  useEffect(() => {
    if (prefersReducedMotion) return;
    let raf: number;
    let lastSparseCheck = 0;
    const tick = (now: number) => {
      if (now - lastSparseCheck > 500) {
        lastSparseCheck = now;
        recalcSparse();
      }
      const manuallyPaused =
        isHoveringRef.current || isDraggingRef.current || resumeTimerRef.current;
      if (!manuallyPaused && !sparseRef.current) {
        for (let i = 0; i < distancesRef.current.length; i++) {
          distancesRef.current[i] += SPEED;
        }
        applyTransforms();
        recycleIfNeeded();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion, applyTransforms, recycleIfNeeded, recalcSparse]);

  // 滾輪映射成橫向移動；React 的合成 wheel 監聽器預設是 passive，
  // preventDefault 不會生效，改用原生監聽器手動掛 { passive: false }。
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      pause();
      for (let i = 0; i < distancesRef.current.length; i++) {
        // 往回捲夾到該列的錯位起點（不是 0，見 ROW_STAGGER_RATIOS 說明），
        // 避免捲過頭露出還沒排到、或是那截交錯用的空白牆面。
        const floor = staggerOffsetsRef.current[i] ?? 0;
        distancesRef.current[i] = Math.max(
          floor,
          distancesRef.current[i] + event.deltaY,
        );
      }
      applyTransforms();
      recycleIfNeeded();
      scheduleResume();
    };
    wall.addEventListener("wheel", handleWheel, { passive: false });
    return () => wall.removeEventListener("wheel", handleWheel);
  }, [pause, scheduleResume, applyTransforms, recycleIfNeeded]);

  // 拖曳：監聽器掛在 window（不是 .wall），也不呼叫 setPointerCapture——
  // 曾經掛在 .wall 上呼叫過，結果放開滑鼠那下的 click 被整個重新導向到
  // .wall 自己，tile 的 onClick 完全收不到事件。
  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const delta = dragStartXRef.current - event.clientX;
      // 移動超過幾像素才算拖曳，避免點擊被誤判成拖曳而擋掉 tile 的 click。
      if (Math.abs(delta) > 4) draggedRef.current = true;
      for (let i = 0; i < distancesRef.current.length; i++) {
        distancesRef.current[i] = (dragStartDistancesRef.current[i] ?? 0) + delta;
      }
      applyTransforms();
      recycleIfNeeded();
    };
    const handleUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      scheduleResume();
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [scheduleResume, applyTransforms, recycleIfNeeded]);

  const wallHandlers = {
    onMouseEnter: () => {
      isHoveringRef.current = true;
      pause();
    },
    onMouseLeave: () => {
      isHoveringRef.current = false;
      scheduleResume();
    },
    onPointerDown: (event: ReactPointerEvent) => {
      isDraggingRef.current = true;
      draggedRef.current = false;
      dragStartXRef.current = event.clientX;
      dragStartDistancesRef.current = distancesRef.current.slice();
    },
  };

  return {
    wallRef,
    setRowRef,
    rows,
    scrollToSlug,
    wallHandlers,
    wasDragged: () => draggedRef.current,
  };
}
