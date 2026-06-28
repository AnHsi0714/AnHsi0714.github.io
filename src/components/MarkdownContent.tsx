import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  children: string;
  className?: string;
}

export default function MarkdownContent({
  children,
  className,
}: MarkdownContentProps) {
  const classNames = ["prose prose-neutral max-w-none", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
