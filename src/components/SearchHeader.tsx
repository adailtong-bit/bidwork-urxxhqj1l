import { Search, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function SearchHeader() {
  const { t } = useLanguageStore()

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b md:hidden">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('search.placeholder')}
            className="w-full bg-muted pl-9 rounded-full h-9"
          />
        </div>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
