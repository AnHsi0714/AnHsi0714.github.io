import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import Chip from "../../components/Chip";
import Reveal from "../../components/Reveal";
import TextLink from "../../components/TextLink";
import type { Article, ArticleSection } from "../../types/content";
import { usePublishedArticles } from "../../lib/articles";
import { useTranslation } from "../../i18n/useTranslation";
import type { Strings } from "../../i18n/strings";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

type SortOrder = "newest" | "oldest";
type FeaturedFilter = "all" | "featured" | "not-featured";
type SectionFilter = "all" | ArticleSection;

const SECTION_FILTERS: { key: SectionFilter; label: (t: Strings) => string }[] =
  [
    { key: "all", label: (t) => t.articles.sectionAll },
    { key: "academic", label: (t) => t.articles.sectionAcademic },
    { key: "technical", label: (t) => t.articles.sectionTechnical },
    { key: "reading", label: (t) => t.articles.sectionReading },
    { key: "notes", label: (t) => t.articles.sectionNotes },
  ];

export function Stars({ rating, t }: { rating: number; t: Strings }) {
  return (
    <span aria-label={t.articles.ratingLabel(rating)} className="inline-flex">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        return (
          <span
            key={i}
            className="relative inline-block text-[var(--color-border)]"
          >
            ★
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden text-amber-500"
                style={{ width: `${fill * 100}%` }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function ArticleRow({ article, t }: { article: Article; t: Strings }) {
  const subtitle = article.author
    ? `${article.author} · ${article.date}`
    : article.date;

  return (
    <Link to={`/articles/${article.slug}`} className="block">
      <Card className="flex items-start gap-4" hoverable>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{article.title}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
            {article.excerpt}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex flex-wrap justify-end gap-1">
            {article.categories.map((category) => (
              <Chip key={category} size="sm">
                {category}
              </Chip>
            ))}
          </div>
          {article.rating !== undefined && (
            <Stars rating={article.rating} t={t} />
          )}
        </div>
      </Card>
    </Link>
  );
}

export default function Articles() {
  const { t } = useTranslation();
  useDocumentTitle(`${t.articles.title} · AnHsi0714`, t.articles.subtitle);
  const articles = usePublishedArticles();

  const [selectedSection, setSelectedSection] = useState<SectionFilter>("all");
  const sectionArticles = useMemo(
    () =>
      selectedSection === "all"
        ? articles
        : articles.filter((article) => article.section === selectedSection),
    [articles, selectedSection],
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const activeFilterCount =
    (titleQuery ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (featuredFilter !== "all" ? 1 : 0);

  const filteredArticles = useMemo(() => {
    return sectionArticles
      .filter((article) => {
        if (titleQuery) {
          const query = titleQuery.trim().toLowerCase();
          const matchesTitle = article.title.toLowerCase().includes(query);
          const matchesCategory = article.categories.some((category) =>
            category.toLowerCase().includes(query),
          );
          if (!matchesTitle && !matchesCategory) return false;
        }
        if (minRating > 0 && (article.rating ?? 0) < minRating) return false;
        if (dateFrom && article.date < dateFrom) return false;
        if (dateTo && article.date > dateTo) return false;
        if (featuredFilter === "featured" && !article.featured) return false;
        if (featuredFilter === "not-featured" && article.featured) return false;
        return true;
      })
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date),
      );
  }, [
    sectionArticles,
    titleQuery,
    minRating,
    dateFrom,
    dateTo,
    sortOrder,
    featuredFilter,
  ]);

  const featuredArticles = useMemo(
    () => filteredArticles.filter((article) => article.featured),
    [filteredArticles],
  );

  return (
    <section>
      <Reveal>
        <h1 className="text-2xl font-bold">{t.articles.title}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {t.articles.subtitle}
        </p>
        <TextLink to="/knowledge" className="mt-1 block text-sm">
          {t.knowledge.entryPointHint}
        </TextLink>
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2">
        {SECTION_FILTERS.map(({ key, label }) => (
          <Chip
            key={key}
            clickable
            selected={selectedSection === key}
            onClick={() => setSelectedSection(key)}
          >
            {label(t)}
          </Chip>
        ))}
      </div>

      <div className="relative mt-4 inline-block" ref={filterRef}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          {t.common.filterSort}
          {activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
        </Button>

        {isFilterOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-[min(36rem,90vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label={t.articles.searchLabel}
                placeholder={t.common.keywordPlaceholder}
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                className="w-40"
              />

              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-text)]">
                {t.articles.minRating}
                <select
                  value={minRating}
                  onChange={(event) => setMinRating(Number(event.target.value))}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-normal text-[var(--color-text)]"
                >
                  <option
                    value={0}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    {t.articles.unlimited}
                  </option>
                  <option
                    value={5}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    5★
                  </option>
                  <option
                    value={4}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    4★{t.articles.andAbove}
                  </option>
                  <option
                    value={3}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    3★{t.articles.andAbove}
                  </option>
                  <option
                    value={2}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    2★{t.articles.andAbove}
                  </option>
                  <option
                    value={1}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    1★{t.articles.andAbove}
                  </option>
                </select>
              </label>

              <Input
                label={t.common.startDate}
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
              <Input
                label={t.common.endDate}
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {t.common.featuredFilterLabel}
              </span>
              {(
                [
                  ["all", t.common.filterAll],
                  ["featured", t.common.filterFeatured],
                  ["not-featured", t.common.filterNotFeatured],
                ] as [FeaturedFilter, string][]
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  clickable
                  selected={featuredFilter === value}
                  onClick={() => setFeaturedFilter(value)}
                >
                  {label}
                </Chip>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {t.common.sort}
              </span>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "newest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("newest")}
              >
                {t.common.newest}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "oldest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("oldest")}
              >
                {t.common.oldest}
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t.articles.noMatch}
            description={t.articles.tryAdjustFilter}
          />
        </div>
      ) : (
        <>
          {featuredArticles.length > 0 && featuredFilter !== "featured" && (
            <div className="mt-8">
              <p className="font-semibold text-[var(--color-primary)]">
                {t.articles.featuredSectionTitle}
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {featuredArticles.map((article, index) => (
                  <li key={article.slug}>
                    <Reveal delay={Math.min(index, 5) * 60}>
                      <ArticleRow article={article} t={t} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8">
            <p className="font-semibold text-[var(--color-primary)]">
              {t.articles.allSectionTitle}
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {filteredArticles.map((article, index) => (
                <li key={article.slug}>
                  <Reveal delay={Math.min(index, 5) * 60}>
                    <ArticleRow article={article} t={t} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
