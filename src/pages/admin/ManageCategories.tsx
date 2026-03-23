import { useState } from 'react'
import { useCategoryStore, Category } from '@/stores/useCategoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Trash2,
  Edit2,
  Plus,
  Save,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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

function CategoryRow({ category }: { category: Category }) {
  const {
    updateCategory,
    removeCategory,
    addSubCategory,
    updateSubCategory,
    removeSubCategory,
  } = useCategoryStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [newSubName, setNewSubName] = useState('')
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState('')
  const [subToDelete, setSubToDelete] = useState<string | null>(null)

  const handleUpdateCat = () => {
    if (!editName.trim()) return
    updateCategory(category.id, editName.trim())
    setIsEditing(false)
    toast({ title: 'Categoria atualizada' })
  }

  const handleAddSub = () => {
    if (!newSubName.trim()) return
    addSubCategory(category.id, newSubName.trim())
    setNewSubName('')
    toast({ title: 'Subcategoria adicionada' })
  }

  const handleUpdateSub = () => {
    if (!editingSubId || !editSubName.trim()) return
    updateSubCategory(category.id, editingSubId, editSubName.trim())
    setEditingSubId(null)
    toast({ title: 'Subcategoria atualizada' })
  }

  const confirmDeleteSub = () => {
    if (subToDelete) {
      removeSubCategory(category.id, subToDelete)
      setSubToDelete(null)
      toast({ title: 'Subcategoria removida' })
    }
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
          <h4 className="text-sm font-semibold">Subcategorias</h4>
          {category.subCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Nenhuma subcategoria cadastrada.
            </p>
          ) : (
            <Table>
              <TableBody>
                {category.subCategories.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="w-full">
                      {editingSubId === sub.id ? (
                        <Input
                          value={editSubName}
                          onChange={(e) => setEditSubName(e.target.value)}
                          className="h-8 max-w-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-sm">{sub.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingSubId === sub.id ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600"
                            onClick={handleUpdateSub}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingSubId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingSubId(sub.id)
                              setEditSubName(sub.name)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setSubToDelete(sub.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Excluir subcategoria?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{sub.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setSubToDelete(null)}
                                >
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDeleteSub}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Nova subcategoria..."
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
              className="max-w-sm h-9"
            />
            <Button onClick={handleAddSub} variant="secondary" className="h-9">
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function ManageCategories() {
  const { categories, addCategory } = useCategoryStore()
  const { toast } = useToast()
  const [newCategory, setNewCategory] = useState('')

  const handleAdd = () => {
    if (!newCategory.trim()) return
    addCategory(newCategory.trim())
    setNewCategory('')
    toast({ title: 'Categoria adicionada com sucesso' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Categorias
        </h1>
        <p className="text-muted-foreground">
          Adicione, edite ou remova categorias e subcategorias.
        </p>
      </div>
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Adicionar Categoria</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex gap-4">
            <Input
              placeholder="Nome da categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="max-w-sm"
            />
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
