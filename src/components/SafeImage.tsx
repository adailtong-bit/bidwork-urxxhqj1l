import { useState } from 'react'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export function SafeImage({
  src,
  fallbackSrc = 'https://img.usecurling.com/p/200/200?color=gray',
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  return <img src={imgSrc} alt={alt || ''} onError={handleError} {...props} />
}
