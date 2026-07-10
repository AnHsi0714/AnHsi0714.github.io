import { Link } from "react-router-dom";
import projectsData from "../../content/projects.json";
import Card from "../components/Card";
import Chip from "../components/Chip";
import Button from "../components/Button";
import type { Project } from "../types/content";

const projects = projectsData as Project[];

const researchInterestTags = [
  "Visual Analytics",
  "Interactive Data Exploration",
  "Information Visualization",
  "Human-Computer Interaction",
  "Natural Language Processing",
  "Knowledge Graph",
];

const featuredSlugs = ["code-pulse", "absa-wordcloud"];
const featuredProjects = featuredSlugs
  .map((slug) => projects.find((p) => p.slug === slug))
  .filter((p): p is Project => Boolean(p));

const quickLinks = [
  {
    to: "/experience",
    label: "經歷 Experience",
    desc: "競賽、實習與教學經歷",
  },
  {
    to: "/articles",
    label: "文章 Articles",
    desc: "讀書筆記與心得整理",
  },
  {
    to: "/gallery",
    label: "藝術畫廊 Gallery",
    desc: "p5.js 互動式創作",
  },
  {
    to: "/projects",
    label: "全部專案 Projects",
    desc: "完整專案列表",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section>
        <p className="text-4xl font-light leading-tight text-[var(--color-text)] sm:text-5xl">
          鄭安琋 Cheng An Hsi
        </p>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          資工背景 × 視覺化研究 × 前端工程
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
          國立臺北科技大學資工系，研究方向聚焦於 Visual Analytics 與
          Human-Computer Interaction，並具備前端工程實務經驗（Angular /
          React）。畢業專題為資料結構與演算法視覺化學習平台
          CodePulse，同時參與使用者回饋語意分析的 NLP 研究專題。
        </p>
        <Link
          to="/about#research-interests"
          className="mt-4 flex flex-wrap gap-2"
        >
          {researchInterestTags.map((tag) => (
            <Chip key={tag} size="md">
              {tag}
            </Chip>
          ))}
        </Link>
        <div className="mt-6 flex gap-3">
          <Link to="/about">
            <Button type="button">關於我</Button>
          </Link>
          <Link to="/projects">
            <Button type="button" variant="secondary">
              查看專案
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <p className="font-semibold text-[var(--color-primary)]">
          精選專案 Featured Projects
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <Card key={project.slug} hoverable>
              <Link to={`/projects/${project.slug}`} className="block">
                <p className="font-semibold">{project.name}</p>
                {project.advisor && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    指導教授：{project.advisor}
                  </p>
                )}
                <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-3">
                  {project.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Chip key={tag} size="sm">
                      {tag}
                    </Chip>
                  ))}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <p className="font-semibold text-[var(--color-primary)]">
          更多內容 Explore
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Card hoverable>
                <p className="font-semibold">{link.label}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {link.desc}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex items-center gap-4 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-text-muted)]">
        <a
          href="https://github.com/stars/AnHsi0714/lists/projects-i-participated-in"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-text)]"
        >
          GitHub →
        </a>
      </section>
    </div>
  );
}
