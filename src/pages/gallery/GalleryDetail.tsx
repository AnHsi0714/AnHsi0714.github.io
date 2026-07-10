import { useEffect, useRef, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import type p5 from "p5";
import artworksData from "../../../content/artworks.json";
import type { Artwork } from "../../types/content";
import sketches, { type SketchInteraction } from "./sketches";
import styles from "./GalleryDetail.module.scss";

const artworks = artworksData as Artwork[];

// 依 sketch 宣告的互動方式組出對應的操作提示文字；「按下 S 儲存」是大部分作品共通
// 的操作，不需要每個 sketch 自己宣告互動類型，但實際綁定的鍵可以透過 saveKey 覆寫
// （例如迷宮競速的 S 被 WASD 移動占用，改綁 H）。
const interactionHints: Record<SketchInteraction, string> = {
  "click-regenerate": "點擊畫布重新產生一次構圖",
  "drag-draw": "按住滑鼠拖曳可以在畫布上留下筆觸",
  "keyboard-game": "方向鍵／WASD 移動，點擊畫面上的按鈕與選項開始遊戲",
};

export default function GalleryDetail() {
  const { slug } = useParams();
  const artwork = artworks.find((a) => a.slug === slug);
  const sketchEntry = slug ? sketches[slug] : undefined;
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!sketchEntry || !host) return;

    let instance: p5 | undefined;
    let cancelled = false;

    import("p5").then(({ default: P5 }) => {
      if (cancelled || !host) return;
      const width = host.clientWidth;
      const height = width / sketchEntry.aspect;
      instance = new P5(sketchEntry.factory(width, height), host);
    });

    return () => {
      cancelled = true;
      instance?.remove();
    };
  }, [sketchEntry]);

  if (!artwork) {
    return (
      <section className={styles.stage}>
        <Link to="/gallery" className={styles.back}>
          ← 回畫廊
        </Link>
        <p className={styles.notFound}>找不到這件作品。</p>
      </section>
    );
  }

  return (
    <section className={styles.stage}>
      <Link
        to="/gallery"
        state={{ focusSlug: artwork.slug }}
        className={styles.back}
      >
        ← 回畫廊
      </Link>
      <div className={styles.spotlight}>
        {sketchEntry ? (
          <div
            ref={canvasHostRef}
            className={styles.canvasHost}
            style={
              { "--sketch-aspect": sketchEntry.aspect } as CSSProperties
            }
          />
        ) : (
          <img
            src={artwork.images[0]}
            alt={artwork.title}
            className={styles.image}
          />
        )}
      </div>
      <div className={styles.caption}>
        <h1>{artwork.title}</h1>
        <p>{artwork.date}</p>
        {sketchEntry && (
          <p className={styles.hint}>
            {[
              ...sketchEntry.interactions.map((i) => interactionHints[i]),
              `按下 ${(sketchEntry.saveKey ?? "S").toUpperCase()} 儲存目前畫面`,
            ].join("，")}
            。
          </p>
        )}
        {artwork.openProcessingUrl && (
          <a
            href={artwork.openProcessingUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.openProcessing}
          >
            在 OpenProcessing 查看原稿 ↗
          </a>
        )}
      </div>
    </section>
  );
}
