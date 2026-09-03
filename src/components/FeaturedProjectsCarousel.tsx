import ProjectCard from "./ProjectCard";
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
        <ProjectCard project={project} t={t} variant="carousel" />
      )}
    />
  );
}
