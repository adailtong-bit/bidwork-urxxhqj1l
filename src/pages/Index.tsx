import { useEffect, useRef } from 'react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { PromoBanner } from '@/components/home/PromoBanner'
import { ListingCard } from '@/components/home/ListingCard'
import { MyAdsDashboard } from '@/components/home/MyAdsDashboard'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useJobStore } from '@/stores/useJobStore'

export default function Index() {
  const { t } = useLanguageStore()

  const { jobs, addJob } = useJobStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const hasProducts = jobs.some((j) => j.listingType === 'product')
    if (!hasProducts) {
      const mockListingsData = [
        {
          title: '2016 Hyundai Veloster',
          price: 5850,
          image: 'https://img.usecurling.com/p/400/400?q=car',
          location: 'Kissimmee, FL',
          type: 'product',
          budget: 5850,
        },
        {
          title: 'Pokémon Cards Rare',
          price: 30,
          image: 'https://img.usecurling.com/p/400/400?q=toys',
          location: 'Orlando, FL',
          type: 'product',
          budget: 30,
        },
        {
          title: 'Sofa Sectional Grey',
          price: 450,
          image: 'https://img.usecurling.com/p/400/400?q=sofa',
          location: 'Winter Park, FL',
          type: 'product',
          budget: 450,
        },
        {
          title: 'iPhone 13 Pro Max',
          price: 600,
          image: 'https://img.usecurling.com/p/400/400?q=smartphone',
          location: 'Kissimmee, FL',
          type: 'product',
          budget: 600,
        },
        {
          title: 'Roupas Infantis (Lote)',
          price: 0,
          image: 'https://img.usecurling.com/p/400/400?q=clothes',
          location: 'Sanford, FL',
          type: 'community',
          budget: 0,
        },
        {
          title: 'Cadeira de Escritório',
          price: 0,
          image: 'https://img.usecurling.com/p/400/400?q=chair',
          location: 'Orlando, FL',
          type: 'community',
          budget: 0,
        },
        {
          title: 'Apartamento 2 Quartos',
          price: 1200,
          image: 'https://img.usecurling.com/p/400/400?q=apartment',
          location: 'Orlando, FL',
          type: 'rental',
          budget: 1200,
        },
        {
          title: 'Betoneira 400L',
          price: 150,
          image: 'https://img.usecurling.com/p/400/400?q=mixer',
          location: 'Miami, FL',
          type: 'rental',
          budget: 150,
        },
      ]

      mockListingsData.forEach((item, index) => {
        addJob({
          title: item.title,
          description: `Ótima oportunidade para adquirir ${item.title}. Entre em contato para mais detalhes ou para negociar!`,
          type: 'fixed',
          category: 'Geral',
          location: item.location,
          address: {
            zipCode: '00000',
            street: 'Main St',
            number: '1',
            neighborhood: 'Centro',
            city: item.location.split(',')[0],
            state: item.location.split(',')[1]?.trim() || 'FL',
            country: 'US',
          },
          budget: item.budget,
          salePrice:
            item.type === 'product' || item.type === 'community'
              ? item.price
              : undefined,
          rentalRate: item.type === 'rental' ? item.price : undefined,
          listingType: item.type as any,
          photos: [item.image],
          publicationDate: new Date(),
          premiumType: index < 2 ? 'region' : 'none',
          regionCode: item.location.split(',')[1]?.trim() || 'FL',
          contactPhone: '(00) 0000-0000',
          ownerId: 'owner-1',
          ownerName: 'Usuário Demo',
        })
      })
    }
  }, [jobs, addJob])

  const mappedListings = jobs.map((j) => {
    let tabType = 'jobs'
    if (j.listingType === 'rental') tabType = 'rentals'
    if (j.listingType === 'product') {
      tabType = j.salePrice === 0 || j.budget === 0 ? 'doacao' : 'desapego'
    }
    if (j.listingType === 'community') tabType = 'doacao'

    return {
      id: j.id,
      title: j.title,
      price:
        j.listingType === 'product' || j.listingType === 'community'
          ? (j.salePrice ?? j.budget)
          : j.listingType === 'rental'
            ? (j.rentalRate ?? j.budget)
            : j.budget,
      image: j.photos?.[0] || 'https://img.usecurling.com/p/400/400?q=package',
      location: j.location,
      type: tabType,
      status: j.status,
    }
  })

  const renderSection = (title: string, type: string, filterType: string) => {
    const items = mappedListings
      .filter((item) => item.type === type)
      .slice(0, 4)
    if (items.length === 0) return null

    return (
      <Card className="border-none shadow-sm mb-6 bg-muted/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link to={`/find-jobs?type=${filterType}`}>
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                location={item.location}
                status={item.status}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full mt-4 sm:hidden"
          >
            <Link to={`/find-jobs?type=${filterType}`}>
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2 pt-2 md:container md:mx-auto md:max-w-6xl pb-20">
      <CategoryTiles />
      <PromoBanner />
      <MyAdsDashboard />

      <div className="px-4 mt-2">
        <div className="space-y-2 pt-2">
          {renderSection('Desapego (Marketplace)', 'desapego', 'product')}
          {renderSection('Doações e Comunidade', 'doacao', 'community')}
          {renderSection('Aluguéis', 'rentals', 'rental')}
          {renderSection('Vagas em Destaque', 'jobs', 'job')}
        </div>
      </div>
    </div>
  )
}
