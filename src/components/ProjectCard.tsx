import { Link } from "react-router-dom";
import Card from "./Card";
import Chip from "./Chip";
import Badge from "./Badge";
import ImageWithSkeleton from "./ImageWithSkeleton";
import type { Project } from "../types/content";
import type { Strings } from "../i18n/strings";
import { statusBadgeVariant } from "../lib/projects";

interface ProjectCardProps {
  project: Project;
  t: Strings;
  // grid：Projects 列表用，標題同列放標籤／狀態 Badge，說明文字下面接 GitHub 連結。
  // carousel：首頁精選輪播用，標題下接指導老師欄位，標籤另起一行放在說明文字後面。
  variant?: "grid" | "carousel";
}

export default function ProjectCard({
  project,
  t,
  variant = "grid",
}: ProjectCardProps) {
  const sortedTags = [...(project.tags ?? [])].sort();

  return (
    <Card hoverable className="h-full">
      <Link to={`/projects/${project.slug}`} className="block">
        {project.screenshotUrl ? (
          <ImageWithSkeleton
            src={project.screenshotUrl}
            alt={project.name}
            wrapperClassName="aspect-video w-full"
            className="object-cover"
            style={{
              objectPosition: project.screenshotPosition
                ? `${project.screenshotPosition.w}% ${project.screenshotPosition.h}%`
                : undefined,
            }}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
            {t.common.noPreviewImage}
          </div>
        )}

        {variant === "grid" ? (
          <>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 flex-1 font-semibold">{project.name}</p>
              <div className="flex flex-wrap items-center gap-1 sm:shrink-0 sm:justify-end">
                {sortedTags.map((tag) => (
                  <Chip key={tag} size="sm">
                    {tag}
                  </Chip>
                ))}
                <Badge
                  variant={statusBadgeVariant[project.status]}
                  className="shrink-0"
                >
                  {t.projects.status[project.status]}
                </Badge>
              </div>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
              {project.desc}
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 font-semibold">{project.name}</p>
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
              {sortedTags.map((tag) => (
                <Chip key={tag} size="sm">
                  {tag}
                </Chip>
              ))}
            </div>
          </>
        )}
      </Link>
      {variant === "grid" && project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-medium text-[var(--color-text)]"
        >
          {t.common.viewGithub}
        </a>
      )}
    </Card>
  );
}
