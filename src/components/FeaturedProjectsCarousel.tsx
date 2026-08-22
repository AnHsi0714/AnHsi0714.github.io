import { Link } from "react-router-dom";
import Card from "./Card";
import Chip from "./Chip";
import GroupedCarousel from "./GroupedCarousel";
import type { Project } from "../types/content";
import { useTranslation } from "../i18n/useTranslation";

interface FeaturedProjectsCarouselProps {
  projects: Project[];
}

export default function FeaturedProjectsCarousel({
  projects,
}: FeaturedProjectsCarouselProps) {
  const { t } = useTranslation();

  return (
    <GroupedCarousel
      items={projects}
      itemKey={(project) => project.slug}
      gotoAriaLabel={(group) => t.home.featuredProjectsGoto(group)}
      renderItem={(project) => (
        <Card hoverable className="h-full">
          <Link to={`/projects/${project.slug}`} className="block">
            {project.screenshotUrl ? (
              <img
                src={project.screenshotUrl}
                alt={project.name}
                className="aspect-video w-full rounded-md object-cover"
                style={{
                  objectPosition: project.screenshotPosition
                    ? `${project.screenshotPosition.w}% ${project.screenshotPosition.h}%`
                    : undefined,
                }}
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-md bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
                {t.common.noPreviewImage}
              </div>
            )}
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
              {project.tags.map((tag) => (
                <Chip key={tag} size="sm">
                  {tag}
                </Chip>
              ))}
            </div>
          </Link>
        </Card>
      )}
    />
  );
}
