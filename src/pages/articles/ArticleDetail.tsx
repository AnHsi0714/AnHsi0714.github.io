import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import Chip from "../../components/Chip";
import Badge from "../../components/Badge";
import TableOfContents from "../../components/TableOfContents";
import { useArticles, useNextArticle } from "../../lib/articles";
import { useKnowledgeNodesLinkedTo } from "../../lib/knowledge";
import { extractHeadings } from "../../lib/markdown";
import TextLink from "../../components/TextLink";
import { Stars } from "./Articles";
import { useTranslation } from "../../i18n/useTranslation";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const articles = useArticles();
  const article = articles.find((item) => item.slug === slug);
  const relatedKnowledge = useKnowledgeNodesLinkedTo("article", slug ?? "");
  const nextArticle = useNextArticle(slug);
  const headings = useMemo(
    () => extractHeadings(article?.body ?? ""),
    [article],
  );
  useDocumentTitle(
    article ? `${article.title} · AnHsi0714` : `${t.articles.notFoundTitle} · AnHsi0714`,
    article?.excerpt,
  );

  if (!article) {
    return (
      <section>
        <EmptyState
          title={t.articles.notFoundTitle}
          description={t.articles.notFoundDesc}
        />
        <TextLink to="/articles" restoreScroll className="mt-4 inline-block text-sm font-medium">
          {t.articles.backToList}
        </TextLink>
      </section>
    );
  }

  const subtitle = article.author
    ? `${article.author} · ${article.date}`
    : article.date;

  return (
    <>
      {headings.length > 1 && (
        <TableOfContents title={t.articles.tableOfContents} sections={headings} />
      )}
      <section>
        <TextLink to="/articles" restoreScroll className="text-sm font-medium">
          {t.articles.backToList}
        </TextLink>

        {article.coverUrl && (
          <img
            src={article.coverUrl}
            alt={article.title}
            className="mt-4 aspect-video w-full rounded-md object-cover"
          />
        )}

        <div className="mt-4 flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold">{article.title}</h1>
          {article.status === "draft" && (
            <Badge variant="todo" className="mt-1 shrink-0">
              {t.articles.draftBadge}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {article.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
            >
              {category}
            </span>
          ))}
          {article.rating !== undefined && <Stars rating={article.rating} t={t} />}
        </div>

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

        <MarkdownContent className="mt-6">{article.body}</MarkdownContent>

        {nextArticle && (
          <div className="mt-8 border-t border-[var(--color-border)] pt-6">
            <p className="text-sm text-[var(--color-text-muted)]">
              {t.articles.nextArticle}
            </p>
            <TextLink
              to={`/articles/${nextArticle.slug}`}
              className="mt-1 block font-semibold"
            >
              {nextArticle.title}
            </TextLink>
          </div>
        )}
      </section>
    </>
  );
}
