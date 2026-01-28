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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectStore } from '@/stores/useProjectStore'
import { useToast } from '@/hooks/use-toast'

interface TeamMemberModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  partnerId: string
}

export function TeamMemberModal({
  open,
  onClose,
  projectId,
  partnerId,
}: TeamMemberModalProps) {
  const { addPartnerTeamMember } = useProjectStore()
  const { toast } = useToast()

  const [member, setMember] = useState({
    name: '',
    role: '' as any,
    email: '',
    phone: '',
    registrationId: '',
  })

  const handleSave = () => {
    if (!member.name || !member.role || !member.registrationId) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }

    addPartnerTeamMember(projectId, partnerId, member)
    toast({ title: 'Membro adicionado à equipe' })
    setMember({
      name: '',
      role: '' as any,
      email: '',
      phone: '',
      registrationId: '',
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Mão de Obra</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nome Completo</Label>
            <Input
              value={member.name}
              onChange={(e) => setMember({ ...member, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Função Especializada</Label>
            <Select
              onValueChange={(val: any) => setMember({ ...member, role: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineer">Engenheiro</SelectItem>
                <SelectItem value="Electrician">Eletricista</SelectItem>
                <SelectItem value="Tiler">Azulejista</SelectItem>
                <SelectItem value="Roofer">Telhadista</SelectItem>
                <SelectItem value="Other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={member.email}
                onChange={(e) =>
                  setMember({ ...member, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input
                value={member.phone}
                onChange={(e) =>
                  setMember({ ...member, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>ID de Registro (BIDWORK)</Label>
            <Input
              placeholder="Código de registro do usuário"
              value={member.registrationId}
              onChange={(e) =>
                setMember({ ...member, registrationId: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Obrigatório para atribuição de tarefas.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Salvar Registro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
