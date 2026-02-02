import { useLanguageStore } from '@/stores/useLanguageStore'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { PromoBanner } from '@/components/home/PromoBanner'
import { ListingCard } from '@/components/home/ListingCard'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

// Mock Data
const mockListings = [
  {
    id: 1,
    title: '2016 Hyundai Veloster',
    price: 5850,
    image: 'https://img.usecurling.com/p/400/400?q=white%20car',
    location: 'Kissimmee, FL',
  },
  {
    id: 2,
    title: 'Pokémon Cards Rare',
    price: 30,
    image: 'https://img.usecurling.com/p/400/400?q=pokemon%20card',
    location: 'Orlando, FL',
  },
  {
    id: 3,
    title: 'Sofa Sectional Grey',
    price: 450,
    image: 'https://img.usecurling.com/p/400/400?q=grey%20sofa',
    location: 'Winter Park, FL',
  },
  {
    id: 4,
    title: 'iPhone 13 Pro Max',
    price: 600,
    image: 'https://img.usecurling.com/p/400/400?q=iphone',
    location: 'Kissimmee, FL',
  },
  {
    id: 5,
    title: 'Mountain Bike',
    price: 120,
    image: 'https://img.usecurling.com/p/400/400?q=bike',
    location: 'Sanford, FL',
  },
  {
    id: 6,
    title: 'Gaming PC Setup',
    price: 1200,
    image: 'https://img.usecurling.com/p/400/400?q=gaming%20pc',
    location: 'Orlando, FL',
  },
]

export default function Index() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-2 pt-2 md:container md:mx-auto md:max-w-4xl">
      {/* Navigation Tiles */}
      <CategoryTiles />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* Listings Section */}
      <div className="px-4 mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('home.listings.title')}</h2>
          <Button variant="ghost" size="icon">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockListings.map((item) => (
            <ListingCard
              key={item.id}
              title={item.title}
              price={item.price}
              image={item.image}
              location={item.location}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
