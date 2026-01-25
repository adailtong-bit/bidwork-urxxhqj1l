import { useAdStore } from '@/stores/useAdStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AdBannerProps {
  region: string
  category: string
  className?: string
}

export function AdBanner({ region, category, className }: AdBannerProps) {
  const { getAdsByContext } = useAdStore()
  const ads = getAdsByContext(region, category)

  if (ads.length === 0) return null

  // Pick random relevant ad
  const ad = ads[Math.floor(Math.random() * ads.length)]

  return (
    <Card
      className={`overflow-hidden border-dashed border-2 bg-muted/20 ${className}`}
    >
      <CardContent className="p-0 relative flex flex-col md:flex-row items-center">
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="text-[10px] opacity-70">
            Publicidade
          </Badge>
        </div>
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full md:w-32 h-32 object-cover"
        />
        <div className="p-4 flex-1">
          <h4 className="font-bold text-lg">{ad.title}</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {ad.type === 'regional'
              ? `Oferta Exclusiva para ${ad.region}`
              : `Destaque em ${ad.category}`}
          </p>
          <a
            href={ad.link}
            className="text-sm font-medium text-primary hover:underline"
          >
            Saiba mais &rarr;
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
