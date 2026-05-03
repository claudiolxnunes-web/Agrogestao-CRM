/**
 * Meta Regional — Swiss Precision Dashboard
 * Visão consolidada da regional com gráfico mensal e resumo por representante
 */
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import dados from "../data/dados.json";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatVolume(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' kg';
}

function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function MetaRegional() {
  const chartData = useMemo(() => {
    return dados.metaRegional.metasMensais.map((m, idx) => ({
      mes: mesesAbrev[idx],
      faturamento: m.faturamento,
      volume: m.volume,
    }));
  }, []);

  const repRanking = useMemo(() => {
    return [...dados.representantes]
      .sort((a, b) => b.metaAnualFat - a.metaAnualFat)
      .map(r => ({
        ...r,
        pct: (r.metaAnualFat / dados.metaRegional.metaAnualFat) * 100
      }));
  }, []);

  const totalVolume = useMemo(() => {
    return dados.metaRegional.metasMensais.reduce((sum, m) => sum + m.volume, 0);
  }, []);

  const maxFat = Math.max(...chartData.map(d => d.faturamento));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meta Regional</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {dados.metaRegional.nome} — Consolidado 2026
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta Anual Faturamento</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {formatCurrency(dados.metaRegional.metaAnualFat)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta Anual Volume</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {formatVolume(totalVolume)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Representantes</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {dados.representantes.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Mensal</p>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">
            {formatCurrency(dados.metaRegional.metaAnualFat / 12)}
          </p>
        </div>
      </div>

      {/* Gráfico Mensal */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Meta Mensal de Faturamento</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="faturamento" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.faturamento === maxFat ? '#1a7a3a' : '#1a7a3a70'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking de Representantes */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Participação por Representante</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Representante</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Meta Anual</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">% Regional</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-48">Participação</th>
              </tr>
            </thead>
            <tbody>
              {repRanking.map((rep, idx) => (
                <tr key={rep.codigo} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{rep.nome}</span>
                    <span className="text-xs text-muted-foreground ml-2">#{rep.codigo}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">
                    {formatCurrency(rep.metaAnualFat)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {formatPercent(rep.pct)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(rep.pct * 4, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-foreground">TOTAL REGIONAL</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {formatCurrency(dados.metaRegional.metaAnualFat)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">100.0%</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tabela Mensal Detalhada */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Metas Mensais Detalhadas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Mês</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Faturamento</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Volume (kg)</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">% do Anual</th>
              </tr>
            </thead>
            <tbody>
              {dados.metaRegional.metasMensais.map((m, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{m.mes}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatCurrency(m.faturamento)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatVolume(m.volume)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {formatPercent((m.faturamento / dados.metaRegional.metaAnualFat) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td className="px-4 py-3 text-foreground">TOTAL</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{formatCurrency(dados.metaRegional.metaAnualFat)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{formatVolume(totalVolume)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
