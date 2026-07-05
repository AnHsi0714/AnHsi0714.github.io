import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import type p5 from "p5";
import artworksData from "../../../content/artworks.json";
import type { Artwork } from "../../types/content";
import sketchFactories from "./sketches";
import styles from "./GalleryDetail.module.scss";

const artworks = artworksData as Artwork[];

export default function GalleryDetail() {
  const { slug } = useParams();
  const artwork = artworks.find((a) => a.slug === slug);
  const sketchFactory = slug ? sketchFactories[slug] : undefined;
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!sketchFactory || !host) return;

    let instance: p5 | undefined;
    let cancelled = false;

    import("p5").then(({ default: P5 }) => {
      if (cancelled || !host) return;
      const size = host.clientWidth;
      instance = new P5(sketchFactory(size), host);
    });

    return () => {
      cancelled = true;
      instance?.remove();
    };
  }, [sketchFactory]);

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
      <Link to="/gallery" className={styles.back}>
        ← 回畫廊
      </Link>
      <div className={styles.spotlight}>
        {sketchFactory ? (
          <div ref={canvasHostRef} className={styles.canvasHost} />
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
        {sketchFactory && (
          <p className={styles.hint}>滑鼠點擊畫布互動，按下 S 儲存畫面。</p>
        )}
      </div>
    </section>
  );
}
