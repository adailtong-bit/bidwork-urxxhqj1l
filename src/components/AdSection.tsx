import { useAdStore } from '@/stores/useAdStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AdSectionProps {
  segment: 'dashboard' | 'search' | 'profile'
}

export function AdSection({ segment }: AdSectionProps) {
  const { getAdsBySegment } = useAdStore()
  const ads = getAdsBySegment(segment)

  if (ads.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <Card className="overflow-hidden border-dashed border-2 bg-muted/20 hover:border-primary/50 transition-colors h-full">
            <CardContent className="p-0 flex h-32 md:h-24">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-32 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col justify-center relative">
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2 text-[10px] opacity-70"
                >
                  Publicidade
                </Badge>
                <h4 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors line-clamp-1">
                  {ad.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {ad.type === 'regional'
                    ? `Oferta para ${ad.region}`
                    : `Destaque em ${ad.category}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}
