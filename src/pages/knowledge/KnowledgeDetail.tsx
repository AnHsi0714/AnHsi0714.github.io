import { Link, useParams } from "react-router-dom";
import projectsDataZh from "../../../content/projects.json";
import projectsDataEn from "../../../content/projects.en.json";
import Chip from "../../components/Chip";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import { useKnowledgeNode, useKnowledgeMap } from "../../lib/knowledge";
import TextLink from "../../components/TextLink";
import { useArticles } from "../../lib/articles";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";
import type { KnowledgeRelationType, Project } from "../../types/content";

const relationOrder: KnowledgeRelationType[] = [
  "prerequisite",
  "applies_to",
  "related",
  "contrasts_with",
];

export default function KnowledgeDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const node = useKnowledgeNode(slug);
  const knowledgeMap = useKnowledgeMap();
  const projects = useLocalized(projectsDataZh, projectsDataEn) as Project[];
  const articles = useArticles();

  if (!node || node.status !== "published") {
    return (
      <section>
        <EmptyState
          title={t.knowledge.notFoundTitle}
          description={t.knowledge.notFoundDesc}
        />
        <TextLink to="/knowledge" className="mt-4 inline-block text-sm font-medium">
          {t.knowledge.backToList}
        </TextLink>
      </section>
    );
  }

  const relatedProjects = (node.relatedProjects ?? [])
    .map((projectSlug) => projects.find((p) => p.slug === projectSlug))
    .filter((p): p is Project => Boolean(p));

  const relatedArticles = (node.relatedArticles ?? [])
    .map((articleSlug) => articles.find((a) => a.slug === articleSlug))
    .filter((a): a is (typeof articles)[number] => Boolean(a));

  const relatedNodesByType = relationOrder
    .map((type) => ({
      type,
      nodes: (node.relatedNodes ?? [])
        .filter((rel) => rel.type === type && knowledgeMap[rel.slug]?.status === "published")
        .map((rel) => ({ slug: rel.slug, term: knowledgeMap[rel.slug].term })),
    }))
    .filter((group) => group.nodes.length > 0);

  const timeline = [
    ...relatedProjects.map((p) => ({
      date: p.date,
      label: p.name,
      to: `/projects/${p.slug}`,
    })),
    ...relatedArticles.map((a) => ({
      date: a.date,
      label: a.title,
      to: `/articles/${a.slug}`,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section>
      <TextLink to="/knowledge" className="text-sm font-medium">
        {t.knowledge.backToList}
      </TextLink>

      <div className="mt-4 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold">{node.term}</h1>
        <Chip className="shrink-0">{node.category}</Chip>
      </div>

      <MarkdownContent className="mt-4">{node.definition}</MarkdownContent>

      {node.application && (
        <div className="mt-4 rounded-md border border-[var(--color-border)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {t.term.inThisProject}
          </p>
          <MarkdownContent className="mt-1">{node.application}</MarkdownContent>
        </div>
      )}

      {relatedProjects.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">{t.knowledge.relatedProjects}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedProjects.map((p) => (
              <Link key={p.slug} to={`/projects/${p.slug}`}>
                <Chip>{p.name}</Chip>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">{t.knowledge.relatedArticles}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedArticles.map((a) => (
              <Link key={a.slug} to={`/articles/${a.slug}`}>
                <Chip>{a.title}</Chip>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedNodesByType.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">{t.knowledge.relatedNodes}</h2>
          <div className="mt-2 flex flex-col gap-3">
            {relatedNodesByType.map((group) => (
              <div key={group.type}>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  {t.knowledge.relationType[group.type]}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {group.nodes.map((n) => (
                    <Link key={n.slug} to={`/knowledge/${n.slug}`}>
                      <Chip>{n.term}</Chip>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {timeline.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">{t.knowledge.timeline}</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {timeline.map((entry) => (
              <li key={entry.to}>
                <TextLink to={entry.to}>
                  {entry.date} — {entry.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
