import { Search, Bell, Menu, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { LanguageSelector } from '@/components/LanguageSelector'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function SearchHeader() {
  const { t } = useLanguageStore()
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { href: '/dashboard', label: t('nav.home') },
    { href: '/find-jobs', label: t('nav.find_jobs') },
    { href: '/services', label: t('nav.explore') },
  ]

  if (isAuthenticated) {
    navLinks.push({ href: '/my-jobs', label: t('nav.projects') })
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-primary shrink-0">
          BIDWORK
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive(link.href) ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar - Responsive */}
        <div className="flex-1 max-w-md ml-auto hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              className="w-full bg-muted pl-9 rounded-full h-9"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <LanguageSelector />

          {isAuthenticated ? (
            <Button variant="ghost" size="icon" className="shrink-0">
              <Bell className="h-5 w-5" />
            </Button>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">{t('nav.register')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('search.placeholder')}
                    className="w-full bg-muted pl-9 rounded-full h-9"
                  />
                </div>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'text-sm font-medium py-2 hover:text-primary',
                        isActive(link.href)
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!isAuthenticated && (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-medium py-2 text-muted-foreground hover:text-primary"
                      >
                        {t('nav.login')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-medium py-2 text-primary"
                      >
                        {t('nav.register')}
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Mobile Search Bar (Only visible on very small screens if not in menu, but handled in menu now) */}
    </header>
  )
}
