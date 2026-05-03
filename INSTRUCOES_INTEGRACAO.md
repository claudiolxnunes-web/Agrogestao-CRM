# Integração: Metas & Pedidos em Carteira no AgroGestão CRM

## Resumo

Este pacote adiciona 3 novas páginas ao AgroGestão CRM:
- `/metas` — Metas por Representante (Faturamento e Volume mensal)
- `/regional` — Meta Regional consolidada (gráfico + ranking + tabela)
- `/pedidos` — Pedidos em Carteira por Snapshot (filtros + tabela detalhada)

---

## Arquivos para copiar

Copie os seguintes arquivos para o projeto `crm-nutricao-animal`:

### 1. Dados (NOVO)
```
client/src/data/dados.json → copiar para client/src/data/dados.json
```
> Crie a pasta `client/src/data/` se não existir.

### 2. Páginas (NOVAS)
```
client/src/pages/MetasRepresentantes.tsx → copiar para client/src/pages/
client/src/pages/MetaRegional.tsx       → copiar para client/src/pages/
client/src/pages/PedidosCarteira.tsx     → copiar para client/src/pages/
```

### 3. Arquivos para SUBSTITUIR (já existem no projeto)
```
client/src/App.tsx                              → SUBSTITUIR
client/src/components/DashboardLayout.tsx       → SUBSTITUIR
```

---

## O que foi alterado nos arquivos existentes

### App.tsx
- Adicionados 3 imports: `MetasRepresentantes`, `MetaRegional`, `PedidosCarteira`
- Adicionadas 3 rotas: `/metas`, `/regional`, `/pedidos` (dentro do `<Switch>`)

### DashboardLayout.tsx
- Adicionados imports: `Target`, `ShoppingCart` do lucide-react
- Adicionado array `metasMenuItems` com os 3 novos itens de menu
- Na sidebar, adicionada nova seção "Metas & Carteira" abaixo da seção "CRM"
- O `activeMenuItem` agora busca em ambos os arrays (menuItems + metasMenuItems)

---

## Dependências necessárias

As páginas usam apenas `recharts` e `lucide-react` que já estão no projeto.
**Nenhuma dependência nova precisa ser instalada.**

---

## Após copiar os arquivos

1. Faça commit e push para o GitHub:
```bash
git add .
git commit -m "feat: adicionar módulo de Metas & Pedidos em Carteira"
git push
```

2. No Manus, faça o redeploy do projeto AgroGestão CRM.

3. Acesse: `https://agrocrm-gtijlihc.manus.space/metas`

---

## Estrutura final da sidebar

```
AgroGestão CRM
├── CRM
│   ├── Dashboard
│   ├── Clientes
│   ├── Oportunidades
│   ├── Produtos
│   ├── Orçamentos
│   └── Relatórios
└── Metas & Carteira    ← NOVO
    ├── Metas Representantes
    ├── Meta Regional
    └── Pedidos em Carteira
```

---

## Dados

Os dados estão em `client/src/data/dados.json` e incluem:
- **metasRepresentantes**: 14 representantes com metas mensais (Jan-Dez 2026)
- **metaRegional**: Totais mensais da regional
- **pedidosCarteira**: 79 itens de pedidos em carteira (snapshot 03/05/2026)

Para atualizar os dados, basta substituir o arquivo `dados.json` com novos dados no mesmo formato.
