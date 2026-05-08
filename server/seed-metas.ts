/**
 * Script para popular dados de teste de representantes, soluções e metas
 * Execute com: npx tsx server/seed-metas.ts
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";

const representantesData = [
  {
    codigo: "001234",
    nome: "CLAUDIO LUIZ XAVIER NUNES",
    metaAnualFat: "3749634.09",
  },
  {
    codigo: "001235",
    nome: "JOÃO SILVA",
    metaAnualFat: "2500000.00",
  },
  {
    codigo: "001236",
    nome: "MARIA SANTOS",
    metaAnualFat: "3000000.00",
  },
];

const solucoesData = [
  {
    codigo: "SOL001",
    nome: "GORDURAS PROPRIAS",
    especie: "Nutricao Ruminantes",
  },
  {
    codigo: "SOL002",
    nome: "PREMIX VITAMINAS",
    especie: "Nutricao Ruminantes",
  },
  {
    codigo: "SOL003",
    nome: "ADITIVOS ALIMENTARES",
    especie: "Nutricao Suinos",
  },
];

const subsolucoes: { [key: string]: string[] } = {
  SOL001: ["CORTE", "LEITEIRA"],
  SOL002: ["BOVINOS", "EQUINOS"],
  SOL003: ["SUINOS ENGORDA", "SUINOS REPRODUÇÃO"],
};

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  try {
    const { representantes, solutions, subsolutions, targetsMeta } = await import(
      "../drizzle/schema"
    );

    console.log("🌱 Iniciando seed de dados...");

    // Limpar dados existentes
    console.log("🗑️  Limpando dados existentes...");
    // await db.delete(targetsMeta);
    // await db.delete(subsolutions);
    // await db.delete(solutions);
    // await db.delete(representantes);

    // Inserir representantes
    console.log("👥 Inserindo representantes...");
    for (const rep of representantesData) {
      await db
        .insert(representantes)
        .values({
          codigo: rep.codigo,
          nome: rep.nome,
          metaAnualFat: parseFloat(rep.metaAnualFat),
        })
        .onDuplicateKeyUpdate({
          set: {
            nome: rep.nome,
            metaAnualFat: parseFloat(rep.metaAnualFat),
          },
        });
    }

    // Inserir soluções
    console.log("💡 Inserindo soluções...");
    const solutionIds: { [key: string]: number } = {};
    for (const sol of solucoesData) {
      const result = await db
        .insert(solutions)
        .values({
          codigo: sol.codigo,
          nome: sol.nome,
          especie: sol.especie,
        })
        .onDuplicateKeyUpdate({
          set: {
            nome: sol.nome,
            especie: sol.especie,
          },
        });

      // Buscar ID da solução inserida
      const inserted = await db
        .select()
        .from(solutions)
        .where(eq(solutions.codigo, sol.codigo))
        .limit(1);

      if (inserted.length > 0) {
        solutionIds[sol.codigo] = inserted[0].id;
      }
    }

    // Inserir subsoluções
    console.log("🔧 Inserindo subsoluções...");
    const subsolutionIds: { [key: string]: number } = {};
    for (const [solCodigo, subsolList] of Object.entries(subsolucoes)) {
      const solutionId = solutionIds[solCodigo];
      if (!solutionId) continue;

      for (let idx = 0; idx < subsolList.length; idx++) {
        const subsol = subsolList[idx];
        const codigo = `${solCodigo}-${idx + 1}`;

        const result = await db
          .insert(subsolutions)
          .values({
            solutionId,
            codigo,
            nome: subsol,
          })
          .onDuplicateKeyUpdate({
            set: {
              nome: subsol,
            },
          });

        // Buscar ID da subsolução inserida
        const inserted = await db
          .select()
          .from(subsolutions)
          .where(eq(subsolutions.codigo, codigo))
          .limit(1);

        if (inserted.length > 0) {
          subsolutionIds[codigo] = inserted[0].id;
        }
      }
    }

    // Inserir metas mensais
    console.log("📊 Inserindo metas mensais...");
    const repsFromDb = await db.select().from(representantes);

    for (const rep of repsFromDb) {
      for (const [solCodigo, subsolList] of Object.entries(subsolucoes)) {
        for (let idx = 0; idx < subsolList.length; idx++) {
          const codigo = `${solCodigo}-${idx + 1}`;
          const subsolutionId = subsolutionIds[codigo];
          if (!subsolutionId) continue;

          // Gerar dados mensais aleatórios
          for (let mes = 1; mes <= 12; mes++) {
            const faturamento = Math.random() * 50000 + 10000;
            const volume = Math.random() * 100000 + 20000;
            const percentual = Math.random() * 20 + 5;

            await db
              .insert(targetsMeta)
              .values({
                representanteId: rep.id,
                subsolutionId,
                mes,
                ano: new Date().getFullYear(),
                faturamento: faturamento.toString(),
                volume: volume.toString(),
                percentual: percentual.toString(),
              })
              .onDuplicateKeyUpdate({
                set: {
                  faturamento: faturamento.toString(),
                  volume: volume.toString(),
                  percentual: percentual.toString(),
                },
              });
          }
        }
      }
    }

    console.log("✅ Seed concluído com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante seed:", error);
    process.exit(1);
  }
}

seed();
