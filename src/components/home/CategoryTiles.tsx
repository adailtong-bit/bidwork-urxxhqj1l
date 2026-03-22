import { Link, useSearchParams } from 'react-router-dom'
import { Tag, Wrench, Users, Briefcase, Key } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function CategoryTiles() {
  const { currentLanguage } = useLanguageStore()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab')

  const getLabel = (pt: string, en: string, es: string) => {
    if (currentLanguage === 'pt') return pt
    if (currentLanguage === 'es') return es
    return en
  }

  const tiles = [
    {
      id: 'sale',
      label: getLabel('À Venda', 'For Sale', 'En Venta'),
      icon: Tag,
      path: '/?tab=sale',
      color: 'text-green-600',
    },
    {
      id: 'services',
      label: getLabel('Serviços', 'Services', 'Servicios'),
      icon: Wrench,
      path: '/services',
      color: 'text-blue-600',
    },
    {
      id: 'community',
      label: getLabel('Comunidade', 'Community', 'Comunidad'),
      icon: Users,
      path: '/?tab=community',
      color: 'text-purple-600',
    },
    {
      id: 'jobs',
      label: getLabel('Vagas', 'Jobs', 'Empleos'),
      icon: Briefcase,
      path: '/?tab=jobs',
      color: 'text-orange-600',
    },
    {
      id: 'rentals',
      label: getLabel('Aluguéis', 'Rentals', 'Alquileres'),
      icon: Key,
      path: '/?tab=rentals',
      color: 'text-red-600',
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
