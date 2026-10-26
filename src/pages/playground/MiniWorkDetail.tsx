import { useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import TextLink from "../../components/TextLink";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useTranslation } from "../../i18n/useTranslation";
import { miniWorkBySlug } from "./miniWorksRegistry";

export default function MiniWorkDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const work = miniWorkBySlug(slug);
  useDocumentTitle(
    work ? `${work.label(t)} · Cheng An Hsi` : `${t.playground.miniWorks.notFoundTitle} · Cheng An Hsi`,
    work ? work.desc(t) : undefined,
  );

  if (!work) {
    return (
      <section>
        <TextLink
          to="/playground/mini-works"
          restoreScroll
          className="mb-4 inline-block text-sm font-medium"
        >
          {t.playground.miniWorks.backToList}
        </TextLink>
        <EmptyState
          title={t.playground.miniWorks.notFoundTitle}
          description={t.playground.miniWorks.notFoundDesc}
        />
      </section>
    );
  }

  const Page = work.Component;
  return <Page />;
}
