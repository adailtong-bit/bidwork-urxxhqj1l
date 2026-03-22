import { useState } from 'react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit, Trash2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export function MyAdsDashboard() {
  const { t, formatDate } = useLanguageStore()
  const { user } = useAuthStore()
  const { jobs, deleteJob } = useJobStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  if (!user) return null

  const myAds = jobs.filter((job) => job.ownerId === user.id)

  if (myAds.length === 0) return null

  const filteredAds = myAds.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      filterType === 'all' || (ad.listingType || 'job') === filterType
    return matchesSearch && matchesType
  })

  return (
    <Card className="mx-4 mt-2 mb-4 border-none shadow-sm">
      <CardHeader className="px-4 py-4">
        <CardTitle className="text-xl font-bold">
          {t('home.my_ads.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('home.my_ads.search')}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t('home.my_ads.filter.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('home.my_ads.filter.all')}</SelectItem>
              <SelectItem value="job">{t('post.type.job.label')}</SelectItem>
              <SelectItem value="product">
                {t('post.type.product.label')}
              </SelectItem>
              <SelectItem value="rental">
                {t('post.type.rental.label')}
              </SelectItem>
              <SelectItem value="community">
                {t('post.type.community.label')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('home.my_ads.table.title')}</TableHead>
              <TableHead>{t('home.my_ads.table.type')}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('home.my_ads.table.date')}
              </TableHead>
              <TableHead className="text-right">
                {t('home.my_ads.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  Nenhum anúncio encontrado.
                </TableCell>
              </TableRow>
            )}
            {filteredAds.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium max-w-[120px] sm:max-w-[200px] truncate">
                  {ad.title}
                </TableCell>
                <TableCell className="capitalize">
                  {t(`post.type.${ad.listingType || 'job'}.label`)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(ad.createdAt, 'PP')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/post-job?edit=${ad.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        if (confirm(t('delete.confirm'))) {
                          deleteJob(ad.id)
                          toast({
                            title: t('success'),
                            description: t('home.my_ads.delete_success'),
                          })
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
