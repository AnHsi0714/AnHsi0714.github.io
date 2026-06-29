import { Link, useParams } from "react-router-dom";
import projectsData from "../../../content/projects.json";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import { projectBodies } from "../../lib/projects";
import type { Project } from "../../types/content";
import { statusBadgeVariant, statusLabel } from "./Projects";

const projects = projectsData as Project[];

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return (
      <section>
        <EmptyState
          title="找不到這個專案"
          description="可能已經被移除或網址有誤。"
        />
        <Link
          to="/projects"
          className="mt-4 inline-block text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          ← 回專案列表
        </Link>
      </section>
    );
  }

  const body = projectBodies[project.slug];

  return (
    <section>
      <Link
        to="/projects"
        className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        ← 回專案列表
      </Link>

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

      <div className="mt-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge variant={statusBadgeVariant[project.status]}>
          {statusLabel[project.status]}
        </Badge>
      </div>
      <p className="mt-2 text-[var(--color-text-muted)]">{project.desc}</p>

      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          查看 GitHub →
        </a>
      )}

      {body && <MarkdownContent className="mt-6">{body}</MarkdownContent>}
    </section>
  );
}
