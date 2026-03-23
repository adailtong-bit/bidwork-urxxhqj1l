import { useState } from 'react'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CategoryRow } from './components/CategoryRow'

export default function ManageCategories() {
  const { categories, addCategory } = useCategoryStore()
  const { toast } = useToast()
  const [newCategory, setNewCategory] = useState('')

  const handleAdd = () => {
    if (!newCategory.trim()) {
      toast({
        title: 'O nome da categoria não pode ser vazio',
        variant: 'destructive',
      })
      return
    }
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
