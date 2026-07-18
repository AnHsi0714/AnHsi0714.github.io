import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Term from "./Term";

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ children: linkChildren, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {linkChildren}
            </a>
          ),
          span: ({ children: spanChildren, ...props }) => {
            const termId = (props as Record<string, unknown>)["data-term"];
            if (typeof termId === "string") {
              return <Term id={termId}>{spanChildren}</Term>;
            }
            return <span {...props}>{spanChildren}</span>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
