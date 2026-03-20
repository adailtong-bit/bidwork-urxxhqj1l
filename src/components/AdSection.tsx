import { useEffect } from 'react'
import { useAdStore } from '@/stores/useAdStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface AdSectionProps {
  segment: 'dashboard' | 'search' | 'profile' | 'home'
}

export function AdSection({ segment }: AdSectionProps) {
  const adStore = useAdStore() || {}
  const { getAdsBySegment, trackView, trackClick, rateAd } = adStore
  const ads =
    typeof getAdsBySegment === 'function' ? getAdsBySegment(segment) : []
  const { t } = useLanguageStore()

  useEffect(() => {
    // Simulate impression tracking
    if (typeof trackView === 'function' && Array.isArray(ads)) {
      ads.forEach((ad) => trackView(ad.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]) // Simple dependency to re-track on segment change

  if (!Array.isArray(ads) || ads.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {ads.map((ad) => (
        <Card
          key={ad.id}
          className="overflow-hidden border-dashed border-2 bg-muted/20 hover:border-primary/50 transition-colors group h-full flex flex-col"
        >
          <CardContent className="p-0 flex flex-row h-full relative">
            <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-1 shadow-sm backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (typeof rateAd === 'function') rateAd(ad.id, 'like')
                }}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="sr-only">Like</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (typeof rateAd === 'function') rateAd(ad.id, 'dislike')
                }}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="sr-only">Dislike</span>
              </Button>
            </div>

            <div className="w-32 sm:w-36 shrink-0 relative bg-muted">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="p-3 sm:p-4 flex-1 flex flex-col relative min-h-[9rem]">
              <div className="flex justify-between items-start mb-2">
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium opacity-80 px-1.5 py-0 h-5"
                >
                  {t('ad.badge')}
                </Badge>
                {/* Spacer to reserve space for absolute buttons */}
                <div className="w-16 h-4 shrink-0" aria-hidden="true" />
              </div>

              <h4 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-2 pr-1">
                {ad.title}
              </h4>

              <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed flex-grow">
                {ad.type === 'regional'
                  ? t('ad.offer', { region: ad.region || '' })
                  : t('ad.highlight', { category: ad.category || '' })}
              </p>

              <div className="mt-auto">
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                  onClick={() => {
                    if (typeof trackClick === 'function') trackClick(ad.id)
                  }}
                >
                  {t('ad.visit')} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
