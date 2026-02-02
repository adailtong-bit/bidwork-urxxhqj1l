import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { LanguageSelector } from '@/components/LanguageSelector'

export function SearchHeader() {
  const { t } = useLanguageStore()

  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            className="w-full pl-10 h-11 rounded-full bg-white text-foreground border-none shadow-sm focus-visible:ring-2 focus-visible:ring-offset-0"
            placeholder={t('search.placeholder')}
          />
        </div>
        <Button
          variant="ghost"
          className="hidden sm:flex text-primary-foreground hover:bg-primary-foreground/10 hover:text-white gap-1 px-2"
        >
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Kissimmee, FL</span>
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-primary-foreground">
            <LanguageSelector />
          </div>
        </div>
      </div>
      <div className="sm:hidden px-4 pb-3 flex justify-between items-center text-primary-foreground">
        <Button
          variant="ghost"
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-white gap-1 px-2 h-8"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">Kissimmee, FL</span>
        </Button>
      </div>
    </header>
  )
}
