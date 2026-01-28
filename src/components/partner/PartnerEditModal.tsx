import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProjectPartner, useProjectStore } from '@/stores/useProjectStore'
import { Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PartnerEditModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  partner: ProjectPartner
}

export function PartnerEditModal({
  open,
  onClose,
  projectId,
  partner,
}: PartnerEditModalProps) {
  const { updatePartner, addPartnerContact } = useProjectStore()
  const { toast } = useToast()

  const [companyName, setCompanyName] = useState(partner.companyName)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  })

  const handleUpdate = () => {
    updatePartner(projectId, partner.id, { companyName })
    toast({ title: 'Perfil atualizado' })
    onClose()
  }

  const handleAddContact = () => {
    if (partner.contacts.length >= 3) {
      toast({
        variant: 'destructive',
        title: 'Limite atingido',
        description: 'Máximo de 3 contatos.',
      })
      return
    }
    if (!newContact.name || !newContact.email) {
      toast({ variant: 'destructive', title: 'Dados incompletos' })
      return
    }
    addPartnerContact(projectId, partner.id, newContact)
    setNewContact({ name: '', email: '', phone: '', role: '' })
    toast({ title: 'Contato adicionado' })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Perfil do Parceiro</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-2">
            <Label>Nome da Empresa</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-4">
              Contatos ({partner.contacts.length}/3)
            </h4>
            <div className="space-y-3 mb-4">
              {partner.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex justify-between items-center bg-muted p-2 rounded"
                >
                  <div className="text-sm">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-muted-foreground">
                      {contact.email} - {contact.phone}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" disabled>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {partner.contacts.length < 3 && (
              <div className="grid gap-3 border p-3 rounded-lg bg-card">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nome"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Cargo"
                    value={newContact.role}
                    onChange={(e) =>
                      setNewContact({ ...newContact, role: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Telefone"
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleAddContact}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Contato
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
