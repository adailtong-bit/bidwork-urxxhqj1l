import { useState } from 'react'
import { SubCategory, useCategoryStore } from '@/stores/useCategoryStore'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SubcategoryList({
  categoryId,
  subCategories,
}: {
  categoryId: string
  subCategories: SubCategory[]
}) {
  const { updateSubCategory, removeSubCategory } = useCategoryStore()
  const { toast } = useToast()

  const [editingSub, setEditingSub] = useState<SubCategory | null>(null)
  const [editSubName, setEditSubName] = useState('')
  const [subToDelete, setSubToDelete] = useState<string | null>(null)

  const handleUpdateSub = () => {
    if (!editingSub || !editSubName.trim()) {
      toast({
        title: 'O nome da subcategoria não pode ser vazio',
        variant: 'destructive',
      })
      return
    }
    updateSubCategory(categoryId, editingSub.id, editSubName.trim())
    setEditingSub(null)
    toast({ title: 'Subcategoria atualizada' })
  }

  const confirmDeleteSub = () => {
    if (subToDelete) {
      removeSubCategory(categoryId, subToDelete)
      setSubToDelete(null)
      toast({ title: 'Subcategoria removida' })
    }
  }

  if (subCategories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Nenhuma subcategoria cadastrada.
      </p>
    )
  }

  return (
    <>
      <Table>
        <TableBody>
          {subCategories.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="w-full">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{sub.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {sub.slug}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingSub(sub)
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
                        <AlertDialogCancel onClick={() => setSubToDelete(null)}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!editingSub}
        onOpenChange={(open) => !open && setEditingSub(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Subcategoria</DialogTitle>
            <DialogDescription>
              Altere o nome da subcategoria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-name">Nome da Subcategoria</Label>
              <Input
                id="edit-sub-name"
                value={editSubName}
                onChange={(e) => setEditSubName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateSub()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSub(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSub}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
