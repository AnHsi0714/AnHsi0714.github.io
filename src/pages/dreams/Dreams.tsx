import dreamsData from '../../../content/dreams.json'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import type { Dream, DreamStatus } from '../../types/content'

const dreams = dreamsData as Dream[]

const statusLabel: Record<DreamStatus, string> = {
  todo: '尚未開始',
  doing: '進行中',
  done: '已達成',
}

export default function Dreams() {
  return (
    <section>
      <h1 className="text-2xl font-bold">夢想</h1>
      <p className="mt-2 text-neutral-600">想做、正在做、做到了的事，都記在這裡。</p>

      {dreams.length === 0 ? (
        <EmptyState title="尚無夢想清單" description="之後會陸續補上想做的事。" />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {dreams.map((dream) => (
            <li key={dream.title}>
              <Card className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{dream.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">{dream.desc}</p>
                </div>
                <Badge variant={dream.status} className="shrink-0">
                  {statusLabel[dream.status]}
                </Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
