
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useState } from "react";

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  productsCount: number;
}

const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Ray-Ban",
    description: "Marca líder em óculos de sol premium",
    website: "https://rayban.com",
    isActive: true,
    productsCount: 25
  },
  {
    id: "2",
    name: "Oakley",
    description: "Óculos esportivos de alta performance",
    website: "https://oakley.com",
    isActive: true,
    productsCount: 18
  },
  {
    id: "3",
    name: "Prada",
    description: "Marca de luxo italiana",
    website: "https://prada.com",
    isActive: true,
    productsCount: 12
  }
];

export function ProductBrand() {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: "",
    description: "",
    website: ""
  });

  const handleAddBrand = () => {
    if (newBrand.name) {
      const brand: Brand = {
        id: (brands.length + 1).toString(),
        name: newBrand.name,
        description: newBrand.description,
        website: newBrand.website,
        isActive: true,
        productsCount: 0
      };
      setBrands([...brands, brand]);
      setNewBrand({ name: "", description: "", website: "" });
      setIsAddingBrand(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Marcas de Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie as marcas dos seus produtos
          </p>
        </div>
        <Button onClick={() => setIsAddingBrand(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Marca
        </Button>
      </div>

      {isAddingBrand && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Marca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Nome da Marca</Label>
                <Input
                  id="brandName"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="Ex: Ray-Ban"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandWebsite">Website</Label>
                <Input
                  id="brandWebsite"
                  value={newBrand.website}
                  onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandDescription">Descrição</Label>
              <Input
                id="brandDescription"
                value={newBrand.description}
                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                placeholder="Descrição da marca..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddBrand}>Salvar</Button>
              <Button variant="outline" onClick={() => setIsAddingBrand(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Lista de Marcas
          </CardTitle>
          <CardDescription>
            {brands.filter(b => b.isActive).length} marcas ativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.description}</TableCell>
                  <TableCell>
                    {brand.website && (
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {brand.website}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {brand.productsCount} produtos
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
