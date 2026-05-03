/**
 * Metas por Representante — Swiss Precision Dashboard
 * Tabela com dados mensais, expansível por representante
 */
import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dados from "../data/dados.json";

const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatVolume(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' kg';
}

function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

export default function MetasRepresentantes() {
  const [expandedRep, setExpandedRep] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'faturamento' | 'volume'>('faturamento');

  const representantes = useMemo(() => {
    if (!searchTerm) return dados.representantes;
    const term = searchTerm.toLowerCase();
    return dados.representantes.filter(
      r => r.nome.toLowerCase().includes(term) || r.codigo.includes(term)
    );
  }, [searchTerm]);

  const totalRegional = dados.metaRegional.metaAnualFat;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Metas por Representante</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Faturamento e volume mensal — Ano 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar representante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
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
            {formatCurrency(totalRegional)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Representantes</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {dados.representantes.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pedidos em Carteira</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {formatCurrency(dados.pedidos.reduce((sum, p) => sum + p.valor, 0))}
          </p>
        </div>
      </div>

      {/* Tabela de Representantes */}
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
              {representantes.map((rep) => {
                const isExpanded = expandedRep === rep.codigo;
                const pctRegional = (rep.metaAnualFat / totalRegional) * 100;
                return (
                  <RepresentanteRow
                    key={rep.codigo}
                    rep={rep}
                    isExpanded={isExpanded}
                    pctRegional={pctRegional}
                    viewMode={viewMode}
                    onToggle={() => setExpandedRep(isExpanded ? null : rep.codigo)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface RepresentanteRowProps {
  rep: typeof dados.representantes[0];
  isExpanded: boolean;
  pctRegional: number;
  viewMode: 'faturamento' | 'volume';
  onToggle: () => void;
}

function RepresentanteRow({ rep, isExpanded, pctRegional, viewMode, onToggle }: RepresentanteRowProps) {
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
          {formatCurrency(rep.metaAnualFat)}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {formatPercent(pctRegional)}
          </span>
        </td>
        {rep.metasMensais.map((m, idx) => (
          <td key={idx} className="px-3 py-3 text-right font-mono tabular-nums text-xs">
            {viewMode === 'faturamento'
              ? formatCurrency(m.faturamento)
              : formatVolume(m.volume)
            }
          </td>
        ))}
      </tr>
      <AnimatePresence>
        {isExpanded && (
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
                        {rep.detalhes.map((d, idx) => (
                          <tr key={idx} className="border-b border-border/30 hover:bg-white/50">
                            <td className="px-3 py-2 text-foreground">{d.especie}</td>
                            <td className="px-3 py-2 text-foreground">{d.subsolucao}</td>
                            <td className="px-3 py-2 text-foreground">{d.solucao}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums">{formatPercent(d.percentual)}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">
                              {formatCurrency(d.totalAnual)}
                            </td>
                            {d.metas.map((m, mIdx) => (
                              <td key={mIdx} className="px-2 py-2 text-right font-mono tabular-nums">
                                {viewMode === 'faturamento'
                                  ? formatCurrency(m.faturamento)
                                  : formatVolume(m.volume)
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
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
