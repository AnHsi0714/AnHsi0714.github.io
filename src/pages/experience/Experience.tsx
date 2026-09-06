import { useState } from "react";
import experienceDataZh from "../../../content/experience.json";
import experienceDataEn from "../../../content/experience.en.json";
import Chip from "../../components/Chip";
import Reveal from "../../components/Reveal";
import Modal from "../../components/Modal";
import ImageWithSkeleton from "../../components/ImageWithSkeleton";
import GroupedCarousel from "../../components/GroupedCarousel";
import type {
  ExperienceEntry,
  SecondaryExperienceEntry,
} from "../../types/content";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";

export default function Experience() {
  const { t } = useTranslation();
  const experienceData = useLocalized(experienceDataZh, experienceDataEn);
  const entries = experienceData.entries as ExperienceEntry[];
  const secondaryEntries =
    experienceData.secondaryEntries as SecondaryExperienceEntry[];
  // 記錄哪一筆經歷的照片彈窗被打開，而不是單純的布林值，
  // 這樣才知道要顯示 entries 裡的哪一筆 images
  const [openEntryIndex, setOpenEntryIndex] = useState<number | null>(null);
  const openEntry = openEntryIndex !== null ? entries[openEntryIndex] : undefined;

  return (
    <section>
      <Reveal>
        <h1 className="text-2xl font-bold">{t.experience.title}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {t.experience.subtitle}
        </p>
      </Reveal>

      <div className="mt-10 flex flex-col gap-0">
        {entries.map((entry, index) => (
          <Reveal key={entry.title} delay={Math.min(index, 5) * 60}>
            <div className="flex gap-3 sm:gap-6">
              {/* 左側：日期，手機螢幕太窄放不下固定寬度的日期欄，改到內容區塊上方顯示 */}
              <div className="hidden w-36 shrink-0 pt-1 text-right text-sm text-[var(--color-text-muted)] sm:block">
                {entry.period}
              </div>

              {/* 中間：時間軸線 */}
              <div className="flex flex-col items-center">
                {entry.images && entry.images.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setOpenEntryIndex(index)}
                    aria-label={t.experience.viewPhotos}
                    aria-haspopup="dialog"
                    className="relative mt-1.5 flex h-3 w-3 shrink-0 cursor-pointer"
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)]" />
                  </button>
                ) : (
                  <span className="mt-1.5 flex h-3 w-3 shrink-0">
                    <span className="inline-flex h-3 w-3 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)]" />
                  </span>
                )}
                {index < entries.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-[var(--color-border)]" />
                )}
              </div>

              {/* 右側：內容 */}
              <div className="min-w-0 flex-1 pb-10">
                <p className="text-xs text-[var(--color-text-muted)] sm:hidden">
                  {entry.period}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--color-text)]">
                    {entry.title}
                  </p>
                  {entry.tags.map((tag) => (
                    <Chip key={tag.label} variant={tag.variant} size="sm">
                      {tag.label}
                    </Chip>
                  ))}
                </div>
                {entry.subtitle && (
                  <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                    {entry.subtitle}
                  </p>
                )}
                <ul className="mt-2 flex flex-col gap-1">
                  {entry.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-border)]" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {secondaryEntries.length > 0 && (
        <Reveal>
          <div className="mt-2">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
              {t.experience.otherAwards}
            </h2>
            <div className="mt-3 flex flex-col gap-2 border-l-2 border-[var(--color-border)] pl-4">
              {secondaryEntries.map((entry) => (
                <div
                  key={entry.title + entry.period}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1"
                >
                  <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
                    {entry.period}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ·
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {entry.title}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ·
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {entry.result}
                  </span>
                  {entry.tags.map((tag) => (
                    <Chip key={tag.label} variant={tag.variant} size="sm">
                      {tag.label}
                    </Chip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Modal
        open={openEntry !== undefined}
        onClose={() => setOpenEntryIndex(null)}
        ariaLabel={openEntry?.title}
        backdropClassName="bg-black/70 p-6"
        panelClassName="flex max-h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-lg bg-[var(--color-bg)] p-4"
      >
        {openEntry?.images && (
          <GroupedCarousel
            items={openEntry.images}
            groupSize={1}
            edgeNav
            edgeNavLabels={{
              previous: t.experience.previousPhoto,
              next: t.experience.nextPhoto,
            }}
            itemKey={(image) => image.src}
            gotoAriaLabel={(index) => t.experience.viewPhotoGoto(index)}
            renderItem={(image) => (
              <figure>
                <ImageWithSkeleton
                  src={image.src}
                  alt={image.caption}
                  wrapperClassName="aspect-video w-full rounded-md"
                  className="object-cover"
                />
                <figcaption className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                  {image.caption}
                </figcaption>
              </figure>
            )}
          />
        )}
      </Modal>
    </section>
  );
}
