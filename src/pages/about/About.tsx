import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCode,
  faDumbbell,
  faBook,
  faBaseball,
  faGamepad,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons'
import Button from '../../components/Button'

const skills = ['前端動畫互動網頁（HTML、CSS、JS）', '互動藝術程式創作（p5.js）']

const education = ['新北市樟樹實中 JICTS 資訊科', '國立臺北科技大學 NTUT 資工系 大三']

const interests = [
  { icon: faCode, label: '程式' },
  { icon: faDumbbell, label: '運動' },
  { icon: faBook, label: '讀書' },
  { icon: faBaseball, label: '棒球' },
  { icon: faGamepad, label: '電競' },
  { icon: faUtensils, label: '飲食' },
]

export default function About() {
  return (
    <section className="flex flex-col gap-10 sm:flex-row sm:gap-16">
      <div className="shrink-0">
        <p className="text-6xl font-light leading-none text-[var(--color-text)] sm:text-7xl">
          About
        </p>
        <p className="mt-4 text-6xl font-light leading-none text-[var(--color-text)] sm:text-7xl">
          Me
        </p>
      </div>

      <div className="flex-1 divide-y divide-[var(--color-border)]">
        <div className="pb-6">
          <p className="font-semibold text-[var(--color-primary)]">
            專業技能Skills
          </p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
            {skills.map((skill) => (
              <p key={skill}>{skill}</p>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            學歷Education
          </p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
            {education.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            休閒興趣Interest
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
            {interests.map(({ icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={icon} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <Button type="button">下載履歷 Download Resume</Button>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            （履歷檔案連結待補上）
          </p>
        </div>
      </div>
    </section>
  )
}
