import { Link, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import Chip from "../../components/Chip";
import { useArticles } from "../../lib/articles";
import { useKnowledgeNodesLinkedTo } from "../../lib/knowledge";
import { Stars } from "./Articles";
import { useTranslation } from "../../i18n/useTranslation";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const articles = useArticles();
  const article = articles.find((item) => item.slug === slug);
  const relatedKnowledge = useKnowledgeNodesLinkedTo("article", slug ?? "");

  if (!article) {
    return (
      <section>
        <EmptyState
          title={t.articles.notFoundTitle}
          description={t.articles.notFoundDesc}
        />
        <Link
          to="/articles"
          className="mt-4 inline-block text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          {t.articles.backToList}
        </Link>
      </section>
    );
  }

  const subtitle = article.author
    ? `${article.author} · ${article.date}`
    : article.date;

  return (
    <section>
      <Link
        to="/articles"
        className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        {t.articles.backToList}
      </Link>

      {article.coverUrl && (
        <img
          src={article.coverUrl}
          alt={article.title}
          className="mt-4 aspect-video w-full rounded-md object-cover"
        />
      )}

      <h1 className="mt-4 text-2xl font-bold">{article.title}</h1>
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
    </section>
  );
}
