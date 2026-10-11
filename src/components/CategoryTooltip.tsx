import type { ReactNode } from "react";
import { useTranslation } from "../i18n/useTranslation";
import Tooltip from "./Tooltip";

interface CategoryTooltipProps {
  category: string;
  children: ReactNode;
}

// 知識點分類是縮寫（FLT、EVAL…），hover 時顯示全名；沒登記全名的分類就不包 Tooltip
export default function CategoryTooltip({ category, children }: CategoryTooltipProps) {
  const { t } = useTranslation();
  const name = t.knowledge.categoryNames[category];
  if (!name) return <>{children}</>;
  return <Tooltip content={name} underline={false}>{children}</Tooltip>;
}
