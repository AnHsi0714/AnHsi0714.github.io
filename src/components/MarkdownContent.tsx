import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Term from "./Term";
import { slugifyHeadingText } from "../lib/markdown";

interface MarkdownContentProps {
  children: string;
  className?: string;
  // 目前這段內容屬於哪個專案／文章（傳 slug），讓內文裡的 Term 彈窗能只顯示這個情境下的
  // application，而不是把所有用過這個詞的專案／文章的說明全部列出來
  contextSlug?: string;
}

// 把標題底下巢狀的 React 節點（粗體、行內程式碼等）攤平成純文字，用來算 id
function headingToPlainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(headingToPlainText).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return headingToPlainText(props?.children);
  }
  return "";
}

// 標題的 id 只由「這個標題自己渲染出來的文字」決定，是個純函式：不依賴渲染順序，
// 也不共用任何跨節點的計數器。曾經用一個渲染時遞增的 ref 當作標題索引來對應
// extractHeadings 算出的清單，但 StrictMode 下每個節點的 render 會被重複呼叫，
// 計數器因此被多算，導致部分標題對不到 id、之後的標題全部錯位。
const renderHeading =
  (Tag: "h2" | "h3" | "h4") =>
  ({ children: headingChildren, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugifyHeadingText(headingToPlainText(headingChildren));
    return (
      <Tag id={id} {...props}>
        {headingChildren}
      </Tag>
    );
  };

// 定義在模組層級，identity 在每次渲染間保持穩定，避免 h2/h3/h4 節點被當成不同元件類型重新掛載
const H2 = renderHeading("h2");
const H3 = renderHeading("h3");
const H4 = renderHeading("h4");

export default function MarkdownContent({
  children,
  className,
  contextSlug,
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
          h2: H2,
          h3: H3,
          h4: H4,
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
              return (
                <Term id={termId} contextSlug={contextSlug}>
                  {spanChildren}
                </Term>
              );
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
