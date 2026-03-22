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
import { Edit, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function MyAdsDashboard() {
  const { t, formatDate } = useLanguageStore()
  const { user } = useAuthStore()
  const { jobs, deleteJob } = useJobStore()
  const navigate = useNavigate()

  if (!user) return null

  const myAds = jobs.filter((job) => job.ownerId === user.id)

  if (myAds.length === 0) return null

  return (
    <Card className="mx-4 mt-2 mb-4 border-none shadow-sm">
      <CardHeader className="px-4 py-4">
        <CardTitle className="text-xl font-bold">
          {t('home.my_ads.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
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
            {myAds.map((ad) => (
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
