import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Link } from 'react-router-dom'

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
  const { addPartnerTeamMember, getProject } = useProjectStore()
  const { user } = useAuthStore() // Get logged in user to access global team
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [role, setRole] = useState('')

  const project = getProject(projectId)
  // Assuming the logged-in user is the Partner, so we use their teamMembers
  const availableMembers = user?.teamMembers || []

  const handleSave = () => {
    if (!selectedMemberId || !role) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('val.required'),
      })
      return
    }

    const member = availableMembers.find((m) => m.id === selectedMemberId)
    if (!member) return

    // Duplicate Check in project
    const partner = project?.partners.find((p) => p.id === partnerId)
    if (partner) {
      const exists = partner.team.some((m) => m.registrationId === member.id) // check against original ID
      if (exists) {
        toast({
          variant: 'destructive',
          title: t('error'),
          description: t('team.error.duplicate'),
        })
        return
      }
    }

    addPartnerTeamMember(projectId, partnerId, {
      name: member.name,
      email: member.email,
      phone: '(00) 0000-0000', // Mock or add phone to TeamMember interface if needed, but for now placeholder
      role: role as any,
      registrationId: member.id,
    })

    toast({ title: t('success'), description: t('team.added') })
    setSelectedMemberId('')
    setRole('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alocar Membro da Equipe</DialogTitle>
          <DialogDescription>
            Selecione um profissional da sua equipe corporativa para trabalhar
            neste projeto.
          </DialogDescription>
        </DialogHeader>

        {availableMembers.length === 0 ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Você não possui membros cadastrados na sua equipe corporativa.
            </p>
            <Button asChild variant="outline">
              <Link to="/team">Gerenciar Equipe Corporativa</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Membro da Equipe</Label>
              <Select
                onValueChange={setSelectedMemberId}
                value={selectedMemberId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Função no Projeto</Label>
              <Select onValueChange={setRole} value={role}>
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
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSave} disabled={availableMembers.length === 0}>
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
