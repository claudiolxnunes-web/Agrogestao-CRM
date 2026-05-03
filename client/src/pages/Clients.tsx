import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    farmName: "",
    producerName: "",
    email: "",
    phone: "",
    whatsapp: "",
    animalType: "bovinos" as const,
    animalQuantity: 0,
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const { data: clients, isLoading, refetch } = trpc.clients.list.useQuery({
    search,
    limit: 50,
  });

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      setShowForm(false);
      setFormData({
        farmName: "",
        producerName: "",
        email: "",
        phone: "",
        whatsapp: "",
        animalType: "bovinos",
        animalQuantity: 0,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
      });
      refetch();
    },
    onError: () => {
      toast.error("Erro ao criar cliente");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmName || !formData.producerName) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-slate-600">Gestão de produtores rurais e fazendas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Cliente</CardTitle>
            <CardDescription>Adicione um novo produtor rural ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da Fazenda *</label>
                  <Input
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    placeholder="Ex: Fazenda São João"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nome do Produtor *</label>
                  <Input
                    value={formData.producerName}
                    onChange={(e) => setFormData({ ...formData, producerName: e.target.value })}
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Animal</label>
                  <select
                    value={formData.animalType}
                    onChange={(e) => setFormData({ ...formData, animalType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="bovinos">Bovinos</option>
                    <option value="suinos">Suínos</option>
                    <option value="aves">Aves</option>
                    <option value="equinos">Equinos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantidade de Animais</label>
                  <Input
                    type="number"
                    value={formData.animalQuantity}
                    onChange={(e) => setFormData({ ...formData, animalQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 0000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">WhatsApp</label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(00) 99999-9999"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Cidade</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CEP</label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar Cliente"}
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
          placeholder="Buscar clientes por nome ou fazenda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : clients && clients.length > 0 ? (
        <div className="grid gap-4">
          {clients.map((client: any) => (
            <Card key={client.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{client.farmName}</h3>
                    <p className="text-sm text-slate-600">Produtor: {client.producerName}</p>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                      <span>{client.animalType} - {client.animalQuantity} animais</span>
                      {client.city && <span>{client.city}, {client.state}</span>}
                    </div>
                    <div className="flex gap-4 mt-3">
                      {client.email && (
                        <a href={`mailto:${client.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </a>
                      )}
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.status === 'ativo' ? 'bg-green-100 text-green-800' :
                      client.status === 'inativo' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-slate-600">
            Nenhum cliente encontrado. Crie um novo cliente para começar.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
