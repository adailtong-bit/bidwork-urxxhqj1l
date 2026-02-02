import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Link } from 'react-router-dom'

export function PromoBanner() {
  const { t } = useLanguageStore()

  return (
    <div className="mx-4 my-4 bg-white rounded-xl shadow-sm border overflow-hidden relative">
      <div className="p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-4 text-center md:text-left z-10">
          <h2 className="text-xl md:text-2xl font-bold max-w-xs mx-auto md:mx-0 leading-tight">
            {t('home.promo.text', { service: 'Dog Training' })}
          </h2>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold px-6"
            asChild
          >
            <Link to="/services">{t('home.promo.btn')}</Link>
          </Button>
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <img
            src="https://img.usecurling.com/p/300/300?q=painter%20illustration&shape=outline&color=green"
            alt="Service Pro Illustration"
            className="h-32 object-contain mix-blend-multiply"
          />
        </div>
      </div>
      <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50" />
    </div>
  )
}
