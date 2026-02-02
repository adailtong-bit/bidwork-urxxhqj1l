import { useState, useEffect } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackSrc = 'https://img.usecurling.com/p/400/400?q=package',
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If the current image is already the fallback and it failed, stop trying
    if (imgSrc === fallbackSrc) {
      setImgSrc(undefined)
      return
    }

    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }

    if (props.onError) {
      props.onError(e)
    }
  }

  // If img source is undefined (final failure state), show placeholder
  if (imgSrc === undefined) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground min-h-[100px] w-full h-full',
          className,
        )}
      >
        <ImageOff className="h-8 w-8 opacity-50" />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      crossOrigin="anonymous"
      {...props}
    />
  )
}
