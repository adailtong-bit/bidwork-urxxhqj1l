import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, RefreshCw } from 'lucide-react'

interface ExternalIntegrationDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
}

export function ExternalIntegrationDialog({
  open,
  onClose,
  projectId,
}: ExternalIntegrationDialogProps) {
  const { getProject, toggleIntegration } = useProjectStore()
  const { t, formatDate } = useLanguageStore()
  const { toast } = useToast()
  const project = getProject(projectId)

  if (!project) return null

  const handleToggle = (platform: 'trello' | 'asana' | 'jira') => {
    toggleIntegration(projectId, platform)
    toast({
      title: t('proj.sync.updated'),
      description: t('proj.sync.status_changed', { platform }),
    })
  }

  const integrations = project.integrations || []
  const getIntegration = (platform: string) =>
    integrations.find((i) => i.platform === platform)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('proj.sync.title')}</DialogTitle>
          <DialogDescription>{t('proj.sync.desc')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {['trello', 'asana', 'jira'].map((platform) => {
            const integration = getIntegration(platform)
            const isConnected = integration?.connected

            return (
              <div
                key={platform}
                className="flex items-center justify-between space-x-4 rounded-lg border p-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none capitalize">
                      {platform}
                    </p>
                    {isConnected && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isConnected
                      ? `${t('proj.sync.connected')} - ${t('proj.sync.sync')} ${
                          integration?.lastSync
                            ? formatDate(integration.lastSync, 'HH:mm')
                            : '-'
                        }`
                      : t('proj.sync.connect')}
                  </p>
                </div>
                <Switch
                  checked={isConnected}
                  onCheckedChange={() => handleToggle(platform as any)}
                />
              </div>
            )
          })}
        </div>

        <Button className="w-full" onClick={onClose}>
          <RefreshCw className="mr-2 h-4 w-4" /> {t('proj.sync.sync_now')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
