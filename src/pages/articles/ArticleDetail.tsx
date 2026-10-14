import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import ImageWithSkeleton from "../../components/ImageWithSkeleton";
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
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
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
  useDocumentTitle(
    article ? `${article.title} · Cheng An Hsi` : `${t.articles.notFoundTitle} · Cheng An Hsi`,
    article?.excerpt,
    { type: "article", image: article?.coverUrl },
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
      <TableOfContents
        title={t.articles.tableOfContents}
        sections={headings}
        backLink={{ to: "/articles", label: t.articles.backToList }}
      />
      <section>
        <Trail />

        {article.coverUrl && (
          <ImageWithSkeleton
            src={article.coverUrl}
            loading="eager"
            alt={article.title}
            wrapperClassName="mt-4 aspect-video w-full rounded-md"
            className="object-cover"
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
                  <Chip clickable>{node.term}</Chip>
                </Link>
              ))}
            </div>
          </div>
        )}

        <MarkdownContent className="mt-6" contextSlug={article.slug}>
          {article.body}
        </MarkdownContent>

        {(previousArticle || nextArticle) && (
          <div
            className={`mt-8 grid grid-cols-1 gap-6 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2`}
          >
            {previousArticle && (
              <div className="min-w-0 sm:col-start-1">
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
              <div className={`min-w-0 sm:col-start-2 sm:text-right`}>
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
      </section>
    </>
  );
}
