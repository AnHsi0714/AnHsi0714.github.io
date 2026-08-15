import { Link } from "react-router-dom";
import projectsDataZh from "../../content/projects.json";
import projectsDataEn from "../../content/projects.en.json";
import { useTrail } from "../context/TrailContext";
import { useArticles } from "../lib/articles";
import { useKnowledgeMap } from "../lib/knowledge";
import { useLocalized } from "../lib/localized";
import type { Project } from "../types/content";

interface TrailItem {
  path: string;
  label: string;
  // 對應到 trail 原始陣列中的位置，因為有些站可能查不到資料被濾掉，
  // 顯示用的 items index 會跟原始 trail index 對不上，點擊跳轉要用原始 index 截斷
  trailIndex: number;
}

export default function Trail() {
  const { trail, jumpTrailTo } = useTrail();
  const articles = useArticles();
  const knowledgeMap = useKnowledgeMap();
  const projects = useLocalized(projectsDataZh, projectsDataEn) as Project[];

  const items = trail
    .map((entry, trailIndex): TrailItem | null => {
      if (entry.type === "article") {
        const article = articles.find((a) => a.slug === entry.slug);
        return article
          ? { path: `/articles/${entry.slug}`, label: article.title, trailIndex }
          : null;
      }
      if (entry.type === "knowledge") {
        const node = knowledgeMap[entry.slug];
        return node
          ? { path: `/knowledge/${entry.slug}`, label: node.term, trailIndex }
          : null;
      }
      const project = projects.find((p) => p.slug === entry.slug);
      return project
        ? { path: `/projects/${entry.slug}`, label: project.name, trailIndex }
        : null;
    })
    .filter((item): item is TrailItem => Boolean(item));

  // 只有目前這站沒有意義，至少要有過一站才顯示軌跡
  if (items.length < 2) return null;

  return (
    <nav className="mt-2 flex flex-wrap items-center gap-1 text-sm text-[var(--color-text-muted)]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.path} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">›</span>}
            {isLast ? (
              <span className="text-[var(--color-text)]">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                onClick={() => jumpTrailTo(item.trailIndex)}
                className="truncate max-w-[10rem] hover:text-[var(--color-text)]"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
