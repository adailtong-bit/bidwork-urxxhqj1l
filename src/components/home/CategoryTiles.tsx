import { Link } from 'react-router-dom'
import { Tag, Wrench, Users, Briefcase, Key } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function CategoryTiles() {
  const { currentLanguage } = useLanguageStore()

  // Simplified manual translation mapping since specific keys might be missing in translations.ts
  const getLabel = (pt: string, en: string, es: string) => {
    if (currentLanguage === 'pt') return pt
    if (currentLanguage === 'es') return es
    return en
  }

  const tiles = [
    {
      label: getLabel('À Venda', 'For Sale', 'En Venta'),
      icon: Tag,
      path: '/?tab=sale',
      color: 'text-green-600',
    },
    {
      label: getLabel('Serviços', 'Services', 'Servicios'),
      icon: Wrench,
      path: '/services',
      color: 'text-blue-600',
    },
    {
      label: getLabel('Comunidade', 'Community', 'Comunidad'),
      icon: Users,
      path: '/?tab=community',
      color: 'text-purple-600',
    },
    {
      label: getLabel('Vagas', 'Jobs', 'Empleos'),
      icon: Briefcase,
      path: '/find-jobs',
      color: 'text-orange-600',
    },
    {
      label: getLabel('Aluguéis', 'Rentals', 'Alquileres'),
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
