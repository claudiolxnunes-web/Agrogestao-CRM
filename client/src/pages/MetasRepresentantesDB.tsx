/**
 * Metas por Representante — Conectado ao Banco de Dados
 * Tabela com dados mensais, expansível por representante com drill-down de soluções/subsoluções
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

function formatVolume(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(num) + ' kg';
}

function formatPercent(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(1) + '%';
}

export default function MetasRepresentantesDB() {
  const [expandedRep, setExpandedRep] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'faturamento' | 'volume'>('faturamento');

  // Buscar representantes
  const { data: representantes = [], isLoading: loadingReps } = trpc.representantes.list.useQuery();

  // Filtrar representantes por busca
  const filteredRepresentantes = useMemo(() => {
    if (!searchTerm) return representantes;
    const term = searchTerm.toLowerCase();
    return representantes.filter(
      r => r.nome.toLowerCase().includes(term) || r.codigo.toLowerCase().includes(term)
    );
  }, [searchTerm, representantes]);

  // Calcular total de metas anuais
  const totalMetaAnual = useMemo(() => {
    return representantes.reduce((sum, rep) => sum + (parseFloat(rep.metaAnualFat?.toString() || "0")), 0);
  }, [representantes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Metas por Representante</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Faturamento e volume mensal — Ano {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar representante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm w-64"
            />
          </div>
          <div className="flex bg-muted rounded-md p-0.5">
            <button
              onClick={() => setViewMode('faturamento')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                viewMode === 'faturamento' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Faturamento
            </button>
            <button
              onClick={() => setViewMode('volume')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                viewMode === 'volume' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta Regional Anual</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {formatCurrency(totalMetaAnual)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Representantes</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {representantes.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média por Representante</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {representantes.length > 0 ? formatCurrency(totalMetaAnual / representantes.length) : "R$ 0"}
          </p>
        </div>
      </div>

      {/* Tabela de Representantes */}
      {loadingReps ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : filteredRepresentantes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-slate-600">
            Nenhum representante encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-8"></th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Representante</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Meta Anual</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">% Regional</th>
                  {mesesAbrev.map(m => (
                    <th key={m} className="text-right px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRepresentantes.map((rep) => (
                  <RepresentanteRow
                    key={rep.id}
                    rep={rep}
                    isExpanded={expandedRep === rep.id}
                    totalRegional={totalMetaAnual}
                    viewMode={viewMode}
                    onToggle={() => setExpandedRep(expandedRep === rep.id ? null : rep.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface RepresentanteRowProps {
  rep: any;
  isExpanded: boolean;
  totalRegional: number;
  viewMode: 'faturamento' | 'volume';
  onToggle: () => void;
}

function RepresentanteRow({ rep, isExpanded, totalRegional, viewMode, onToggle }: RepresentanteRowProps) {
  const metaAnual = parseFloat(rep.metaAnualFat?.toString() || "0");
  const pctRegional = totalRegional > 0 ? (metaAnual / totalRegional) * 100 : 0;

  // Buscar metas do representante
  const { data: metas = [] } = trpc.metas.getByRepresentante.useQuery(
    { representanteId: rep.id },
    { enabled: isExpanded }
  );

  // Agrupar metas por solução/subsolução
  const metasPorSolucao = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    metas.forEach((meta: any) => {
      const key = `${meta.solutionNome}|${meta.subsolutionNome}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(meta);
    }, {});
    return Object.entries(grouped).map(([key, items]) => {
      const [solutionNome, subsolutionNome] = key.split('|');
      return {
        solutionNome,
        subsolutionNome,
        especie: items[0]?.especie,
        items,
      };
    });
  }, [metas]);

  // Calcular meses com dados
  const mesesComDados = useMemo(() => {
    const meses: { [key: number]: { faturamento: number; volume: number } } = {};
    metasPorSolucao.forEach((grupo) => {
      grupo.items.forEach((meta: any) => {
        if (!meses[meta.mes]) {
          meses[meta.mes] = { faturamento: 0, volume: 0 };
        }
        meses[meta.mes].faturamento += parseFloat(meta.faturamento?.toString() || "0");
        meses[meta.mes].volume += parseFloat(meta.volume?.toString() || "0");
      });
    });
    return meses;
  }, [metasPorSolucao]);

  return (
    <>
      <tr
        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-primary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </td>
        <td className="px-4 py-3">
          <div>
            <span className="font-medium text-foreground">{rep.nome}</span>
            <span className="text-xs text-muted-foreground ml-2">#{rep.codigo}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">
          {formatCurrency(metaAnual)}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {formatPercent(pctRegional)}
          </span>
        </td>
        {mesesAbrev.map((_, idx) => {
          const mes = idx + 1;
          const dadosMes = mesesComDados[mes];
          return (
            <td key={mes} className="px-3 py-3 text-right font-mono tabular-nums text-xs">
              {dadosMes ? (
                viewMode === 'faturamento'
                  ? formatCurrency(dadosMes.faturamento)
                  : formatVolume(dadosMes.volume)
              ) : (
                "-"
              )}
            </td>
          );
        })}
      </tr>
      <AnimatePresence>
        {isExpanded && metasPorSolucao.length > 0 && (
          <tr>
            <td colSpan={16} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-muted/20 px-8 py-4 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Detalhamento por Solução
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Espécie</th>
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Subsolução</th>
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Solução</th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">%</th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">Total</th>
                          {mesesAbrev.map(m => (
                            <th key={m} className="text-right px-2 py-2 font-medium text-muted-foreground">{m}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {metasPorSolucao.map((grupo, idx) => {
                          const totalGrupo = grupo.items.reduce((sum, item: any) => sum + parseFloat(item.faturamento?.toString() || "0"), 0);
                          const pctGrupo = metaAnual > 0 ? (totalGrupo / metaAnual) * 100 : 0;

                          return (
                            <tr key={idx} className="border-b border-border/30 hover:bg-white/50">
                              <td className="px-3 py-2 text-foreground">{grupo.especie}</td>
                              <td className="px-3 py-2 text-foreground">{grupo.subsolutionNome}</td>
                              <td className="px-3 py-2 text-foreground">{grupo.solutionNome}</td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums">{formatPercent(pctGrupo)}</td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">
                                {formatCurrency(totalGrupo)}
                              </td>
                              {mesesAbrev.map((_, mIdx) => {
                                const mes = mIdx + 1;
                                const metaMes = grupo.items.find((m: any) => m.mes === mes);
                                return (
                                  <td key={mes} className="px-2 py-2 text-right font-mono tabular-nums">
                                    {metaMes ? (
                                      viewMode === 'faturamento'
                                        ? formatCurrency(metaMes.faturamento)
                                        : formatVolume(metaMes.volume)
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
