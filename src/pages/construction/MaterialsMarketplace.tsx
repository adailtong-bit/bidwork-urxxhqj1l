import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMaterialStore, Material } from '@/stores/useMaterialStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  ArrowLeft,
  ExternalLink,
  Upload,
  Lock,
  Trash2,
  Store,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface CartItem {
  material: Material
  quantity: number
  unitPrice: number
}

export default function MaterialsMarketplace() {
  const [searchParams] = useSearchParams()
  const urlProjectId = searchParams.get('projectId')
  const urlStageId = searchParams.get('stageId')

  const navigate = useNavigate()
  const { materials, vendors, addOrder, importMaterialList, addVendor } =
    useMaterialStore()
  const { projects, updateStageActuals, addAllocatedCost } = useProjectStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { t, formatCurrency } = useLanguageStore()

  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutProjectId, setCheckoutProjectId] = useState<string>(
    urlProjectId || '',
  )
  const [checkoutStageId, setCheckoutStageId] = useState<string>(
    urlStageId || 'none',
  )
  const [checkoutVendorId, setCheckoutVendorId] = useState<string>('')

  // New Vendor State
  const [isNewVendorOpen, setIsNewVendorOpen] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')

  useEffect(() => {
    if (urlProjectId) setCheckoutProjectId(urlProjectId)
    if (urlStageId) setCheckoutStageId(urlStageId)
  }, [urlProjectId, urlStageId])

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || m.category === categoryFilter
    const matchesVendor = vendorFilter === 'all' || m.supplier === vendorFilter
    return matchesSearch && matchesCategory && matchesVendor
  })

  const canPurchase = (material: Material) => {
    if (!material.purchasePermissions) return true
    if (!user) return false
    if (user.role === 'admin' || user.teamRole === 'Admin') return true
    return material.purchasePermissions.includes(user.teamRole || '')
  }

  const addToCart = (material: Material) => {
    if (!canPurchase(material)) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Permissão negada',
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
      return [...prev, { material, quantity: 1, unitPrice: material.price }]
    })
    toast({ title: 'Adicionado ao carrinho' })
  }

  const updateCartItem = (
    id: string,
    field: 'quantity' | 'unitPrice',
    value: number,
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.material.id === id) {
            return {
              ...item,
              [field]: field === 'quantity' ? Math.max(0, value) : value,
            }
          }
          return item
        })
        .filter((i) => i.quantity > 0),
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.material.id !== id))
  }

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  )

  const handleAddNewVendor = () => {
    if (!newVendorName.trim()) return
    const v = addVendor({ name: newVendorName })
    setCheckoutVendorId(v.id)
    setIsNewVendorOpen(false)
    setNewVendorName('')
    toast({ title: 'Fornecedor cadastrado com sucesso!' })
  }

  const handleCheckoutSubmit = () => {
    if (!checkoutProjectId) {
      toast({
        variant: 'destructive',
        title: 'Alocação Obrigatória',
        description: 'Selecione a obra de destino para esta compra.',
      })
      return
    }
    if (!checkoutVendorId) {
      toast({
        variant: 'destructive',
        title: 'Fornecedor Obrigatório',
        description: 'Selecione ou cadastre o fornecedor/loja.',
      })
      return
    }

    const selectedVendor = vendors.find((v) => v.id === checkoutVendorId)
    const selectedProject = projects.find((p) => p.id === checkoutProjectId)

    const orderItems = cart.map((item) => ({
      material: item.material,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }))

    const threshold = selectedProject?.purchaseApprovalThreshold || 1000
    const isPendingApproval = cartTotal > threshold

    addOrder({
      projectId: checkoutProjectId,
      stageId: checkoutStageId !== 'none' ? checkoutStageId : undefined,
      vendorId: checkoutVendorId,
      vendorName: selectedVendor?.name,
      items: orderItems,
      total: cartTotal,
      status: isPendingApproval ? 'pending_approval' : 'approved',
    })

    if (!isPendingApproval) {
      if (checkoutStageId !== 'none') {
        updateStageActuals(
          checkoutProjectId,
          checkoutStageId,
          'material',
          cartTotal,
        )
      }

      addAllocatedCost(checkoutProjectId, {
        description: `Compra de Materiais - ${selectedVendor?.name || 'Diversos'} (${cart.length} itens)`,
        amount: cartTotal,
        type: 'actual',
        category: 'material',
        costClass: 'capex',
        date: new Date(),
        stageId: checkoutStageId !== 'none' ? checkoutStageId : undefined,
      })

      toast({
        title: 'Pedido Confirmado!',
        description: `A compra foi registrada e alocada na obra ${selectedProject?.name || ''}.`,
      })
    } else {
      toast({
        title: 'Aprovação Necessária',
        description: `O pedido de ${formatCurrency(cartTotal)} excedeu o limite do projeto (${formatCurrency(threshold)}) e foi enviado para aprovação do gerente.`,
      })
    }

    setCart([])
    setIsCheckoutOpen(false)
    navigate(`/construction/projects/${checkoutProjectId}?tab=purchasing`)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const result = await importMaterialList(e.target.files[0])
      if (result.success) {
        toast({
          title: t('success'),
          description: `${result.count} itens importados.`,
        })
      }
    }
  }

  const selectedProjectStages =
    projects.find((p) => p.id === checkoutProjectId)?.stages || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {urlProjectId && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Marketplace e Compras
            </h1>
            <p className="text-muted-foreground">
              Pesquise produtos, gerencie fornecedores e aloque custos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden md:block">
            <p className="text-sm text-muted-foreground">Valor do Carrinho</p>
            <p className="font-bold text-lg text-primary">
              {formatCurrency(cartTotal)}
            </p>
          </div>
          <Button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="relative bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Finalizar Pedido
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                {cart.length}
              </span>
            )}
          Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por produto, marca ou código..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            <SelectItem value="Estrutura">Estrutura</SelectItem>
            <SelectItem value="Alvenaria">Alvenaria</SelectItem>
            <SelectItem value="Acabamento">Acabamento</SelectItem>
          </SelectContent>
        </Select>
        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Fornecedor Padrão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Fornecedores</SelectItem>
            {[...new Set(materials.map((m) => m.supplier))].map((sup) => (
              <SelectItem key={sup} value={sup}>
                {sup}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          title="Importar lista de produtos"
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
          const cartItem = cart.find((i) => i.material.id === material.id)

          return (
            <Card
              key={material.id}
              className={`flex flex-col overflow-hidden hover:shadow-md transition-shadow ${!allowed ? 'opacity-70 grayscale-[30%]' : ''}`}
            >
              <div className="aspect-[4/3] relative bg-muted group">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-2 right-2 shadow-sm">
                  {material.category}
                </Badge>
                {!allowed && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <Badge variant="destructive" className="flex gap-1">
                      <Lock className="h-3 w-3" /> Bloqueado (Permissão)
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base leading-tight line-clamp-2 min-h-[2.5rem]">
                  {material.name}
                </CardTitle>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Store className="h-3 w-3" /> {material.supplier}
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
              <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(material.price)}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {material.unit}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 bg-muted/20 border-t mt-2">
                {cartItem ? (
                  <div className="flex items-center justify-between w-full bg-background rounded-md border p-1 shadow-sm mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        updateCartItem(
                          material.id,
                          'quantity',
                          cartItem.quantity - 1,
                        )
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold px-2">
                      {cartItem.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() =>
                        updateCartItem(
                          material.id,
                          'quantity',
                          cartItem.quantity + 1,
                        )
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full mt-2"
                    onClick={() => addToCart(material)}
                    disabled={!allowed}
                    variant="secondary"
                  >
                    Adicionar ao Carrinho
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Finalizar Pedido</DialogTitle>
            <DialogDescription>
              Revise os valores, unidades e faça a alocação correta para o
              Financeiro.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Allocation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  Alocação de Obra (Destino){' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={checkoutProjectId}
                  onValueChange={setCheckoutProjectId}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione a obra de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Etapa do Cronograma (Opcional)
                </Label>
                <Select
                  value={checkoutStageId}
                  onValueChange={setCheckoutStageId}
                  disabled={!checkoutProjectId}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Geral (Sem etapa específica)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Geral (Sem etapa específica)
                    </SelectItem>
                    {selectedProjectStages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendor Section */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-2 flex-1 w-full">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    Fornecedor / Loja <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={checkoutVendorId}
                    onValueChange={setCheckoutVendorId}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione o Fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsNewVendorOpen(!isNewVendorOpen)}
                  className="bg-background"
                >
                  <Store className="mr-2 h-4 w-4" /> Novo Fornecedor
                </Button>
              </div>

              {/* Inline New Vendor Form */}
              {isNewVendorOpen && (
                <div className="flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <Input
                    placeholder="Nome do Novo Fornecedor..."
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    className="bg-background"
                    autoFocus
                  />
                  <Button
                    onClick={handleAddNewVendor}
                    disabled={!newVendorName.trim()}
                  >
                    Salvar Fornecedor
                  </Button>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[40%]">Produto</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead className="w-[120px]">Qtd / Unid.</TableHead>
                    <TableHead className="text-right">Total Item</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.material.id}>
                      <TableCell className="font-medium">
                        {item.material.name}
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Ref: {item.material.supplier}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">
                            R$
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="h-8 w-24 text-right"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateCartItem(
                                item.material.id,
                                'unitPrice',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            className="h-8 w-16 text-center"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItem(
                                item.material.id,
                                'quantity',
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {item.material.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.material.id)}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row items-center justify-between border-t pt-4 gap-4">
            <div className="text-left w-full sm:w-auto">
              <p className="text-sm text-muted-foreground">Total do Pedido</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(cartTotal)}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCheckoutSubmit}
                disabled={cart.length === 0}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                Confirmar Compra
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

