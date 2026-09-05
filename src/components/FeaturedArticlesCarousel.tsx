import { Link } from "react-router-dom";
import Card from "./Card";
import Chip from "./Chip";
import GroupedCarousel from "./GroupedCarousel";
import type { Article } from "../types/content";
import { useTranslation } from "../i18n/useTranslation";

interface FeaturedArticlesCarouselProps {
  articles: Article[];
}

export default function FeaturedArticlesCarousel({
  articles,
}: FeaturedArticlesCarouselProps) {
  const { t } = useTranslation();

  return (
    <GroupedCarousel
      items={articles}
      itemKey={(article) => article.slug}
      gotoAriaLabel={(group) => t.home.featuredArticlesGoto(group)}
      renderItem={(article) => (
        <Card hoverable className="h-full">
          <Link to={`/articles/${article.slug}`} className="block">
            <h3 className="font-semibold">{article.title}</h3>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {article.author ? `${article.author} · ${article.date}` : article.date}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-3">
              {article.excerpt}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.categories.map((category) => (
                <Chip key={category} size="sm">
                  {category}
                </Chip>
              ))}
            </div>
          </Link>
        </Card>
      )}
    />
  );
}
