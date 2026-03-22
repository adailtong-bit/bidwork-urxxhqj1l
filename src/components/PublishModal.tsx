import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { Tag, Home, Users, Briefcase } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface PublishModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublishModal({ open, onOpenChange }: PublishModalProps) {
  const navigate = useNavigate()
  const { t } = useLanguageStore()

  const handleAction = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('publish.what')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleAction('/post-job?type=product')}
          >
            <CardHeader>
              <Tag className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>{t('post.type.product.title')}</CardTitle>
              <CardDescription>{t('post.type.product.desc')}</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleAction('/post-job?type=rental')}
          >
            <CardHeader>
              <Home className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>{t('post.type.rental.title')}</CardTitle>
              <CardDescription>{t('post.type.rental.desc')}</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleAction('/post-job?type=community')}
          >
            <CardHeader>
              <Users className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>{t('post.type.community.title')}</CardTitle>
              <CardDescription>{t('post.type.community.desc')}</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer border-orange-200 bg-orange-50/50 hover:border-orange-500 transition-colors"
            onClick={() => handleAction('/post-job?type=job')}
          >
            <CardHeader>
              <Briefcase className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle>{t('post.type.job.title')}</CardTitle>
              <CardDescription>{t('post.type.job.desc')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
