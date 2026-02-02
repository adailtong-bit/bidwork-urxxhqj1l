import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { SafeImage } from '@/components/SafeImage'

interface ServiceCardProps {
  title: string
  image: string
  link?: string
}

export function ServiceCard({ title, image, link = '#' }: ServiceCardProps) {
  return (
    <Link to={link}>
      <Card className="relative overflow-hidden aspect-[4/3] rounded-lg border-none group cursor-pointer">
        <div className="absolute inset-0">
          <SafeImage
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 p-3">
          <h3 className="text-white font-medium text-sm md:text-base leading-tight">
            {title}
          </h3>
        </div>
      </Card>
    </Link>
  )
}
