import { Link } from 'react-router-dom'
import { Tag, Wrench, Users, Briefcase, Key } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function CategoryTiles() {
  const { t } = useLanguageStore()

  const tiles = [
    {
      label: t('cat.forsale'),
      icon: Tag,
      path: '/?tab=sale',
      color: 'text-green-600',
    },
    {
      label: t('cat.services'),
      icon: Wrench,
      path: '/services',
      color: 'text-blue-600',
    },
    {
      label: t('cat.community'),
      icon: Users,
      path: '/?tab=community',
      color: 'text-purple-600',
    },
    {
      label: t('cat.jobs'),
      icon: Briefcase,
      path: '/find-jobs',
      color: 'text-orange-600',
    },
    {
      label: t('cat.rentals'),
      icon: Key,
      path: '/?tab=rentals',
      color: 'text-red-600',
    },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
      {tiles.map((tile, idx) => (
        <Link key={idx} to={tile.path} className="flex-shrink-0">
          <Card className="w-28 h-24 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow cursor-pointer active:scale-95 duration-150">
            <tile.icon className={`h-8 w-8 ${tile.color}`} />
            <span className="text-xs font-semibold">{tile.label}</span>
          </Card>
        </Link>
      ))}
    </div>
  )
}
