import { useEffect } from 'react'
import { useAdStore } from '@/stores/useAdStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react'

interface AdSectionProps {
  segment: 'dashboard' | 'search' | 'profile' | 'home'
}

export function AdSection({ segment }: AdSectionProps) {
  const { getAdsBySegment, trackView, trackClick, rateAd } = useAdStore()
  const ads = getAdsBySegment(segment)

  useEffect(() => {
    // Simulate impression tracking
    ads.forEach((ad) => trackView(ad.id))
  }, [segment]) // Simple dependency to re-track on segment change

  if (ads.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {ads.map((ad) => (
        <Card
          key={ad.id}
          className="overflow-hidden border-dashed border-2 bg-muted/20 hover:border-primary/50 transition-colors group"
        >
          <CardContent className="p-0 flex h-36 md:h-28 relative">
            <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-1 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  rateAd(ad.id, 'like')
                }}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  rateAd(ad.id, 'dislike')
                }}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>

            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-32 object-cover shrink-0"
            />
            <div className="p-4 flex-1 flex flex-col justify-center relative">
              <div className="flex justify-between items-start mb-1">
                <Badge variant="secondary" className="text-[10px] opacity-70">
                  Publicidade
                </Badge>
              </div>
              <h4 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors line-clamp-1">
                {ad.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 mb-2">
                {ad.type === 'regional'
                  ? `Oferta para ${ad.region}`
                  : `Destaque em ${ad.category}`}
              </p>

              <a
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 text-primary hover:underline mt-auto"
                onClick={() => trackClick(ad.id)}
              >
                Visitar site <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
