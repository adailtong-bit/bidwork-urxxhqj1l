import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Building2, MapPin, ShieldCheck, User } from 'lucide-react'

export default function Settings() {
  const { user, updateSettings } = useAuthStore()
  const { toast } = useToast()

  const [banking, setBanking] = useState(
    user?.bankingDetails || { bank: '', agency: '', account: '', document: '' },
  )
  const [radius, setRadius] = useState([user?.serviceRadius || 10])

  const handleSave = () => {
    updateSettings({
      bankingDetails: banking,
      serviceRadius: radius[0],
    })
    toast({
      title: 'Configurações Salvas',
      description: 'Seu perfil foi atualizado com sucesso.',
    })
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">
        Configurações da Conta
      </h1>

      <div className="grid gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Perfil{' '}
              {user.entityType.toUpperCase()}
            </CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nome de exibição</Label>
                <Input defaultValue={user.name} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input defaultValue={user.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Tipo de Pessoa</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50 text-sm">
                  {user.entityType === 'pj'
                    ? 'Pessoa Jurídica'
                    : 'Pessoa Física'}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Função</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50 text-sm capitalize">
                  {user.role === 'contractor' ? 'Contratante' : 'Executor'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geofencing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Raio de Atuação (Geofencing)
            </CardTitle>
            <CardDescription>
              Defina a distância máxima para encontrar serviços ou prestadores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Raio de Cobertura</Label>
              <span className="font-bold text-primary">{radius[0]} milhas</span>
            </div>
            <Slider
              value={radius}
              onValueChange={setRadius}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              {user.role === 'executor'
                ? 'Você receberá notificações de jobs apenas dentro deste raio.'
                : 'Executores dentro deste raio terão prioridade no seu job.'}
            </p>
          </CardContent>
        </Card>

        {/* Banking - Only for executors or if needed for refunds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Dados Bancários
            </CardTitle>
            <CardDescription>
              Informações criptografadas para recebimento de pagamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Banco</Label>
                <Input
                  placeholder="Ex: Nubank"
                  value={banking.bank}
                  onChange={(e) =>
                    setBanking({ ...banking, bank: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Agência</Label>
                <Input
                  placeholder="0000"
                  value={banking.agency}
                  onChange={(e) =>
                    setBanking({ ...banking, agency: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Conta</Label>
                <Input
                  placeholder="00000-0"
                  value={banking.account}
                  onChange={(e) =>
                    setBanking({ ...banking, account: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>CPF/CNPJ (Titular)</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-emerald-600" />
                <Input
                  className="pl-9"
                  placeholder="Documento para faturamento"
                  value={banking.document}
                  onChange={(e) =>
                    setBanking({ ...banking, document: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Seus dados são armazenados
                com criptografia de ponta a ponta.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>Personalize sua experiência.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações SMS/Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas prioritários de novos jobs.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Alternar entre tema claro e escuro.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
