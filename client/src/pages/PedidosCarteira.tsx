/**
 * Pedidos em Carteira — Swiss Precision Dashboard
 * Tabela de pedidos com filtros por status e representante, resumo agregado
 */
import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import dados from "../data/dados.json";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatVolume(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' kg';
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.startsWith('1900')) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  '1. Bloqueado': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  '2. Em Processo Produtivo': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  '3. Planejamento de Embarque': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  '3. Produção Programada': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  '4. Em Separação': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

function getStatusStyle(status: string) {
  return statusColors[status] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
}

export default function PedidosCarteira() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [repFilter, setRepFilter] = useState<string>("todos");
  const [view, setView] = useState<'pedidos' | 'resumo'>('pedidos');

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(dados.pedidos.map(p => p.status)));
    return statuses.sort();
  }, []);

  const repOptions = useMemo(() => {
    const reps = Array.from(new Set(dados.pedidos.map(p => `${p.codErc}|${p.erc}`)));
    return reps.sort().map(r => {
      const [cod, nome] = r.split('|');
      return { cod, nome };
    });
  }, []);

  const filteredPedidos = useMemo(() => {
    return dados.pedidos.filter(p => {
      if (statusFilter !== "todos" && p.status !== statusFilter) return false;
      if (repFilter !== "todos" && p.codErc !== repFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          p.cliente.toLowerCase().includes(term) ||
          p.produto.toLowerCase().includes(term) ||
          p.erc.toLowerCase().includes(term) ||
          p.pedido.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [searchTerm, statusFilter, repFilter]);

  const resumoPorRep = useMemo(() => {
    const map: Record<string, { nome: string; qtd: number; valor: number; volume: number; bloqueados: number; emProcesso: number }> = {};
    dados.pedidos.forEach(p => {
      if (!map[p.codErc]) {
        map[p.codErc] = { nome: p.erc, qtd: 0, valor: 0, volume: 0, bloqueados: 0, emProcesso: 0 };
      }
      map[p.codErc].qtd += 1;
      map[p.codErc].valor += p.valor;
      map[p.codErc].volume += p.volume;
      if (p.status.includes('Bloqueado')) map[p.codErc].bloqueados += 1;
      if (p.status.includes('Em Processo')) map[p.codErc].emProcesso += 1;
    });
    return Object.entries(map)
      .map(([cod, data]) => ({ cod, ...data }))
      .sort((a, b) => b.valor - a.valor);
  }, []);

  const totals = useMemo(() => ({
    qtd: filteredPedidos.length,
    valor: filteredPedidos.reduce((s, p) => s + p.valor, 0),
    volume: filteredPedidos.reduce((s, p) => s + p.volume, 0),
  }), [filteredPedidos]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dados.pedidos.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pedidos em Carteira</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Snapshot: {dados.snapshotDate.split('-').reverse().join('/')} — {dados.pedidos.length} pedidos
          </p>
        </div>
        <div className="flex bg-muted rounded-md p-0.5">
          <button
            onClick={() => setView('pedidos')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              view === 'pedidos' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setView('resumo')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              view === 'resumo' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Por Representante
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => {
          const style = getStatusStyle(status);
          const shortName = status.replace(/^\d+\.\s*/, '');
          return (
            <div key={status} className={`rounded-lg border border-border p-4 ${style.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                <p className={`text-xs font-medium ${style.text}`}>{shortName}</p>
              </div>
              <p className={`text-xl font-bold font-mono tabular-nums ${style.text}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Total em Carteira</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {formatCurrency(totals.valor)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Volume Total</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {formatVolume(totals.volume)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Itens Filtrados</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {totals.qtd}
          </p>
        </div>
      </div>

      {view === 'pedidos' ? (
        <>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cliente, produto, representante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-8 pr-8 py-2 text-sm border border-border rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="todos">Todos Status</option>
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.replace(/^\d+\.\s*/, '')}</option>
                  ))}
                </select>
              </div>
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-48 truncate"
              >
                <option value="todos">Todos Representantes</option>
                {repOptions.map(r => (
                  <option key={r.cod} value={r.cod}>{r.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela de Pedidos */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Pedido</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Representante</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Cliente</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Produto</th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Valor</th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Volume</th>
                    <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Prev. Fat.</th>
                    <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Bloqueio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPedidos.map((p, idx) => {
                    const style = getStatusStyle(p.status);
                    return (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {p.status.replace(/^\d+\.\s*/, '')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{p.pedido}</td>
                        <td className="px-4 py-3 text-xs max-w-36 truncate" title={p.erc}>{p.erc}</td>
                        <td className="px-4 py-3 text-xs max-w-40 truncate" title={p.cliente}>{p.cliente}</td>
                        <td className="px-4 py-3 text-xs max-w-40 truncate" title={p.produto}>{p.produto}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-xs font-medium">{formatCurrency(p.valor)}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">{formatVolume(p.volume)}</td>
                        <td className="px-4 py-3 text-center text-xs">{formatDate(p.prevFat)}</td>
                        <td className="px-4 py-3 text-center text-xs max-w-28 truncate" title={p.bloqueio}>{p.bloqueio || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-semibold">
                    <td className="px-4 py-3" colSpan={5}>TOTAL ({filteredPedidos.length} itens)</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatCurrency(totals.valor)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatVolume(totals.volume)}</td>
                    <td className="px-4 py-3" colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Resumo por Representante */
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Carteira por Representante</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Cód</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Representante</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Qtd</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Valor Total</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Volume Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Bloqueados</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Em Processo</th>
                </tr>
              </thead>
              <tbody>
                {resumoPorRep.map((r) => (
                  <tr key={r.cod} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{r.cod}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.nome}</td>
                    <td className="px-4 py-3 text-center font-mono tabular-nums">{r.qtd}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">{formatCurrency(r.valor)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatVolume(r.volume)}</td>
                    <td className="px-4 py-3 text-center">
                      {r.bloqueados > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          {r.bloqueados}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.emProcesso > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          {r.emProcesso}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-foreground">TOTAL</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">{resumoPorRep.reduce((s, r) => s + r.qtd, 0)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatCurrency(resumoPorRep.reduce((s, r) => s + r.valor, 0))}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatVolume(resumoPorRep.reduce((s, r) => s + r.volume, 0))}</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">{resumoPorRep.reduce((s, r) => s + r.bloqueados, 0)}</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">{resumoPorRep.reduce((s, r) => s + r.emProcesso, 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
