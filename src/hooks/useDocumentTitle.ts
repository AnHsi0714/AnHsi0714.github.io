import { useEffect } from 'react'

export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    document.title = title

    if (description === undefined) return

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }, [title, description])
}
