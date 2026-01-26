import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText, Image as ImageIcon, X } from 'lucide-react'

interface DocumentPreviewModalProps {
  open: boolean
  onClose: () => void
  document: {
    name: string
    type: string
    url?: string
  } | null
}

export function DocumentPreviewModal({
  open,
  onClose,
  document,
}: DocumentPreviewModalProps) {
  if (!document) return null

  // Mock URL generation for preview if no real URL exists
  const getPreviewUrl = () => {
    if (document.url) return document.url
    if (document.type.includes('image')) {
      return `https://img.usecurling.com/p/600/400?q=${document.name.split('.')[0]}`
    }
    return null // PDFs/Docs might not have a direct image preview in this mock
  }

  const previewUrl = getPreviewUrl()
  const isImage = document.type.includes('image')

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b flex-shrink-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <DialogTitle>{document.name}</DialogTitle>
            <DialogDescription>
              Pré-visualização do documento ({document.type})
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Baixar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4">
          {isImage ? (
            <img
              src={previewUrl!}
              alt={document.name}
              className="max-w-full max-h-full object-contain rounded shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center max-w-md p-8 bg-background rounded-lg shadow border">
              <FileText className="h-24 w-24 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Visualização não disponível
              </h3>
              <p className="text-muted-foreground mb-6">
                Este tipo de arquivo não pode ser visualizado diretamente no
                navegador. Por favor, faça o download para visualizar.
              </p>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Download Arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
