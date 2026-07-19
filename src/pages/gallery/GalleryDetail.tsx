import { useEffect, useRef, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import type p5 from "p5";
import artworksDataZh from "../../../content/artworks.json";
import artworksDataEn from "../../../content/artworks.en.json";
import type { Artwork } from "../../types/content";
import sketches from "./sketches";
import TextLink from "../../components/TextLink";
import styles from "./GalleryDetail.module.scss";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";

export default function GalleryDetail() {
  const { slug } = useParams();
  const { t, language } = useTranslation();
  const artworks = useLocalized(artworksDataZh, artworksDataEn) as Artwork[];
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
          {t.gallery.back}
        </Link>
        <p className={styles.notFound}>{t.gallery.notFound}</p>
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
        {t.gallery.back}
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
              ...sketchEntry.interactions.map((i) => t.gallery.hints[i]),
              t.gallery.saveHint((sketchEntry.saveKey ?? "S").toUpperCase()),
            ].join(language === "en" ? "; " : "，")}
            {language === "en" ? "." : "。"}
          </p>
        )}
        {artwork.openProcessingUrl && (
          <TextLink
            href={artwork.openProcessingUrl}
            className={styles.openProcessing}
          >
            {t.gallery.viewOnOpenProcessing}
          </TextLink>
        )}
      </div>
    </section>
  );
}
