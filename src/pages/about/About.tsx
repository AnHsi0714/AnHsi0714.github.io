import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faDumbbell,
  faBook,
  faBaseball,
  faGamepad,
  faBasketball,
  faPaw,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../components/Button";

const skills = [
  "前端動畫互動網頁（HTML、CSS、TS、REACT）",
  "互動藝術程式創作（p5.js）",
  "資料分析與視覺化（Python、R、Tableau）",
];

const education = [
  "新北市樟樹實中 JICTS 資訊科",
  "國立臺北科技大學 NTUT 資工系 大三",
];

const researchInterests = [
  "Information Visualization",
  "Interactive Visualization",
  "Programming Education",
  "NLP",
  "Explainable AI",
  "Human-AI Interaction",
  "Generative Art",
  "Creative Coding",
];

const achievements = [
  {
    title: "資料結構與演算法視覺化教學平台 CodePulse",
    desc: "114 學年度 資工系實務專題｜指導教授 陳香君",
  },
  {
    title: "基於雙軌 NLP 技術之使用者回饋自動化分析語義模型",
    desc: "2026 年 6 月｜NLP 課程期末專題",
  },
];

const experiences: string[] = [
  // 填入競賽、實習、社團幹部等
];

const interests = [
  { icon: faCode, label: "程式開發" },
  { icon: faLightbulb, label: "程式創作" },
  { icon: faDumbbell, label: "健身運動" },
  { icon: faBook, label: "閱讀書籍" },
  { icon: faBaseball, label: "Fubon" },
  { icon: faBasketball, label: "PLG" },
  { icon: faGamepad, label: "傳說 ONE" },
  { icon: faPaw, label: "狼人殺" },
];

export default function About() {
  return (
    <section className="flex flex-col lg:flex-row lg:-ml-[calc(50vw-50rem)]">
      <div className="lg:shrink-0 lg:w-[calc(50vw-20rem)] lg:sticky lg:top-1/2 lg:-translate-y-1/2 lg:self-start">
        <p className="text-7xl font-light leading-none text-[var(--color-text)] lg:text-[10rem]">
          About
        </p>
        <p className="mt-4 text-7xl font-light leading-none text-[var(--color-text)] lg:text-[10rem]">
          Me
        </p>
      </div>

      <div className="flex-1 divide-y divide-[var(--color-border)]">
        <div className="pb-6">
          <p className="font-semibold text-[var(--color-primary)]">
            專業技能 Skills
          </p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
            {skills.map((skill) => (
              <p key={skill}>{skill}</p>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            學歷 Education
          </p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
            {education.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            研究興趣 Research Interests
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
            {researchInterests.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            學術成果 Academic Achievements
          </p>
          <div className="mt-2 flex flex-col gap-3 text-sm text-[var(--color-text-muted)]">
            {achievements.map((item) => (
              <div key={item.title}>
                <p className="text-[var(--color-text)]">{item.title}</p>
                <p className="mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            競賽與經歷 Experience
          </p>
          {experiences.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              （待補上）
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
              {experiences.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          )}
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            休閒興趣 Interests
          </p>
          <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-2 text-sm text-[var(--color-text-muted)]">
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
  );
}
