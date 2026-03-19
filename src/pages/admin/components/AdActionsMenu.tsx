import { useState } from 'react'
import {
  MoreVertical,
  PauseCircle,
  XCircle,
  CalendarPlus,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAdStore, Ad } from '@/stores/useAdStore'
import { useToast } from '@/hooks/use-toast'
import AdExtendDialog from './AdExtendDialog'

export function AdActionsMenu({ ad }: { ad: Ad }) {
  const { updateAdStatus } = useAdStore()
  const { toast } = useToast()
  const [extendOpen, setExtendOpen] = useState(false)

  const handleStatusChange = (status: Ad['status']) => {
    updateAdStatus(ad.id, status)
    toast({
      title: 'Status Atualizado',
      description: `O anúncio foi marcado como ${status}.`,
    })
  }

  const handleGenerateDoc = () => {
    const docName = ad.country === 'BR' ? 'Nota Fiscal (NF)' : 'Billing Note'
    toast({
      title: `${docName} Gerada`,
      description: `Documento enviado para ${ad.advertiserName}.`,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleGenerateDoc}>
            <FileText className="mr-2 h-4 w-4" /> Gerar{' '}
            {ad.country === 'BR' ? 'NF' : 'Billing Note'}
          </DropdownMenuItem>
          {ad.status === 'active' && (
            <DropdownMenuItem onClick={() => handleStatusChange('suspended')}>
              <PauseCircle className="mr-2 h-4 w-4" /> Suspender
            </DropdownMenuItem>
          )}
          {(ad.status === 'active' || ad.status === 'suspended') && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleStatusChange('canceled')}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setExtendOpen(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Estender
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdExtendDialog ad={ad} open={extendOpen} onOpenChange={setExtendOpen} />
    </>
  )
}
