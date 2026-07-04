import { useParams } from 'react-router-dom'

export default function GalleryDetail() {
  const { slug } = useParams()
  return (
    <section>
      <h1 className="text-2xl font-bold">作品：{slug}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        詳細頁待實作（聚光燈展覽感 + 動態載入 p5.js instance mode sketch，見 docs/ARCHITECTURE.md §6.1）。
      </p>
    </section>
  )
}
