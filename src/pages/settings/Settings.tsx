import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import {
  Building2,
  MapPin,
  ShieldCheck,
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'

export default function Settings() {
  const { user, updateSettings, submitKYC } = useAuthStore()
  const { toast } = useToast()

  const [banking, setBanking] = useState(
    user?.bankingDetails || { bank: '', agency: '', account: '', document: '' },
  )
  const [radius, setRadius] = useState([user?.serviceRadius || 10])
  const [isUploadingKYC, setIsUploadingKYC] = useState(false)

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

  const handleKYCUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingKYC(true)
    try {
      await submitKYC(file)
      toast({
        title: 'Documento Enviado',
        description: 'Sua identidade foi verificada com sucesso!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no envio',
        description: 'Tente novamente.',
      })
    } finally {
      setIsUploadingKYC(false)
    }
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Perfil{' '}
                  {user.entityType.toUpperCase()}
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais.
                </CardDescription>
              </div>
              {user.isVerified && (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Verificado
                </div>
              )}
            </div>
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

        {/* KYC Verification - New Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> Verificação de
              Identidade (KYC)
            </CardTitle>
            <CardDescription>
              Aumente a confiança no seu perfil enviando um documento oficial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.kycStatus === 'verified' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
                <h3 className="text-lg font-semibold text-green-800">
                  Identidade Verificada
                </h3>
                <p className="text-green-700 text-center">
                  Seu perfil possui o selo de verificação oficial.
                </p>
              </div>
            ) : user.kycStatus === 'pending' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-12 w-12 text-yellow-600 mb-2 animate-pulse" />
                <h3 className="text-lg font-semibold text-yellow-800">
                  Em Análise
                </h3>
                <p className="text-yellow-700 text-center">
                  Estamos analisando seus documentos. Isso pode levar até 24h.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">
                      Por que verificar?
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Selo de verificado no perfil</li>
                      <li>Maior visibilidade em buscas</li>
                      <li>Acesso a jobs exclusivos (Executores)</li>
                    </ul>
                  </div>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/20 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleKYCUpload}
                    disabled={isUploadingKYC}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload
                      className={`h-8 w-8 text-muted-foreground ${isUploadingKYC ? 'animate-bounce' : ''}`}
                    />
                    <p className="font-medium">
                      {isUploadingKYC
                        ? 'Enviando...'
                        : 'Clique para enviar documento (RG ou CNH)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou PDF até 5MB
                    </p>
                  </div>
                </div>
              </div>
            )}
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

        {/* Banking */}
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
