import { useState, useEffect } from 'react'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

// A highly reliable base64 SVG placeholder to replace the standard "broken image" square with a line
const defaultFallback = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#f1f5f9"/>
    <path d="M150 200L200 150L250 200L200 250L150 200Z" fill="#cbd5e1"/>
    <circle cx="200" cy="200" r="20" fill="#94a3b8"/>
  </svg>`,
)}`

export function SafeImage({
  src,
  fallbackSrc = defaultFallback,
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    } else if (imgSrc !== defaultFallback) {
      // Ultimate fallback if the provided fallbackSrc also fails
      setImgSrc(defaultFallback)
    }
  }

  return (
    <img
      src={imgSrc || defaultFallback}
      alt={alt || ''}
      onError={handleError}
      {...props}
    />
  )
}
