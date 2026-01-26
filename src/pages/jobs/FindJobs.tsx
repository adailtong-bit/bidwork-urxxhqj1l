import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
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
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MapPin, Gavel, Tag, Calendar, Filter, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AdBanner } from '@/components/AdBanner'

export default function FindJobs() {
  const { jobs } = useJobStore()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [radiusFilter, setRadiusFilter] = useState([user?.serviceRadius || 50])

  const availableJobs = jobs.filter((job) => job.status === 'open')

  const filteredJobs = availableJobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' || job.category === categoryFilter
      const matchesType = typeFilter === 'all' || job.type === typeFilter

      // Mock geofencing check - simply checking if user has radius settings
      // In real world, we would calculate Haversine distance
      const inRadius = radiusFilter[0] > 0 // Placeholder logic

      return matchesSearch && matchesCategory && matchesType && inRadius
    })
    .sort((a, b) => {
      // Hierarchical Sorting:
      // 1. Paid "Superior in Category" (premiumType === 'category')
      // 2. Paid "Superior in Region" (premiumType === 'region')
      // 3. Proximity-based (Free) (premiumType === 'none')

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

      // If same tier, sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="space-y-6">
      <AdBanner
        region={user?.location || 'SP'}
        category={categoryFilter === 'all' ? 'Geral' : categoryFilter}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Encontrar Jobs</h1>
        <p className="text-muted-foreground">
          Oportunidades filtradas para você.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descrição ou cidade..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-[200px] px-2">
            <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
              <span>Raio</span>
              <span>{radiusFilter[0]} mi</span>
            </div>
            <Slider
              value={radiusFilter}
              onValueChange={setRadiusFilter}
              max={100}
              step={5}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="TI e Programação">TI e Programação</SelectItem>
              <SelectItem value="Reformas">Reformas</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              <SelectItem value="fixed">Preço Fixo</SelectItem>
              <SelectItem value="auction">Leilão</SelectItem>
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
                  {job.premiumType === 'category' && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1 text-[10px]"
                    >
                      <Zap className="h-3 w-3 fill-current" /> Super Destaque
                    </Badge>
                  )}
                  {job.premiumType === 'region' && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1 text-[10px]"
                    >
                      <Zap className="h-3 w-3" /> Destaque Regional
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(job.createdAt, {
                    addSuffix: true,
                    locale: ptBR,
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
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.type === 'auction' ? (
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 flex gap-1"
                  >
                    <Gavel className="h-3 w-3" /> Leilão
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex gap-1"
                  >
                    <Tag className="h-3 w-3" /> Fixo
                  </Badge>
                )}
                <span className="font-bold text-lg">
                  R$ {job.budget.toLocaleString('pt-BR')}
                </span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full" asChild>
                <Link to={`/jobs/${job.id}`}>Ver Detalhes</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredJobs.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Filter className="h-10 w-10 mb-4 opacity-20" />
            <p>Nenhum job encontrado com os filtros atuais.</p>
          </div>
        )}
      </div>
    </div>
  )
}
