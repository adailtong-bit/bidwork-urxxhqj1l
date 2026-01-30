import { useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMaterialStore, Material } from '@/stores/useMaterialStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  ArrowLeft,
  ExternalLink,
  Upload,
  Lock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function MaterialsMarketplace() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const stageId = searchParams.get('stageId')

  const navigate = useNavigate()
  const { materials, addOrder, importMaterialList } = useMaterialStore()
  const { updateStageActuals } = useProjectStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  const [cart, setCart] = useState<{ material: Material; quantity: number }[]>(
    [],
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || m.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Purchase Permissions Check
  const canPurchase = (material: Material) => {
    if (!material.purchasePermissions) return true
    if (!user) return false
    // If Admin/Owner, always yes (simplified)
    if (user.role === 'admin' || user.teamRole === 'Admin') return true
    // Check if user role matches permission
    return material.purchasePermissions.includes(user.teamRole || '')
  }

  const addToCart = (material: Material) => {
    if (!canPurchase(material)) {
      toast({
        variant: 'destructive',
        title: 'Permissão Negada',
        description: 'Seu nível de acesso não permite comprar este item.',
      })
      return
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.material.id === material.id)
      if (existing) {
        return prev.map((i) =>
          i.material.id === material.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...prev, { material, quantity: 1 }]
    })
    toast({ title: 'Adicionado ao carrinho' })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.material.id === id) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) }
          }
          return item
        })
        .filter((i) => i.quantity > 0),
    )
  }

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.material.price * item.quantity,
    0,
  )

  const handleCheckout = () => {
    if (!projectId || !stageId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          'Projeto não selecionado. Inicie a compra pelo painel do projeto.',
      })
      return
    }

    // Create Order
    addOrder({
      projectId,
      stageId,
      items: cart,
      total: cartTotal,
      status: 'pending',
      freightCost: 150, // Mock freight calculation
    })

    // Data Integration: Update Project Actuals
    // Updating Financial and Accounting happens via this store action in real app
    updateStageActuals(projectId, stageId, 'material', cartTotal)

    toast({
      title: 'Pedido Realizado!',
      description:
        'Os materiais foram solicitados, estoque atualizado e custos alocados.',
    })
    navigate(`/construction/projects/${projectId}`)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const result = await importMaterialList(e.target.files[0])
      if (result.success) {
        toast({
          title: 'Importação Concluída',
          description: `${result.count} itens identificados e preparados.`,
        })
        // In a real app, populate cart here based on import
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {projectId && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Marketplace de Materiais
            </h1>
            <p className="text-muted-foreground">
              Compre direto de fornecedores parceiros.
            </p>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden md:block">
            <p className="text-sm text-muted-foreground">Total Carrinho</p>
            <p className="font-bold text-lg">{formatCurrency(cartTotal)}</p>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="relative"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Finalizar Pedido
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiais..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Estrutura">Estrutura</SelectItem>
            <SelectItem value="Alvenaria">Alvenaria</SelectItem>
            <SelectItem value="Acabamento">Acabamento</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          title="Importar lista de materiais"
        >
          <Upload className="mr-2 h-4 w-4" /> Importar Lista
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
          accept=".csv,.xlsx"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMaterials.map((material) => {
          const allowed = canPurchase(material)
          return (
            <Card
              key={material.id}
              className={`flex flex-col ${!allowed ? 'opacity-70' : ''}`}
            >
              <div className="aspect-square relative bg-muted">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 right-2">
                  {material.category}
                </Badge>
                {!allowed && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <Badge variant="destructive" className="flex gap-1">
                      <Lock className="h-3 w-3" /> Restrito
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base line-clamp-2 min-h-[40px]">
                  {material.name}
                </CardTitle>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {material.supplier}
                  </p>
                  {material.supplierWebsite && (
                    <a
                      href={material.supplierWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Site <ExternalLink className="h-2 w-2" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-1">
                <div className="text-xl font-bold">
                  {formatCurrency(material.price)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {material.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {material.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                {cart.find((i) => i.material.id === material.id) ? (
                  <div className="flex items-center justify-between w-full bg-muted/50 rounded-md p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(material.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold">
                      {
                        cart.find((i) => i.material.id === material.id)
                          ?.quantity
                      }
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(material.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => addToCart(material)}
                    disabled={!allowed}
                  >
                    Adicionar
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
