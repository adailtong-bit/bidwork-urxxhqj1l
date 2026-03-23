import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Link } from 'react-router-dom'
import { SafeImage } from '@/components/SafeImage'

export function PromoBanner() {
  const { t, formatCurrency } = useLanguageStore()
  // Replaced the placeholder image with a high-quality application dashboard representation
  const imgSrc =
    'https://img.usecurling.com/p/600/400?q=dashboard%20app&color=blue'

  const serviceName = t('home.service.dog_training')
  const promoPrice = 150

  return (
    <div className="mx-4 my-4 bg-white rounded-xl shadow-sm border overflow-hidden relative">
      <div className="p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-4 text-center md:text-left z-10">
          <h2 className="text-xl md:text-2xl font-bold max-w-xs mx-auto md:mx-0 leading-tight">
            {t('home.promo.text', {
              service: serviceName,
              price: formatCurrency(promoPrice),
            })}
          </h2>
          <Button
            className="bg-primary hover:bg-primary/90 text-white rounded-full font-semibold px-6"
            asChild
          >
            <Link to="/services">{t('home.promo.btn')}</Link>
          </Button>
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <SafeImage
            src={imgSrc}
            alt="Application Dashboard"
            className="h-36 md:h-40 object-cover rounded-md shadow-md border"
          />
        </div>
      </div>
      <div className="absolute right-0 top-0 w-48 h-48 bg-primary/10 rounded-bl-full -z-0 opacity-50" />
    </div>
  )
}
