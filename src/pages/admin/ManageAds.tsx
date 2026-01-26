import { useState } from 'react'
import { useAdStore, Ad } from '@/stores/useAdStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trash2, ExternalLink, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'

export default function ManageAds() {
  const { ads, addAd, removeAd, toggleAdStatus } = useAdStore()
  const { toast } = useToast()

  const [newAd, setNewAd] = useState<Partial<Ad>>({
    title: '',
    imageUrl: '',
    link: '',
    type: 'regional',
    segment: 'dashboard',
    active: true,
  })

  const handleAdd = () => {
    if (!newAd.title || !newAd.imageUrl || !newAd.link) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha título, URL da imagem e Link de destino.',
      })
      return
    }

    addAd(newAd as Omit<Ad, 'id'>)
    setNewAd({
      title: '',
      imageUrl: '',
      link: '',
      type: 'regional',
      segment: 'dashboard',
      active: true,
    })
    toast({ title: 'Anúncio criado com sucesso' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este anúncio?')) {
      removeAd(id)
      toast({ title: 'Anúncio removido' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestão de Publicidade
        </h1>
        <p className="text-muted-foreground">
          Gerencie banners e anúncios exibidos na plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Novo Anúncio</CardTitle>
            <CardDescription>Crie uma nova campanha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Promoção de Ferramentas"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input
                placeholder="https://..."
                value={newAd.imageUrl}
                onChange={(e) =>
                  setNewAd({ ...newAd, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Link de Destino</Label>
              <Input
                placeholder="https://..."
                value={newAd.link}
                onChange={(e) => setNewAd({ ...newAd, link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select
                value={newAd.segment}
                onValueChange={(val: any) =>
                  setNewAd({ ...newAd, segment: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="search">Busca de Jobs</SelectItem>
                  <SelectItem value="profile">Perfil/Config</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={newAd.type}
                onValueChange={(val: any) => setNewAd({ ...newAd, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="segmented">Segmentado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Criar Anúncio
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Anúncios Ativos</h2>
          {ads.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhum anúncio cadastrado.
            </div>
          ) : (
            <div className="grid gap-4">
              {ads.map((ad) => (
                <Card key={ad.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row h-full">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full sm:w-40 h-32 object-cover bg-muted"
                    />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold flex items-center gap-2">
                            {ad.title}
                            <Badge variant="outline">{ad.segment}</Badge>
                          </h3>
                          <a
                            href={ad.link}
                            target="_blank"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            {ad.link} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`switch-${ad.id}`}
                            className="text-xs"
                          >
                            {ad.active ? 'Ativo' : 'Inativo'}
                          </Label>
                          <Switch
                            id={`switch-${ad.id}`}
                            checked={ad.active}
                            onCheckedChange={() => toggleAdStatus(ad.id)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <Badge variant="secondary" className="capitalize">
                          {ad.type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
