import { Link } from 'react-router-dom'
import {
  FileText,
  DollarSign,
  CheckCircle,
  Home,
  Laptop,
  Briefcase,
  HeartPulse,
  GraduationCap,
  Palette,
  Truck,
  Hammer,
  Car,
  User,
  Box,
  Map,
  HardHat,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdSection } from '@/components/AdSection'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { LanguageSelector } from '@/components/LanguageSelector'

export default function Index() {
  const { t } = useLanguageStore()

  const categories = [
    { name: t('cat.domestic'), icon: Home, query: 'domestic' },
    { name: t('cat.tech'), icon: Laptop, query: 'tech' },
    { name: t('cat.business'), icon: Briefcase, query: 'business' },
    { name: t('cat.health'), icon: HeartPulse, query: 'health' },
    { name: t('cat.education'), icon: GraduationCap, query: 'education' },
    { name: t('cat.creative'), icon: Palette, query: 'creative' },
    { name: t('cat.transport'), icon: Truck, query: 'transport' },
    { name: t('cat.construction'), icon: Hammer, query: 'construction' },
    { name: t('cat.auto'), icon: Car, query: 'auto' },
    { name: t('cat.personal'), icon: User, query: 'personal' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                B
              </div>
              <span className="hidden font-bold sm:inline-block text-xl">
                BIDWORK
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/find-jobs"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {t('nav.explore')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />

            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/register">{t('nav.start')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
                {t('home.hero.title_part1')} <br className="hidden sm:inline" />
                <span className="text-primary">
                  {t('home.hero.title_part2')}
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link to="/register?role=contractor">
                    {t('home.hero.contractor_btn')}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                  asChild
                >
                  <Link to="/register?role=executor">
                    {t('home.hero.executor_btn')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Process Guide */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t('home.process.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('home.process.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm border">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t('home.process.step1.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('home.process.step1.desc')}
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm border">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <DollarSign className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t('home.process.step2.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('home.process.step2.desc')}
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm border">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t('home.process.step3.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('home.process.step3.desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight mb-8">
              {t('home.categories.title')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat, i) => (
                <Link key={i} to={`/find-jobs?category=${cat.query}`}>
                  <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full group">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full gap-3">
                      <cat.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium text-sm">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Capability Showcase */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <div className="p-3 bg-white rounded-lg text-primary">
                  <HardHat className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {t('home.features.mgmt.title')}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    {t('home.features.mgmt.desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <div className="p-3 bg-white rounded-lg text-primary">
                  <Box className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {t('home.features.bim.title')}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    {t('home.features.bim.desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <div className="p-3 bg-white rounded-lg text-primary">
                  <Map className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {t('home.features.logistics.title')}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    {t('home.features.logistics.desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advertising Slots */}
        <section className="py-12 bg-muted/10">
          <div className="container px-4 md:px-6">
            <AdSection segment="home" />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 text-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              {t('home.cta.title')}
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg" asChild>
                <Link to="/register">{t('home.cta.btn')}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg"
                asChild
              >
                <Link to="/find-jobs">
                  {t('home.cta.explore')}{' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
                  B
                </div>
                <span className="font-bold text-lg">BIDWORK</span>
              </Link>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                {t('footer.slogan')}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('footer.rights')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
