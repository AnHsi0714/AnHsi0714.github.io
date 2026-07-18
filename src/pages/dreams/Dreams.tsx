import dreamsDataZh from '../../../content/dreams.json'
import dreamsDataEn from '../../../content/dreams.en.json'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import ProgressBar from '../../components/ProgressBar'
import type { Dream } from '../../types/content'
import { useLocalized } from '../../lib/localized'
import { useTranslation } from '../../i18n/useTranslation'

export default function Dreams() {
  const { t } = useTranslation()
  const dreams = useLocalized(dreamsDataZh, dreamsDataEn) as Dream[]

  return (
    <section>
      <h1 className="text-2xl font-bold">{t.dreams.title}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">{t.dreams.subtitle}</p>

      {dreams.length === 0 ? (
        <EmptyState title={t.dreams.emptyTitle} description={t.dreams.emptyDesc} />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {dreams.map((dream) => (
            <li key={dream.title}>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
