import { Link, useParams } from "react-router-dom";
import projectsDataZh from "../../../content/projects.json";
import projectsDataEn from "../../../content/projects.en.json";
import Badge from "../../components/Badge";
import Chip from "../../components/Chip";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import { useProjectBodies } from "../../lib/projects";
import { useKnowledgeNodesLinkedTo } from "../../lib/knowledge";
import TextLink from "../../components/TextLink";
import type { Project } from "../../types/content";
import { statusBadgeVariant } from "./Projects";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const projects = useLocalized(projectsDataZh, projectsDataEn) as Project[];
  const project = projects.find((item) => item.slug === slug);
  const projectBodies = useProjectBodies();
  const relatedKnowledge = useKnowledgeNodesLinkedTo("project", slug ?? "");

  if (!project) {
    return (
      <section>
        <EmptyState
          title={t.projects.notFoundTitle}
          description={t.projects.notFoundDesc}
        />
        <TextLink to="/projects" className="mt-4 inline-block text-sm font-medium">
          {t.projects.backToList}
        </TextLink>
      </section>
    );
  }

  const body = projectBodies[project.slug];

  return (
    <section>
      <TextLink to="/projects" className="text-sm font-medium">
        {t.projects.backToList}
      </TextLink>

      {project.screenshotUrl && (
        <img
          src={project.screenshotUrl}
          alt={project.name}
          className="mt-4 aspect-video w-full rounded-md object-cover"
          style={{
            objectPosition: project.screenshotPosition
              ? `${project.screenshotPosition.w}% ${project.screenshotPosition.h}%`
              : undefined,
          }}
        />
      )}

      <div className="mt-4 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="flex shrink-0 flex-wrap justify-end items-center gap-1 pt-0.5">
          {project.tags?.map((tag) => (
            <Chip key={tag} size="sm">{tag}</Chip>
          ))}
          <Badge variant={statusBadgeVariant[project.status]}>
            {t.projects.status[project.status]}
          </Badge>
        </div>
      </div>

      <p className="mt-2 text-[var(--color-text-muted)]">{project.desc}</p>

      {(project.period ||
        (project.collaborators && project.collaborators.length > 0) ||
        project.advisor) && (
        <div className="mt-3 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
          {project.period && <span>{t.projects.period}{project.period}</span>}
          {project.collaborators && project.collaborators.length > 0 && (
            <span>{t.projects.collaborators}{project.collaborators.join("、")}</span>
          )}
          {project.advisor && <span>{t.projects.advisor}{project.advisor}</span>}
        </div>
      )}

      {project.githubUrl && (
        <TextLink href={project.githubUrl} className="mt-3 inline-block text-sm font-medium">
          {t.common.viewGithub}
        </TextLink>
      )}

      {relatedKnowledge.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">{t.knowledge.relatedKnowledge}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedKnowledge.map((node) => (
              <Link key={node.slug} to={`/knowledge/${node.slug}`}>
                <Chip>{node.term}</Chip>
              </Link>
            ))}
          </div>
        </div>
      )}

      {body && <MarkdownContent className="mt-6">{body}</MarkdownContent>}
    </section>
  );
}
