import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import Chip from "../../components/Chip";
import Badge from "../../components/Badge";
import TableOfContents from "../../components/TableOfContents";
import Trail from "../../components/Trail";
import { useArticles, useNextArticle, usePreviousArticle } from "../../lib/articles";
import { useKnowledgeNodesLinkedTo } from "../../lib/knowledge";
import { extractHeadings } from "../../lib/markdown";
import TextLink from "../../components/TextLink";
import { Stars } from "./Articles";
import { useTranslation } from "../../i18n/useTranslation";
import { useTrail } from "../../context/TrailContext";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const articles = useArticles();
  const article = articles.find((item) => item.slug === slug);
  const relatedKnowledge = useKnowledgeNodesLinkedTo("article", slug ?? "");
  const previousArticle = usePreviousArticle(slug);
  const nextArticle = useNextArticle(slug);
  const { pushTrailEntry } = useTrail();
  const headings = useMemo(
    () => extractHeadings(article?.body ?? ""),
    [article],
  );

  useEffect(() => {
    if (article) pushTrailEntry({ type: "article", slug: article.slug });
  }, [article, pushTrailEntry]);

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
        <Trail />

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

        {(previousArticle || nextArticle) && (
          <div className="mt-8 flex flex-col gap-6 border-t border-[var(--color-border)] pt-6 sm:flex-row">
            {previousArticle && (
              <div className="min-w-0 sm:w-1/2">
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t.articles.previousArticle}
                </p>
                <TextLink
                  to={`/articles/${previousArticle.slug}`}
                  className="mt-1 block truncate font-semibold"
                >
                  {previousArticle.title}
                </TextLink>
              </div>
            )}
            {nextArticle && (
              <div className="min-w-0 sm:ml-auto sm:w-1/2 sm:text-right">
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t.articles.nextArticle}
                </p>
                <TextLink
                  to={`/articles/${nextArticle.slug}`}
                  className="mt-1 block truncate font-semibold"
                >
                  {nextArticle.title}
                </TextLink>
              </div>
            )}
          </div>
        )}

        <TextLink
          to="/articles"
          restoreScroll
          className="mt-8 inline-block text-sm font-medium"
        >
          {t.articles.backToList}
        </TextLink>
      </section>
    </>
  );
}
