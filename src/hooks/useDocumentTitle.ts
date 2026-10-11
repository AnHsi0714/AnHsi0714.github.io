import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 分享預覽與搜尋結果要的是完整網址；prerender 輸出的 HTML 也靠這個值寫入 og:url
const SITE_ORIGIN = 'https://anhsi0714.github.io'
const SITE_NAME = 'Cheng An Hsi'

interface DocumentMetaOptions {
  // 站內路徑（以 / 開頭）或完整網址；沒給就不放預覽圖
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

    const imageUrl = image ? (image.startsWith('/') ? `${SITE_ORIGIN}${image}` : image) : undefined

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:url', `${SITE_ORIGIN}${pathname}`)
    // 換頁時上一頁的預覽圖不能殘留，所以沒給圖就要把 og:image 移掉
    setMeta('property', 'og:image', imageUrl)
    setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
  }, [title, description, image, type, pathname])
}
