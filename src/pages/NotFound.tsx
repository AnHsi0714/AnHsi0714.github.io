import EmptyState from "../components/EmptyState";
import TextLink from "../components/TextLink";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useTranslation } from "../i18n/useTranslation";

export default function NotFound() {
  const { t } = useTranslation();
  useDocumentTitle(`${t.common.pageNotFoundTitle} · Cheng An Hsi`);

  return (
    <section>
      <TextLink to="/" className="mb-4 inline-block text-sm font-medium">
        {t.common.backToHome}
      </TextLink>
      <EmptyState
        title={t.common.pageNotFoundTitle}
        description={t.common.pageNotFoundDesc}
      />
    </section>
  );
}
