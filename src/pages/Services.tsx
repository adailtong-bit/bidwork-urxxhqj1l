import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceCard } from '@/components/home/ServiceCard'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function Services() {
  const { t } = useLanguageStore()
  const [activeFilter, setActiveFilter] = useState('all')

  const categories = [
    {
      id: 'ac',
      title: t('service.ac'),
      image:
        'https://img.usecurling.com/p/400/300?q=air%20conditioner%20repair',
      categoryId: 'home',
    },
    {
      id: 'handyman',
      title: t('service.handyman'),
      image: 'https://img.usecurling.com/p/400/300?q=handyman%20worker',
      categoryId: 'home',
    },
    {
      id: 'painting',
      title: t('service.painting'),
      image: 'https://img.usecurling.com/p/400/300?q=interior%20painting',
      categoryId: 'home',
    },
    {
      id: 'appliance',
      title: t('service.appliance'),
      image:
        'https://img.usecurling.com/p/400/300?q=washing%20machine%20repair',
      categoryId: 'home',
    },
    {
      id: 'assembly',
      title: t('service.assembly'),
      image: 'https://img.usecurling.com/p/400/300?q=furniture%20assembly',
      categoryId: 'home',
    },
    {
      id: 'tv',
      title: t('service.tv'),
      image: 'https://img.usecurling.com/p/400/300?q=tv%20wall%20mount',
      categoryId: 'tech',
    },
    {
      id: 'junk',
      title: t('service.junk'),
      image: 'https://img.usecurling.com/p/400/300?q=junk%20removal',
      categoryId: 'cleaning',
    },
    {
      id: 'trimming',
      title: t('service.trimming'),
      image: 'https://img.usecurling.com/p/400/300?q=garden%20trimming',
      categoryId: 'lawn',
    },
  ]

  const subCategories = [
    {
      id: 'all',
      label: t('service.subcategory.all', { defaultValue: 'Todos' }),
    },
    {
      id: 'home',
      label: t('service.subcategory.home_improvement', {
        defaultValue: 'Reformas',
      }),
    },
    {
      id: 'lawn',
      label: t('service.subcategory.lawn_garden', {
        defaultValue: 'Jardinagem',
      }),
    },
    {
      id: 'cleaning',
      label: t('service.subcategory.cleaning', { defaultValue: 'Limpeza' }),
    },
    {
      id: 'tech',
      label: t('service.subcategory.tech_support', {
        defaultValue: 'Tecnologia',
      }),
    },
    {
      id: 'auto',
      label: t('service.subcategory.automotive', { defaultValue: 'Auto' }),
    },
  ]

  const filteredCategories = categories.filter(
    (cat) => activeFilter === 'all' || cat.categoryId === activeFilter,
  )

  return (
    <div className="pt-6 md:container md:mx-auto md:max-w-6xl relative min-h-screen pb-20">
      {/* Horizontal Sub-Category Scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide sticky top-16 bg-background z-30 py-2">
        {subCategories.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeFilter === cat.id ? 'default' : 'outline'}
            className="flex-shrink-0 cursor-pointer px-4 py-1.5 text-sm transition-colors"
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      <div className="px-4 space-y-6">
        <h2 className="text-2xl font-bold">
          {t('services.title', { defaultValue: 'Serviços' })}
        </h2>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {filteredCategories.map((cat) => (
              <ServiceCard
                key={cat.id}
                title={cat.title}
                image={cat.image}
                link={`/find-jobs?category=${cat.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-muted/30 animate-in fade-in duration-500">
            <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Sem resultados</h3>
            <p className="text-muted-foreground max-w-sm">
              Nenhuma oportunidade encontrada para esta categoria.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setActiveFilter('all')}
            >
              Ver todos os serviços
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8">
        <Button
          asChild
          className="rounded-full h-14 px-6 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
        >
          <Link to="/post-job">
            <Plus className="h-6 w-6" />
            <span className="text-base">
              {t('services.post_btn', { defaultValue: 'Publicar' })}
            </span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
