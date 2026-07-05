import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import artworksData from "../../../content/artworks.json";
import type { Artwork } from "../../types/content";
import styles from "./GalleryGrid.module.scss";

const artworks = artworksData as Artwork[];

export default function GalleryGrid() {
  // 從作品詳細頁按「回畫廊」回來時，GalleryDetail.tsx 會透過 Link state 帶上
  // 剛剛看的那件作品 slug，讓展場捲回原本的位置，而不是每次都回到第一件。
  const location = useLocation();
  const focusSlug = (location.state as { focusSlug?: string } | null)
    ?.focusSlug;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | undefined>(
    focusSlug ?? artworks[0]?.slug,
  );

  // 每次進場隨機挑一張截圖，呼應生成式作品「每次執行都長得不一樣」
  const posters = useMemo(
    () =>
      Object.fromEntries(
        artworks.map((a) => [
          a.slug,
          a.images[Math.floor(Math.random() * a.images.length)],
        ]),
      ),
    [],
  );

  // 掛載時如果帶了 focusSlug，直接跳（不要動畫捲動）到那件作品置中，
  // immediately 而非 smooth：這是「回到剛剛看的位置」，不是使用者主動捲動，
  // 不需要看到捲動過程。
  useEffect(() => {
    if (!focusSlug) return;
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(`[data-slug="${focusSlug}"]`);
    item?.scrollIntoView({
      behavior: "instant",
      inline: "center",
      block: "nearest",
    });
  }, [focusSlug]);

  // 滾輪垂直捲動轉成展牆的橫向移動（React 的 onWheel 是 passive，擋不了預設捲動，
  // 所以自己掛非 passive listener）。邊界不用手動判斷，scrollLeft 賦值超出範圍時
  // 瀏覽器會自動夾在 [0, scrollWidth - clientWidth] 之間。
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // 偵測誰在展牆中央：每次捲動都算出「哪一件作品的中心點離展牆中心最近」，
  // 直接點亮那件——用重疊區間判斷（IntersectionObserver + threshold）在捲動
  // 途中一有重疊就會提早點亮下一件，還沒真正置中（甚至還會被 scroll-snap
  // 拉回去）就先亮了，感覺判斷太快；改成距離最近者才是正解，且只反映當下
  // 最接近中心的那件，不會提早跳。
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-slug]"));
    let raf = 0;
    const updateActive = () => {
      const rootRect = el.getBoundingClientRect();
      const rootCenter = rootRect.left + rootRect.width / 2;
      let closest: HTMLElement | undefined;
      let minDist = Infinity;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - rootCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = item;
        }
      }
      if (closest) setActiveSlug(closest.dataset.slug);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };
    updateActive();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className={styles.room}>
      <div className={styles.header}>
        <h1>藝術畫廊</h1>
        <p>左右捲動瀏覽畫廊，點擊作品進入互動版本。</p>
      </div>
      <div ref={scrollerRef} className={styles.scroller}>
        {artworks.map((artwork) => (
          <div
            key={artwork.slug}
            data-slug={artwork.slug}
            className={`${styles.exhibit} ${activeSlug === artwork.slug ? styles.active : ""}`}
          >
            <div className={styles.lamp}>
              <div className={styles.cord} />
              <div className={styles.shade} />
              <div className={styles.bulb} />
            </div>
            <div className={styles.beam} />
            <Link to={`/gallery/${artwork.slug}`} className={styles.frame}>
              <img
                src={posters[artwork.slug]}
                alt={artwork.title}
                loading="lazy"
              />
            </Link>
            <div className={styles.placard}>
              <div className={styles.placardTitle}>{artwork.title}</div>
              <div className={styles.placardMeta}>{artwork.date}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
