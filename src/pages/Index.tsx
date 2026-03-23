import { useLanguageStore } from '@/stores/useLanguageStore'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { PromoBanner } from '@/components/home/PromoBanner'
import { ListingCard } from '@/components/home/ListingCard'
import { MyAdsDashboard } from '@/components/home/MyAdsDashboard'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, ArrowRight } from 'lucide-react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Extended Mock Data with types including desapego and doacao
const mockListings = [
  {
    id: 1,
    title: '2016 Hyundai Veloster',
    price: 5850,
    image: 'https://img.usecurling.com/p/400/400?q=car',
    location: 'Kissimmee, FL',
    type: 'desapego',
  },
  {
    id: 2,
    title: 'Pokémon Cards Rare',
    price: 30,
    image: 'https://img.usecurling.com/p/400/400?q=toys',
    location: 'Orlando, FL',
    type: 'desapego',
  },
  {
    id: 3,
    title: 'Sofa Sectional Grey',
    price: 450,
    image: 'https://img.usecurling.com/p/400/400?q=sofa',
    location: 'Winter Park, FL',
    type: 'desapego',
  },
  {
    id: 4,
    title: 'iPhone 13 Pro Max',
    price: 600,
    image: 'https://img.usecurling.com/p/400/400?q=smartphone',
    location: 'Kissimmee, FL',
    type: 'desapego',
  },
  {
    id: 5,
    title: 'Roupas Infantis (Lote)',
    price: 0,
    image: 'https://img.usecurling.com/p/400/400?q=baby%20clothes',
    location: 'Sanford, FL',
    type: 'doacao',
  },
  {
    id: 6,
    title: 'Cadeira de Escritório',
    price: 0,
    image: 'https://img.usecurling.com/p/400/400?q=office%20chair',
    location: 'Orlando, FL',
    type: 'doacao',
  },
  {
    id: 7,
    title: 'Apartamento 2 Quartos',
    price: 1200,
    image: 'https://img.usecurling.com/p/400/400?q=apartment',
    location: 'Orlando, FL',
    type: 'rentals',
  },
  {
    id: 8,
    title: 'Betoneira 400L',
    price: 150,
    image: 'https://img.usecurling.com/p/400/400?q=concrete%20mixer',
    location: 'Miami, FL',
    type: 'rentals',
  },
  {
    id: 9,
    title: 'Vaga: Mestre de Obras',
    price: 5000,
    image: 'https://img.usecurling.com/p/400/400?q=construction%20worker',
    location: 'Tampa, FL',
    type: 'jobs',
  },
  {
    id: 10,
    title: 'Vaga: Desenvolvedor Front-end',
    price: 8000,
    image: 'https://img.usecurling.com/p/400/400?q=programmer',
    location: 'Remoto',
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

  const renderSection = (title: string, type: string) => {
    const items = mockListings.filter((item) => item.type === type).slice(0, 4)
    if (items.length === 0) return null

    return (
      <Card className="border-none shadow-sm mb-6 bg-muted/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link to={`/?tab=${type}`}>
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <ListingCard
                key={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                location={item.location}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full mt-4 sm:hidden"
          >
            <Link to={`/?tab=${type}`}>
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

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
        {activeTab === 'all' ? (
          <div className="space-y-2 pt-2">
            {renderSection('Desapego (Marketplace)', 'desapego')}
            {renderSection('Doação', 'doacao')}
            {renderSection('Vagas em Destaque', 'jobs')}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold capitalize">
                {activeTab === 'desapego' && 'Desapego (Produtos)'}
                {activeTab === 'doacao' && 'Doações Disponíveis'}
                {activeTab === 'rentals' && 'Aluguéis Disponíveis'}
                {activeTab === 'jobs' && 'Vagas em Destaque'}
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
          </>
        )}
      </div>
    </div>
  )
}
