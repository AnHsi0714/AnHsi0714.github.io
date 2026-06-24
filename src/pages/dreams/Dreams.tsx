import dreamsData from '../../../content/dreams.json'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import type { Dream } from '../../types/content'

const dreams = dreamsData as Dream[]

export default function Dreams() {
  return (
    <section>
      <h1 className="text-2xl font-bold">夢想</h1>
      <p className="mt-2 text-neutral-600">想做的事，以及為什麼想做。</p>

      {dreams.length === 0 ? (
        <EmptyState title="尚無夢想清單" description="之後會陸續補上想做的事。" />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {dreams.map((dream) => (
            <li key={dream.title}>
              <Card>
                <p className="font-semibold">{dream.title}</p>
                <p className="mt-1 text-sm text-neutral-600">{dream.desc}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
