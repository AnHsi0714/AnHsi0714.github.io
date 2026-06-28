import { Link, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import MarkdownContent from "../../components/MarkdownContent";
import { articles } from "../../lib/articles";
import { Stars } from "./Articles";

export default function ArticleDetail() {
  const { slug } = useParams();
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    return (
      <section>
        <EmptyState
          title="找不到這篇文章"
          description="可能已經被移除或網址有誤。"
        />
        <Link
          to="/articles"
          className="mt-4 inline-block text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          ← 回文章列表
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
        className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        ← 回文章列表
      </Link>

      {article.coverUrl && (
        <img
          src={article.coverUrl}
          alt={article.title}
          className="mt-4 aspect-video w-full rounded-md object-cover"
        />
      )}

      <h1 className="mt-4 text-2xl font-bold">{article.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {article.categories.map((category) => (
          <span
            key={category}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500"
          >
            {category}
          </span>
        ))}
        {article.rating !== undefined && <Stars rating={article.rating} />}
      </div>

      <MarkdownContent className="mt-6">{article.body}</MarkdownContent>
    </section>
  );
}
