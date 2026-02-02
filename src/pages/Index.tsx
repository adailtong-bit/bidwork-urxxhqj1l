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
    image:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&h=400',
    location: 'Kissimmee, FL',
  },
  {
    id: 2,
    title: 'Pokémon Cards Rare',
    price: 30,
    image:
      'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=400&h=400',
    location: 'Orlando, FL',
  },
  {
    id: 3,
    title: 'Sofa Sectional Grey',
    price: 450,
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&h=400',
    location: 'Winter Park, FL',
  },
  {
    id: 4,
    title: 'iPhone 13 Pro Max',
    price: 600,
    image:
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=400&h=400',
    location: 'Kissimmee, FL',
  },
  {
    id: 5,
    title: 'Mountain Bike',
    price: 120,
    image:
      'https://images.unsplash.com/photo-1576435728678-be95e39e83d3?auto=format&fit=crop&w=400&h=400',
    location: 'Sanford, FL',
  },
  {
    id: 6,
    title: 'Gaming PC Setup',
    price: 1200,
    image:
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&h=400',
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
