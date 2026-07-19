import { Link } from "react-router-dom";
import projectsDataZh from "../../content/projects.json";
import projectsDataEn from "../../content/projects.en.json";
import Card from "../components/Card";
import Chip from "../components/Chip";
import Button from "../components/Button";
import TextLink from "../components/TextLink";
import type { Project } from "../types/content";
import { useLocalized } from "../lib/localized";
import { useTranslation } from "../i18n/useTranslation";

const researchInterestTags = [
  "Visual Analytics",
  "Interactive Data Exploration",
  "Information Visualization",
  "Human-Computer Interaction",
  "Natural Language Processing",
  "Knowledge Graph",
];

const featuredSlugs = ["code-pulse", "absa-wordcloud"];

export default function Home() {
  const { t } = useTranslation();
  const projects = useLocalized(projectsDataZh, projectsDataEn) as Project[];
  const featuredProjects = featuredSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => Boolean(p));

  const quickLinks = [
    {
      to: "/experience",
      label: t.home.quickLinkExperience,
      desc: t.home.quickLinkExperienceDesc,
    },
    {
      to: "/articles",
      label: t.home.quickLinkArticles,
      desc: t.home.quickLinkArticlesDesc,
    },
    {
      to: "/gallery",
      label: t.home.quickLinkGallery,
      desc: t.home.quickLinkGalleryDesc,
    },
    {
      to: "/projects",
      label: t.home.quickLinkProjects,
      desc: t.home.quickLinkProjectsDesc,
    },
  ];

  return (
    <div className="flex flex-col gap-16">
      <section className="pt-4 sm:pt-8 lg:pt-12">
        <p className="text-4xl font-light leading-tight text-[var(--color-text)] sm:text-5xl md:text-6xl lg:text-7xl">
          {t.home.titleZh} {t.home.titleEn}
        </p>
        <TextLink to="/about#research-interests" className="mt-3 block text-lg">
          {t.home.tagline}
        </TextLink>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
          {t.home.bio}
        </p>
        <Link
          to="/knowledge?category=RESEARCH"
          className="mt-6 flex flex-wrap gap-2"
        >
          {researchInterestTags.map((tag) => (
            <Chip key={tag} size="md">
              {tag}
            </Chip>
          ))}
        </Link>
        <div className="mt-8 flex gap-3">
          <Link to="/about">
            <Button type="button">{t.home.aboutMe}</Button>
          </Link>
          <Link to="/projects">
            <Button type="button" variant="secondary">
              {t.home.viewProjects}
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <p className="font-semibold text-[var(--color-primary)]">
          {t.home.featuredProjects}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <Card key={project.slug} hoverable>
              <Link to={`/projects/${project.slug}`} className="block">
                <p className="font-semibold">{project.name}</p>
                {project.advisor && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {t.home.advisor}
                    {project.advisor}
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
          {t.home.explore}
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

      <section className="flex items-center gap-4 border-t border-[var(--color-border)] pt-6 text-sm">
        <TextLink href="https://github.com/stars/AnHsi0714/lists/projects-i-participated-in">
          GitHub →
        </TextLink>
        <TextLink href="https://openprocessing.org/@u455151">
          OpenProcessing →
        </TextLink>
        <TextLink href={`mailto:${t.home.email}`}>{t.home.email}</TextLink>
      </section>
    </div>
  );
}
