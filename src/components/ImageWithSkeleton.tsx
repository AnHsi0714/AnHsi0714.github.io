import { useState, type ImgHTMLAttributes } from "react";
import Skeleton from "./Skeleton";

interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  // 版面尺寸（aspect-ratio、寬高、圓角…）交給呼叫端決定，套在包住 img 的
  // wrapper 上，這樣骨架跟圖片載入前後都能撐住同一塊版位，不會有跳動。
  wrapperClassName?: string;
}

export default function ImageWithSkeleton({
  wrapperClassName,
  className,
  onLoad,
  alt,
  ...rest
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span
      className={["relative block overflow-hidden", wrapperClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        {...rest}
        alt={alt}
        className={[
          "h-full w-full transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
    </span>
  );
}
