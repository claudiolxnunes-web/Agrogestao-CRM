import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Package } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: 0,
    unit: "kg",
  });

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery({
    search,
    limit: 50,
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      setShowForm(false);
      setFormData({ name: "", category: "", description: "", price: "", stock: 0, unit: "kg" });
      refetch();
    },
    onError: () => {
      toast.error("Erro ao criar produto");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-slate-600">Catálogo de nutrição animal</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Produto</CardTitle>
            <CardDescription>Adicione um novo produto ao catálogo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Produto *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ração Premium Bovinos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Ração, Suplemento, Aditivo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unidade</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="kg">Kg</option>
                    <option value="ton">Ton</option>
                    <option value="l">Litro</option>
                    <option value="un">Unidade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do produto"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Preço (R$) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estoque</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar Produto"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar produtos por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <Card key={product.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Package className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-slate-600">{product.category}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-emerald-600">
                        R$ {parseFloat(product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {product.stock} {product.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-slate-600">
            Nenhum produto encontrado. Crie um novo produto para começar.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
