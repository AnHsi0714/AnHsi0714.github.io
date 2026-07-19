import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import projectsDataZh from "../../../content/projects.json";
import projectsDataEn from "../../../content/projects.en.json";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Chip from "../../components/Chip";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import TextLink from "../../components/TextLink";
import type { Project, ProjectStatus, ProjectTag } from "../../types/content";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";
import type { Strings } from "../../i18n/strings";

const allStatuses: ProjectStatus[] = ["todo", "in-progress", "done"];

type SortOrder = "newest" | "oldest";
type FeaturedFilter = "all" | "featured" | "not-featured";

export const statusBadgeVariant: Record<ProjectStatus, "todo" | "doing" | "done"> = {
  todo: "todo",
  "in-progress": "doing",
  done: "done",
};

function ProjectCard({ project, t }: { project: Project; t: Strings }) {
  return (
    <div className="relative">
      {project.featured && (
        <span
          title={t.common.pinned}
          aria-label={t.common.pinned}
          className="absolute -left-3 -top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-text)",
          }}
        >
          <FontAwesomeIcon icon={faThumbtack} className="text-xs" />
        </span>
      )}
      <Card hoverable>
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
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="font-semibold">{project.name}</p>
            <div className="flex shrink-0 flex-wrap justify-end items-center gap-1">
              {project.tags?.map((tag) => (
                <Chip key={tag} size="sm">{tag}</Chip>
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
        </Link>
        {project.githubUrl && (
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
    </div>
  );
}

export default function Projects() {
  const { t } = useTranslation();
  const projects = useLocalized(projectsDataZh, projectsDataEn) as Project[];
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags ?? [])),
  ) as ProjectTag[];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<ProjectTag[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const toggleTag = (tag: ProjectTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleStatus = (status: ProjectStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const activeFilterCount =
    (titleQuery ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (selectedStatuses.length > 0 ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (featuredFilter !== "all" ? 1 : 0);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        if (
          titleQuery &&
          !project.name.toLowerCase().includes(titleQuery.trim().toLowerCase())
        ) {
          return false;
        }
        if (
          selectedTags.length > 0 &&
          !project.tags?.some((tag) => selectedTags.includes(tag))
        ) {
          return false;
        }
        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(project.status)
        ) {
          return false;
        }
        if (dateFrom && project.date < dateFrom) return false;
        if (dateTo && project.date > dateTo) return false;
        if (featuredFilter === "featured" && !project.featured) return false;
        if (featuredFilter === "not-featured" && project.featured) return false;
        return true;
      })
      .sort((a, b) => {
        const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (featuredDiff !== 0) return featuredDiff;
        return sortOrder === "newest"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      });
  }, [
    projects,
    titleQuery,
    selectedTags,
    selectedStatuses,
    dateFrom,
    dateTo,
    sortOrder,
    featuredFilter,
  ]);

  return (
    <section>
      <h1 className="text-2xl font-bold">{t.projects.title}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        {t.projects.subtitle}
      </p>
      <TextLink to="/knowledge" className="mt-1 block text-sm">
        {t.knowledge.entryPointHint}
      </TextLink>

      <div className="relative mt-6 inline-block" ref={filterRef}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          {t.common.filterSort}{activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
        </Button>

        {isFilterOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-[min(36rem,90vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label={t.common.searchTitle}
                placeholder={t.common.titleKeywordPlaceholder}
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                className="w-40"
              />
              <Input
                label={t.common.startMonth}
                type="month"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
              <Input
                label={t.common.endMonth}
                type="month"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {allStatuses.map((status) => {
                const isSelected = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleStatus(status)}
                    className={[
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
                    ].join(" ")}
                  >
                    {t.projects.status[status]}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleTag(tag)}
                    className={[
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
                    ].join(" ")}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {t.common.featuredFilterLabel}
              </span>
              {(
                [
                  ["all", t.common.filterAll],
                  ["featured", t.common.filterFeatured],
                  ["not-featured", t.common.filterNotFeatured],
                ] as [FeaturedFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={featuredFilter === value}
                  onClick={() => setFeaturedFilter(value)}
                  className={[
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    featuredFilter === value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {t.common.sort}
              </span>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "newest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("newest")}
              >
                {t.common.newest}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "oldest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("oldest")}
              >
                {t.common.oldest}
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t.projects.noMatch}
            description={t.projects.tryAdjustFilter}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} t={t} />
          ))}
        </div>
      )}
    </section>
  );
}
