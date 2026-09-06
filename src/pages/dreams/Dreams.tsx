import dreamsDataZh from '../../../content/dreams.json'
import dreamsDataEn from '../../../content/dreams.en.json'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import ProgressBar from '../../components/ProgressBar'
import Reveal from '../../components/Reveal'
import type { Dream } from '../../types/content'
import { useLocalized } from '../../lib/localized'
import { useTranslation } from '../../i18n/useTranslation'

function progressPercent(dream: Dream): number {
  if (!dream.progress || dream.progress.target <= 0) return 0
  return dream.progress.current / dream.progress.target
}

export default function Dreams() {
  const { t } = useTranslation()
  const dreams = [...(useLocalized(dreamsDataZh, dreamsDataEn) as Dream[])].sort(
    (a, b) => progressPercent(a) - progressPercent(b),
  )

  return (
    <section>
      <Reveal>
        <h1 className="text-2xl font-bold">{t.dreams.title}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">{t.dreams.subtitle}</p>
      </Reveal>

      {dreams.length === 0 ? (
        <EmptyState title={t.dreams.emptyTitle} description={t.dreams.emptyDesc} />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {dreams.map((dream, index) => (
            <li key={dream.title}>
              <Reveal delay={Math.min(index, 5) * 60}>
                <Card>
                  <p className="font-semibold">{dream.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{dream.desc}</p>
                  {dream.progress && (
                    <div className="mt-3">
                      <ProgressBar
                        current={dream.progress.current}
                        target={dream.progress.target}
                        unit={dream.progress.unit}
                      />
                    </div>
                  )}
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
