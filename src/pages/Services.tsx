import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceCard } from '@/components/home/ServiceCard'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function Services() {
  const { t } = useLanguageStore()

  const categories = [
    {
      id: 'ac',
      title: t('service.ac'),
      image:
        'https://img.usecurling.com/p/400/300?q=air%20conditioner%20repair',
    },
    {
      id: 'handyman',
      title: t('service.handyman'),
      image: 'https://img.usecurling.com/p/400/300?q=handyman%20worker',
    },
    {
      id: 'painting',
      title: t('service.painting'),
      image: 'https://img.usecurling.com/p/400/300?q=interior%20painting',
    },
    {
      id: 'appliance',
      title: t('service.appliance'),
      image:
        'https://img.usecurling.com/p/400/300?q=washing%20machine%20repair',
    },
    {
      id: 'assembly',
      title: t('service.assembly'),
      image: 'https://img.usecurling.com/p/400/300?q=furniture%20assembly',
    },
    {
      id: 'tv',
      title: t('service.tv'),
      image: 'https://img.usecurling.com/p/400/300?q=tv%20wall%20mount',
    },
    {
      id: 'junk',
      title: t('service.junk'),
      image: 'https://img.usecurling.com/p/400/300?q=junk%20removal',
    },
    {
      id: 'trimming',
      title: t('service.trimming'),
      image: 'https://img.usecurling.com/p/400/300?q=garden%20trimming',
    },
  ]

  const subCategories = [
    { id: 'all', label: t('service.subcategory.all') },
    { id: 'home', label: t('service.subcategory.home_improvement') },
    { id: 'lawn', label: t('service.subcategory.lawn_garden') },
    { id: 'cleaning', label: t('service.subcategory.cleaning') },
    { id: 'tech', label: t('service.subcategory.tech_support') },
    { id: 'auto', label: t('service.subcategory.automotive') },
  ]

  return (
    <div className="pt-6 md:container md:mx-auto md:max-w-6xl relative min-h-screen pb-20">
      {/* Horizontal Sub-Category Scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide sticky top-16 bg-background z-30 py-2">
        {subCategories.map((cat, i) => (
          <Badge
            key={cat.id}
            variant={i === 0 ? 'default' : 'outline'}
            className="flex-shrink-0 cursor-pointer px-4 py-1.5 text-sm"
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      <div className="px-4 space-y-6">
        <h2 className="text-2xl font-bold">{t('services.title')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <ServiceCard
              key={cat.id}
              title={cat.title}
              image={cat.image}
              link={`/find-jobs?category=${cat.id}`}
            />
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8">
        <Button
          asChild
          className="rounded-full h-14 px-6 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
        >
          <Link to="/post-job">
            <Plus className="h-6 w-6" />
            <span className="text-base">{t('services.post_btn')}</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
