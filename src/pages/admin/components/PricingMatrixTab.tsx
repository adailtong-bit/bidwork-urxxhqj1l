import { usePricingMatrixStore } from '@/stores/usePricingMatrixStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export default function PricingMatrixTab() {
  const {
    rules,
    setSiteLevelPrice,
    setRegionMultiplier,
    setCategoryMultiplier,
  } = usePricingMatrixStore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Site</CardTitle>
          <CardDescription>Preço base mensal (R$)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(rules.siteLevels).map(([level, price]) => (
            <div key={level} className="space-y-1">
              <Label>{level}</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) =>
                  setSiteLevelPrice(level, Number(e.target.value))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regiões</CardTitle>
          <CardDescription>Multiplicador de preço por região</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(rules.regionMultipliers).map(([region, mult]) => (
            <div key={region} className="space-y-1">
              <Label>{region}</Label>
              <Input
                type="number"
                step="0.1"
                value={mult}
                onChange={(e) =>
                  setRegionMultiplier(region, Number(e.target.value))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias (Branch)</CardTitle>
          <CardDescription>
            Multiplicador de preço por atividade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(rules.categoryMultipliers).map(([cat, mult]) => (
            <div key={cat} className="space-y-1">
              <Label>{cat}</Label>
              <Input
                type="number"
                step="0.1"
                value={mult}
                onChange={(e) =>
                  setCategoryMultiplier(cat, Number(e.target.value))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
