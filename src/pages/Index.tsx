import { useLanguageStore } from '@/stores/useLanguageStore'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { PromoBanner } from '@/components/home/PromoBanner'
import { ListingCard } from '@/components/home/ListingCard'
import { MyAdsDashboard } from '@/components/home/MyAdsDashboard'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

// Extended Mock Data with types
const mockListings = [
  {
    id: 1,
    title: '2016 Hyundai Veloster',
    price: 5850,
    image: 'https://img.usecurling.com/p/400/400?q=car',
    location: 'Kissimmee, FL',
    type: 'sale',
  },
  {
    id: 2,
    title: 'Pokémon Cards Rare',
    price: 30,
    image: 'https://img.usecurling.com/p/400/400?q=toys',
    location: 'Orlando, FL',
    type: 'sale',
  },
  {
    id: 3,
    title: 'Sofa Sectional Grey',
    price: 450,
    image: 'https://img.usecurling.com/p/400/400?q=sofa',
    location: 'Winter Park, FL',
    type: 'sale',
  },
  {
    id: 4,
    title: 'iPhone 13 Pro Max',
    price: 600,
    image: 'https://img.usecurling.com/p/400/400?q=smartphone',
    location: 'Kissimmee, FL',
    type: 'sale',
  },
  {
    id: 5,
    title: 'Mountain Bike',
    price: 120,
    image: 'https://img.usecurling.com/p/400/400?q=bicycle',
    location: 'Sanford, FL',
    type: 'sale',
  },
  {
    id: 6,
    title: 'Apartamento 2 Quartos',
    price: 1200,
    image: 'https://img.usecurling.com/p/400/400?q=apartment',
    location: 'Orlando, FL',
    type: 'rentals',
  },
  {
    id: 7,
    title: 'Betoneira 400L',
    price: 150,
    image: 'https://img.usecurling.com/p/400/400?q=concrete%20mixer',
    location: 'Miami, FL',
    type: 'rentals',
  },
  {
    id: 8,
    title: 'Encontro de Empreiteiros',
    price: 0,
    image: 'https://img.usecurling.com/p/400/400?q=meeting',
    location: 'Online',
    type: 'community',
  },
  {
    id: 9,
    title: 'Vaga: Mestre de Obras',
    price: 5000,
    image: 'https://img.usecurling.com/p/400/400?q=construction%20worker',
    location: 'Tampa, FL',
    type: 'jobs',
  },
]

export default function Index() {
  const { t } = useLanguageStore()
  const [searchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'all'

  const filteredListings = mockListings.filter(
    (item) => activeTab === 'all' || item.type === activeTab,
  )

  return (
    <div className="flex flex-col gap-2 pt-2 md:container md:mx-auto md:max-w-6xl pb-20">
      {/* Navigation Tiles */}
      <CategoryTiles />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* My Ads Dashboard (Visible only if user is logged in and has ads) */}
      <MyAdsDashboard />

      {/* Listings Section */}
      <div className="px-4 mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {activeTab === 'sale' && 'Produtos à Venda'}
            {activeTab === 'rentals' && 'Aluguéis Disponíveis'}
            {activeTab === 'community' && 'Eventos da Comunidade'}
            {activeTab === 'jobs' && 'Vagas em Destaque'}
            {activeTab === 'all' && t('home.listings.title')}
          </h2>
          <Button variant="ghost" size="icon">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredListings.map((item) => (
            <ListingCard
              key={item.id}
              title={item.title}
              price={item.price}
              image={item.image}
              location={item.location}
            />
          ))}
          {filteredListings.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              Nenhum item encontrado para esta categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
