import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MapPin,
  Gavel,
  Tag,
  Calendar,
  Filter,
  Zap,
  Sparkles,
  ImageIcon,
} from 'lucide-react'
import { formatDistanceToNow, subDays, isAfter } from 'date-fns'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { AdSection } from '@/components/AdSection'

export default function FindJobs() {
  const { jobs } = useJobStore()
  const { t, formatCurrency, getDateLocale } = useLanguageStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [isSmartSort, setIsSmartSort] = useState(false)

  const availableJobs = jobs.filter((job) => job.status === 'open')

  const regions = Array.from(new Set(jobs.map((j) => j.regionCode))).filter(
    Boolean,
  )

  const filteredJobs = availableJobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' || job.category === categoryFilter
      const matchesType = typeFilter === 'all' || job.type === typeFilter
      const matchesRegion =
        regionFilter === 'all' || job.regionCode === regionFilter

      let matchesDate = true
      if (dateFilter !== 'all') {
        const now = new Date()
        let cutoffDate = new Date()
        if (dateFilter === '24h') cutoffDate = subDays(now, 1)
        if (dateFilter === '7d') cutoffDate = subDays(now, 7)
        if (dateFilter === '30d') cutoffDate = subDays(now, 30)

        matchesDate = isAfter(new Date(job.createdAt), cutoffDate)
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesRegion &&
        matchesDate
      )
    })
    .sort((a, b) => {
      if (isSmartSort) {
        const scoreA = a.smartMatchScore || 0
        const scoreB = b.smartMatchScore || 0
        return scoreB - scoreA
      }

      const getScore = (type: string) => {
        if (type === 'category') return 3
        if (type === 'region') return 2
        return 1
      }

      const scoreA = getScore(a.premiumType)
      const scoreB = getScore(b.premiumType)

      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="space-y-6 container mx-auto max-w-6xl">
      <AdSection segment="search" />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('dashboard.find_jobs')}
        </h1>
        <p className="text-muted-foreground">{t('market.desc')}</p>
      </div>

      <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('find.search_placeholder')}
              className="pl-9 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 bg-background p-2 rounded-md border shadow-sm shrink-0">
            <Switch
              id="smart-mode"
              checked={isSmartSort}
              onCheckedChange={setIsSmartSort}
            />
            <Label
              htmlFor="smart-mode"
              className="flex items-center gap-1 cursor-pointer"
            >
              <Sparkles
                className={`h-4 w-4 ${isSmartSort ? 'text-purple-500 fill-purple-100' : 'text-muted-foreground'}`}
              />
              {t('find.smart_sort')}
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Estado / Região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('find.filter.region.all')}</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('find.filter.category.all')}
              </SelectItem>
              <SelectItem value="TI e Programação">
                {t('category.ti')}
              </SelectItem>
              <SelectItem value="Reformas">{t('category.reform')}</SelectItem>
              <SelectItem value="Design">{t('category.design')}</SelectItem>
              <SelectItem value="Marketing">
                {t('category.marketing')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('find.filter.type.all')}</SelectItem>
              <SelectItem value="fixed">{t('job.fixed_price')}</SelectItem>
              <SelectItem value="auction">
                {t('job.auction_reverse')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('find.filter.date.all')}</SelectItem>
              <SelectItem value="24h">{t('find.filter.date.24h')}</SelectItem>
              <SelectItem value="7d">{t('find.filter.date.7d')}</SelectItem>
              <SelectItem value="30d">{t('find.filter.date.30d')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className={`flex flex-col hover:border-primary/50 transition-colors ${
              job.premiumType === 'category'
                ? 'border-l-4 border-l-yellow-500 shadow-md bg-yellow-50/10'
                : job.premiumType === 'region'
                  ? 'border-l-4 border-l-blue-500 shadow-sm'
                  : ''
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {job.category}
                  </Badge>
                  {isSmartSort && job.smartMatchScore && (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                      {job.smartMatchScore}% Match
                    </Badge>
                  )}
                  {job.premiumType === 'category' && !isSmartSort && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1 text-[10px]"
                    >
                      <Zap className="h-3 w-3 fill-current" />{' '}
                      {t('ad.highlight')}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(job.createdAt, {
                    addSuffix: true,
                    locale: getDateLocale(),
                  })}
                </span>
              </div>
              <CardTitle className="line-clamp-1 text-lg">
                {job.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                {job.photos && job.photos.length > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <ImageIcon className="h-3 w-3" /> {job.photos.length}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {job.type === 'auction' ? (
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 flex gap-1"
                  >
                    <Gavel className="h-3 w-3" /> {t('job.auction_reverse')}
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex gap-1"
                  >
                    <Tag className="h-3 w-3" /> {t('job.fixed_price')}
                  </Badge>
                )}
                <span className="font-bold text-lg">
                  {formatCurrency(job.budget)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full" asChild>
                <Link to={`/jobs/${job.id}`}>{t('view')}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredJobs.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Filter className="h-10 w-10 mb-4 opacity-20" />
            <p>{t('job.not_found')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
