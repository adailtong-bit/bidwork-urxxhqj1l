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
import { useLanguageStore } from '@/stores/useLanguageStore'
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
  const { t } = useLanguageStore()

  const [companyName, setCompanyName] = useState(partner.companyName)
  const [address, setAddress] = useState(
    partner.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  )
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  })

  const handleUpdate = () => {
    updatePartner(projectId, partner.id, { companyName, address })
    toast({ title: t('partner.edit.updated') })
    onClose()
  }

  const handleAddContact = () => {
    if (partner.contacts.length >= 3) {
      toast({
        variant: 'destructive',
        title: t('partner.edit.limit_reached'),
        description: t('partner.edit.limit_desc'),
      })
      return
    }
    if (!newContact.name || !newContact.email) {
      toast({ variant: 'destructive', title: t('partner.edit.incomplete') })
      return
    }
    addPartnerContact(projectId, partner.id, newContact)
    setNewContact({ name: '', email: '', phone: '', role: '' })
    toast({ title: t('partner.edit.added') })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('partner.edit.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-2">
            <Label>{t('partner.edit.company_name')}</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Endereço Físico</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Rua, Número"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
              />
              <Input
                placeholder="Cidade"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
              <Input
                placeholder="Estado"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />
              <Input
                placeholder="CEP"
                value={address.zipCode}
                onChange={(e) =>
                  setAddress({ ...address, zipCode: e.target.value })
                }
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-4">
              {t('partner.edit.contacts')} ({partner.contacts.length}/3)
            </h4>
            <div className="space-y-3 mb-4">
              {partner.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex justify-between items-center bg-muted p-2 rounded"
                >
                  <div className="text-sm flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-muted-foreground">
                      {contact.email} • {contact.phone}
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
                    placeholder={t('partner.edit.name')}
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder={t('partner.edit.role')}
                    value={newContact.role}
                    onChange={(e) =>
                      setNewContact({ ...newContact, role: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder={t('partner.edit.email')}
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder={t('partner.edit.phone')}
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleAddContact}>
                  <Plus className="mr-2 h-4 w-4" />{' '}
                  {t('partner.edit.add_contact')}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>{t('partner.edit.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
