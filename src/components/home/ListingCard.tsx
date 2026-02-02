import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface ListingProps {
  image: string
  title: string
  price: number
  location?: string
}

export function ListingCard({ image, title, price, location }: ListingProps) {
  const { formatCurrency } = useLanguageStore()
  const [imgSrc, setImgSrc] = useState(image)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(image)
    setHasError(false)
  }, [image])

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={imgSrc}
          alt={title}
          onError={() => {
            if (!hasError) {
              setHasError(true)
              // Fallback to a reliable abstract placeholder instead of Unsplash
              setImgSrc('https://img.usecurling.com/p/400/400?q=product')
            }
          }}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-2">
        <h3 className="font-normal text-sm line-clamp-1 truncate">{title}</h3>
        <p className="font-bold text-base mt-0.5">{formatCurrency(price)}</p>
        {location && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {location}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
