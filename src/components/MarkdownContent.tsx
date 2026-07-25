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
          a: ({ children: linkChildren, href, ...props }) => {
            // 站內錨點(如 remark-gfm 的腳註 #user-content-fn-1)要在同頁捲動，
            // 不能開新分頁，否則等於重新載入整篇文章而看不到跳轉效果
            const isAnchor = href?.startsWith("#");
            return (
              <a
                {...props}
                href={href}
                {...(isAnchor ? {} : { target: "_blank", rel: "noreferrer" })}
              >
                {linkChildren}
              </a>
            );
          },
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
