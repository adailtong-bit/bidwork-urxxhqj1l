import { Link } from 'react-router-dom'
import { Tag, Wrench, Briefcase, Key, Gift } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function CategoryTiles() {
  const tiles = [
    {
      id: 'desapego',
      label: 'Desapego',
      icon: Tag,
      path: '/find-jobs?type=product',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBorder: 'hover:border-green-300',
      hoverBg: 'hover:bg-green-100/80',
    },
    {
      id: 'doacao',
      label: 'Doação',
      icon: Gift,
      path: '/find-jobs?type=community',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      hoverBorder: 'hover:border-rose-300',
      hoverBg: 'hover:bg-rose-100/80',
    },
    {
      id: 'jobs',
      label: 'Vagas',
      icon: Briefcase,
      path: '/find-jobs?type=job',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBorder: 'hover:border-orange-300',
      hoverBg: 'hover:bg-orange-100/80',
    },
    {
      id: 'services',
      label: 'Serviços',
      icon: Wrench,
      path: '/services',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-300',
      hoverBg: 'hover:bg-blue-100/80',
    },
    {
      id: 'rentals',
      label: 'Aluguéis',
      icon: Key,
      path: '/find-jobs?type=rental',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBorder: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-100/80',
    },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
      {tiles.map((tile, idx) => {
        return (
          <Link key={idx} to={tile.path} className="flex-shrink-0 group">
            <Card
              className={cn(
                'w-28 h-24 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer border-2 border-transparent active:scale-95 shadow-sm',
                tile.bgColor,
                tile.hoverBorder,
                tile.hoverBg,
              )}
            >
              <tile.icon
                className={cn(
                  'h-8 w-8 transition-transform duration-200 group-hover:scale-110',
                  tile.color,
                )}
              />
              <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                {tile.label}
              </span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
