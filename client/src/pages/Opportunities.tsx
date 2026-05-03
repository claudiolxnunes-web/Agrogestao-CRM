import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const STAGES = [
  { id: "prospeccao", label: "Prospecção", color: "bg-blue-50 border-blue-200" },
  { id: "visita_tecnica", label: "Visita Técnica", color: "bg-purple-50 border-purple-200" },
  { id: "orcamento_enviado", label: "Orçamento Enviado", color: "bg-yellow-50 border-yellow-200" },
  { id: "negociacao", label: "Negociação", color: "bg-orange-50 border-orange-200" },
  { id: "venda_concluida", label: "Venda Concluída", color: "bg-green-50 border-green-200" },
  { id: "perdida", label: "Perdida", color: "bg-red-50 border-red-200" },
];

export default function Opportunities() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: 0,
    title: "",
    description: "",
    value: "",
    probability: 0,
  });

  const { data: opportunities, isLoading, refetch } = trpc.opportunities.list.useQuery({
    limit: 100,
  });

  const createMutation = trpc.opportunities.create.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade criada com sucesso!");
      setShowForm(false);
      setFormData({ clientId: 0, title: "", description: "", value: "", probability: 0 });
      refetch();
    },
    onError: () => {
      toast.error("Erro ao criar oportunidade");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.title) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createMutation.mutate({
      clientId: formData.clientId,
      title: formData.title,
      description: formData.description,
      value: formData.value,
      probability: formData.probability,
    });
  };

  const opportunitiesByStage = STAGES.map((stage) => ({
    ...stage,
    opportunities: opportunities?.filter((opp: any) => opp.stage === stage.id) || [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funil de Vendas</h1>
          <p className="text-slate-600">Acompanhe suas oportunidades em cada etapa</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Oportunidade</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cliente *</label>
                <input
                  type="number"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                  placeholder="ID do cliente"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Título *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Descrição da oportunidade"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes da oportunidade"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valor</label>
                  <input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Probabilidade (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {opportunitiesByStage.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-full lg:w-auto">
              <div className={`rounded-lg border-2 p-4 ${stage.color}`}>
                <h3 className="font-semibold text-sm mb-4">{stage.label}</h3>
                <div className="space-y-3">
                  {stage.opportunities.length > 0 ? (
                    stage.opportunities.map((opp: any) => (
                      <Card key={opp.id} className="cursor-move hover:shadow-md transition">
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm">{opp.title}</h4>
                          {opp.value && (
                            <p className="text-sm text-slate-600 mt-1">
                              R$ {parseFloat(opp.value).toLocaleString("pt-BR")}
                            </p>
                          )}
                          {opp.probability && (
                            <p className="text-xs text-slate-500 mt-1">
                              Probabilidade: {opp.probability}%
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">Nenhuma oportunidade</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
