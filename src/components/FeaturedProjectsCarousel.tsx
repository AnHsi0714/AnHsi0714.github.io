import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Card from "./Card";
import Chip from "./Chip";
import Reveal from "./Reveal";
import type { Project } from "../types/content";
import { useTranslation } from "../i18n/useTranslation";

const GROUP_SIZE = 2;
const TRANSITION_MS = 320;
const AUTO_ROTATE_MS = 5000;

interface FeaturedProjectsCarouselProps {
  projects: Project[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

export default function FeaturedProjectsCarousel({
  projects,
}: FeaturedProjectsCarouselProps) {
  const { t } = useTranslation();
  const groups = chunk(projects, GROUP_SIZE);
  const [groupIndex, setGroupIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pendingIndex = useRef<number | null>(null);

  const goTo = (target: number) => {
    if (target === groupIndex || collapsed) return;
    pendingIndex.current = target;
    setCollapsed(true);
    window.setTimeout(() => {
      if (pendingIndex.current !== null) {
        setGroupIndex(pendingIndex.current);
        pendingIndex.current = null;
      }
      setCollapsed(false);
    }, TRANSITION_MS);
  };

  useEffect(() => {
    if (groups.length <= 1 || isPaused) return;
    const id = window.setInterval(() => {
      goTo((groupIndex + 1) % groups.length);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, groups.length, isPaused]);

  const activeGroup = groups[groupIndex] ?? [];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: collapsed ? "0fr" : "1fr",
          transition: `grid-template-rows ${TRANSITION_MS}ms ease-in-out`,
        }}
      >
        <div
          className="overflow-hidden"
          style={{
            opacity: collapsed ? 0 : 1,
            transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <div className="grid grid-cols-1 gap-4 py-0.5 sm:grid-cols-2">
            {activeGroup.map((project, index) => (
              <Reveal
                key={project.slug}
                delay={index * 80}
                className={`h-full ${
                  index === activeGroup.length - 1 &&
                  activeGroup.length % 2 === 1
                    ? "sm:col-span-2"
                    : ""
                }`}
              >
                <Card hoverable className="h-full">
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
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {groups.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {groups.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={t.home.featuredProjectsGoto(index + 1)}
              aria-current={index === groupIndex}
              onClick={() => goTo(index)}
              className={[
                "rounded-full transition-all",
                index === groupIndex
                  ? "h-2.5 w-2.5 bg-[var(--color-primary)]"
                  : "h-2 w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
