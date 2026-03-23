import { Link, useSearchParams } from 'react-router-dom'
import { Tag, Wrench, Briefcase, Key, Gift } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function CategoryTiles() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab')

  const tiles = [
    {
      id: 'desapego',
      label: 'Desapego',
      icon: Tag,
      path: '/?tab=desapego',
      color: 'text-green-600',
    },
    {
      id: 'doacao',
      label: 'Doação',
      icon: Gift,
      path: '/?tab=doacao',
      color: 'text-rose-500',
    },
    {
      id: 'jobs',
      label: 'Vagas',
      icon: Briefcase,
      path: '/?tab=jobs',
      color: 'text-orange-600',
    },
    {
      id: 'services',
      label: 'Serviços',
      icon: Wrench,
      path: '/services',
      color: 'text-blue-600',
    },
    {
      id: 'rentals',
      label: 'Aluguéis',
      icon: Key,
      path: '/?tab=rentals',
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
      {tiles.map((tile, idx) => {
        const isActive = activeTab === tile.id
        return (
          <Link key={idx} to={tile.path} className="flex-shrink-0">
            <Card
              className={`w-28 h-24 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all cursor-pointer active:scale-95 duration-150 ${isActive ? 'border-primary shadow-md bg-primary/5' : ''}`}
            >
              <tile.icon className={`h-8 w-8 ${tile.color}`} />
              <span className="text-xs font-semibold">{tile.label}</span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
