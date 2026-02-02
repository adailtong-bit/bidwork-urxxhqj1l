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
    'All',
    'Home Improvement',
    'Lawn & Garden',
    'Cleaning',
    'Tech Support',
    'Automotive',
  ]

  return (
    <div className="pt-2 md:container md:mx-auto md:max-w-4xl relative min-h-screen pb-20">
      {/* Horizontal Sub-Category Scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide sticky top-16 bg-background z-40 py-2">
        {subCategories.map((cat, i) => (
          <Badge
            key={i}
            variant={i === 0 ? 'default' : 'outline'}
            className="flex-shrink-0 cursor-pointer px-4 py-1.5 text-sm"
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">{t('services.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          asChild
          className="rounded-full h-12 px-6 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
        >
          <Link to="/post-job">
            <Plus className="h-5 w-5" />
            {t('services.post_btn')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
