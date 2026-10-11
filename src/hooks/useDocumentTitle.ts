import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 分享預覽與搜尋結果要的是完整網址；prerender 輸出的 HTML 也靠這個值寫入 og:url
const SITE_ORIGIN = 'https://anhsi0714.github.io'
const SITE_NAME = 'Cheng An Hsi'
// 頁面沒有自己的預覽圖時用這張（1200x630），分享卡片才不會只有文字
const DEFAULT_IMAGE = '/images/og-default.png'

interface DocumentMetaOptions {
  // 站內路徑（以 / 開頭）或完整網址；沒給就用 DEFAULT_IMAGE
  image?: string
  type?: 'website' | 'article'
}

function setMeta(attribute: 'name' | 'property', key: string, content: string | undefined) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (content === undefined) {
    meta?.remove()
    return
  }
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.appendChild(meta)
  }
  meta.content = content
}

export function useDocumentTitle(
  title: string,
  description?: string,
  { image, type = 'website' }: DocumentMetaOptions = {},
): void {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title

    const source = image ?? DEFAULT_IMAGE
    const imageUrl = source.startsWith('/') ? `${SITE_ORIGIN}${source}` : source

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:url', `${SITE_ORIGIN}${pathname}`)
    setMeta('property', 'og:image', imageUrl)
    setMeta('name', 'twitter:card', 'summary_large_image')
  }, [title, description, image, type, pathname])
}
