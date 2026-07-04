import experienceData from "../../../content/experience.json";
import Chip from "../../components/Chip";
import type { ExperienceEntry, SecondaryExperienceEntry } from "../../types/content";

const entries = experienceData.entries as ExperienceEntry[];
const secondaryEntries = experienceData.secondaryEntries as SecondaryExperienceEntry[];

export default function Experience() {
  return (
    <section>
      <h1 className="text-2xl font-bold">競賽與經歷</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        參與過的競賽、交流活動與工作經歷。
      </p>

      <div className="mt-10 flex flex-col gap-0">
        {entries.map((entry, index) => (
          <div key={entry.title} className="flex gap-6">
            {/* 左側：日期 */}
            <div className="w-36 shrink-0 pt-1 text-right text-sm text-[var(--color-text-muted)]">
              {entry.period}
            </div>

            {/* 中間：時間軸線 */}
            <div className="flex flex-col items-center">
              <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)]" />
              {index < entries.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-[var(--color-border)]" />
              )}
            </div>

            {/* 右側：內容 */}
            <div className="pb-10 flex-1">
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
        ))}
      </div>

      {secondaryEntries.length > 0 && (
        <div className="mt-2">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
            其他獎項
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
      )}
    </section>
  );
}
