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

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Nome de exibição</Label>
              <Input defaultValue="Usuário Demo" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input defaultValue="demo@plano.app" disabled />
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
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações sobre seus planos.
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
      </div>
    </div>
  )
}
