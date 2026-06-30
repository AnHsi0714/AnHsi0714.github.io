import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import projectsData from "../../../content/projects.json";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import type { Project, ProjectStatus, ProjectTag } from "../../types/content";

const allStatuses: ProjectStatus[] = ["todo", "in-progress", "done"];

const projects = projectsData as Project[];

const allTags = Array.from(
  new Set(projects.flatMap((p) => p.tags ?? [])),
) as ProjectTag[];

type SortOrder = "newest" | "oldest";

export const statusLabel: Record<ProjectStatus, string> = {
  todo: "todo",
  "in-progress": "doing",
  done: "done",
};

export const statusBadgeVariant: Record<ProjectStatus, "todo" | "doing" | "done"> = {
  todo: "todo",
  "in-progress": "doing",
  done: "done",
};

function ProjectCard({ project }: { project: Project }) {
  return (
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
            尚無預覽圖
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="font-semibold">{project.name}</p>
          <div className="flex shrink-0 flex-wrap justify-end items-center gap-1">
            {project.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
              >
                {tag}
              </span>
            ))}
            <Badge
              variant={statusBadgeVariant[project.status]}
              className="shrink-0"
            >
              {statusLabel[project.status]}
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
          查看 GitHub →
        </a>
      )}
    </Card>
  );
}

export default function Projects() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<ProjectTag[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

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
    (dateTo ? 1 : 0);

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
        return true;
      })
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date),
      );
  }, [titleQuery, selectedTags, selectedStatuses, dateFrom, dateTo, sortOrder]);

  return (
    <section>
      <h1 className="text-2xl font-bold">專案</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        做過、正在做的專案。
      </p>

      <div className="relative mt-6 inline-block" ref={filterRef}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          篩選 / 排序{activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
        </Button>

        {isFilterOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-[min(36rem,90vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label="搜尋標題"
                placeholder="輸入標題關鍵字"
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                className="w-40"
              />
              <Input
                label="起始月份"
                type="month"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
              <Input
                label="結束月份"
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
                    {statusLabel[status]}
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

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                排序
              </span>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "newest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("newest")}
              >
                最新
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "oldest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("oldest")}
              >
                最久
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="沒有符合條件的專案"
            description="試試調整篩選條件。"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
