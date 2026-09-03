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
import { useNeedsScroll } from "../../lib/useNeedsScroll";
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
    article ? `${article.title} · AnHsi0714` : `${t.articles.notFoundTitle} · AnHsi0714`,
    article?.excerpt,
  );
  const hasToc = headings.length > 1;
  const needsScroll = useNeedsScroll();
  // 有目錄時側欄的 backLink 只在 2xl 以上看得到，所以這裡不能直接靠 hasToc 整個關掉，
  // 只能在 2xl 以上用 CSS 隱藏（讓側欄接手），窄螢幕/平板還是要顯示
  const showBackToListInRow = needsScroll;
  const hideBackToListAt2xl = hasToc ? "2xl:hidden" : "";
  // 3 欄 grid（上一篇／回列表／下一篇）讓回列表永遠固定在正中間那格，不管上一篇存不存在，
  // 而不是像 flex 那樣「哪個位置有空就補上去」；hasToc 時 2xl 以上回列表隱藏，
  // grid 縮回 2 欄讓上下篇補滿回一半寬
  const rowGridClass = showBackToListInRow
    ? `sm:grid-cols-3 ${hasToc ? "2xl:grid-cols-2" : ""}`
    : "sm:grid-cols-2";
  const nextColClass = showBackToListInRow
    ? `sm:col-start-3 ${hasToc ? "2xl:col-start-2" : ""}`
    : "sm:col-start-2";

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
        <TextLink
          to="/articles"
          restoreScroll
          className={`text-sm font-medium ${hasToc ? "2xl:hidden" : ""}`}
        >
          {t.articles.backToList}
        </TextLink>
        <Trail />

        {article.coverUrl && (
          <ImageWithSkeleton
            src={article.coverUrl}
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

        {(previousArticle || nextArticle || showBackToListInRow) && (
          <div
            className={`mt-8 grid grid-cols-1 gap-6 border-t border-[var(--color-border)] pt-6 ${rowGridClass}`}
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
            {showBackToListInRow && (
              <div className={`min-w-0 text-center sm:col-start-2 ${hideBackToListAt2xl}`}>
                <TextLink to="/articles" restoreScroll className="text-sm font-medium">
                  {t.articles.backToList}
                </TextLink>
              </div>
            )}
            {nextArticle && (
              <div className={`min-w-0 sm:text-right ${nextColClass}`}>
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
