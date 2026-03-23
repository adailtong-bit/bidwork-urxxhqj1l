import { useState } from 'react'
import { Category, useCategoryStore } from '@/stores/useCategoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  Trash2,
  X,
  Plus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { SubcategoryList } from './SubcategoryList'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function CategoryRow({ category }: { category: Category }) {
  const { updateCategory, removeCategory, addSubCategory } = useCategoryStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)

  const [isAddSubOpen, setIsAddSubOpen] = useState(false)
  const [newSubName, setNewSubName] = useState('')

  const handleUpdateCat = () => {
    if (!editName.trim()) {
      toast({
        title: 'O nome da categoria não pode ser vazio',
        variant: 'destructive',
      })
      return
    }
    updateCategory(category.id, editName.trim())
    setIsEditing(false)
    toast({ title: 'Categoria atualizada' })
  }

  const handleAddSub = () => {
    if (!newSubName.trim()) {
      toast({
        title: 'O nome da subcategoria não pode ser vazio',
        variant: 'destructive',
      })
      return
    }
    addSubCategory(category.id, newSubName.trim())
    setNewSubName('')
    setIsAddSubOpen(false)
    toast({ title: 'Subcategoria adicionada' })
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-lg bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <div className="flex items-center gap-2 flex-1">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCat()}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleUpdateCat}
                className="text-green-600 h-8 w-8"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold">{category.name}</span>
              <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-0.5 rounded border">
                {category.slug}
              </span>
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação removerá a categoria e todas as suas
                    subcategorias.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => removeCategory(category.id)}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <CollapsibleContent>
        <div className="p-4 border-t bg-background space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Subcategorias</h4>
            <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Subcategoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Subcategoria</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova subcategoria para {category.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sub-name">Nome da Subcategoria</Label>
                    <Input
                      id="sub-name"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Ex: Pintura"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddSubOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSub}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <SubcategoryList
            categoryId={category.id}
            subCategories={category.subCategories}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
