import { db } from '../db/db';
import { facturesTable, ligneProduitsTable, produitsTable } from '../db/schema';
import { count, desc, eq, sql, like, inArray } from 'drizzle-orm';



export async function generateReference(isProforma: boolean) {
  const year = new Date().getFullYear();
  const prefix = isProforma ? "PRO" : "FAC";

  const last = await db
    .select({
      reference: facturesTable.reference,
    })
    .from(facturesTable)
    .where(
      like(facturesTable.reference, `${prefix}-${year}-%`)
    )
    .orderBy(desc(facturesTable.id))
    .limit(1);

  let nextNumber = 1;

  if (last.length > 0) {
    const lastRef = last[0].reference;
    const lastNumber = parseInt(lastRef.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  const formattedNumber = String(nextNumber).padStart(3, "0");

  return `${prefix}-${year}-${formattedNumber}`;
}


type CreateFactureInput = {
  facture: typeof facturesTable.$inferInsert;
  lignes: {
    produitId: number;
    quantite: number;
    reduction?: number;
  }[];
};

export async function createFacture(data :CreateFactureInput) {
  const { facture, lignes } = data;

  return await db.transaction(async (tx) => {

    const reference = await generateReference(facture.isProforma);

    const insertedFacture = await tx
      .insert(facturesTable)
      .values({ ...facture, reference })
      .returning();

    const factureId = insertedFacture[0].id;

    // récupérer produits
    const produits = await tx
      .select()
      .from(produitsTable)
      .where(inArray(produitsTable.id, lignes.map(l => l.produitId)));

    const lignesToInsert = lignes.map(l => {
      const p = produits.find(x => x.id === l.produitId);

      return {
        factureId,
        produitId: p!.id,
        nom: p!.nom,
        description: p!.description,
        image: p!.image,
        prixUnitaire: p!.prixUnitaire,
        quantite: l.quantite,
        reduction: l.reduction || 0,
      };
    });

    await tx.insert(ligneProduitsTable).values(lignesToInsert);

    return {
      success: true,
      facture: insertedFacture[0],
    };
  });
}


export async function getAllFactures() {
  try {
    const factures = await db.select().from(facturesTable);
    console.log('✅ Retrieved all factures');
    return factures;
  } catch (error) {
    console.error('❌ Error fetching factures:', error);
    throw error;
  }
}


export async function getFactureById(id: number) {
  try {
    const facture = await db
      .select()
      .from(facturesTable)
      .where(eq(facturesTable.id, id));
    
    if (facture.length === 0) {
      console.log('⚠️ Facture not found');
      return null;
    }
    
    console.log('✅ Retrieved facture by ID');
    return facture[0];
  } catch (error) {
    console.error('❌ Error fetching facture:', error);
    throw error;
  }
}



export async function updateFacture(
  id: number,
  updates: Partial<typeof facturesTable.$inferInsert>
) {
  try {
    await db
      .update(facturesTable)
      .set(updates)
      .where(eq(facturesTable.id, id));
    
    console.log('✅ Facture updated!');
    return { success: true, message: 'Facture updated successfully' };
  } catch (error) {
    console.error('❌ Error updating facture:', error);
    throw error;
  }
}


export async function deleteFacture(id: number) {
  try {
    await db.delete(facturesTable).where(eq(facturesTable.id, id));
    console.log('✅ Facture deleted!');
    return { success: true, message: 'Facture deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting facture:', error);
    throw error;
  }
}




export async function getFacturesStats() {
  try {
    const now = new Date();

    // début du mois
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const result = await db.select({
      totalDocs: count(),
      
      totalProforma: sql<number>`
        SUM(CASE WHEN ${facturesTable.isProforma} = 1 THEN 1 ELSE 0 END)
      `,
      
      totalFactures: sql<number>`
        SUM(CASE WHEN ${facturesTable.isProforma} = 0 THEN 1 ELSE 0 END)
      `,

      chiffreAffaireMois: sql<number>`
        SUM(
          CASE 
            WHEN ${facturesTable.isProforma} = 0 
            AND ${facturesTable.dateDePaiement} >= ${startOfMonth}
            THEN ${facturesTable.totalTtc}
            ELSE 0 
          END
        )
      `
    })
    .from(facturesTable);

    return {
      totalDocs: result[0]?.totalDocs || 0,
      totalProforma: Number(result[0]?.totalProforma || 0),
      totalFactures: Number(result[0]?.totalFactures || 0),
      chiffreAffaireMois: Number(result[0]?.chiffreAffaireMois || 0),
    };

  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    throw error;
  }
}


export async function getRevenueStats(period: '6months' | '12months' = '6months') {
  const months = period === '12months' ? 12 : 6;

  try {
    const result = await db
      .select({
        month: sql<string>`strftime('%Y-%m', datetime(${facturesTable.dateDePaiement}, 'unixepoch'))`,
        total: sql<number>`sum(${facturesTable.totalTtc})`,
      })
      .from(facturesTable)
      .where(
        sql`${facturesTable.dateDePaiement} IS NOT NULL
            AND datetime(${facturesTable.dateDePaiement}, 'unixepoch') >= datetime('now', '-${sql.raw(String(months))} months')`
      )
      .groupBy(sql`strftime('%Y-%m', datetime(${facturesTable.dateDePaiement}, 'unixepoch'))`)
      .orderBy(sql`strftime('%Y-%m', datetime(${facturesTable.dateDePaiement}, 'unixepoch')) asc`);

    console.log('✅ Stats de revenu récupérées !');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error fetching revenue stats:', error);
    throw error;
  }
}


export async function getLigneProduitsByFactureId(
  factureId: number
) {
  if (!factureId || isNaN(factureId)) {
    throw new Error("ID facture invalide");
  }

  const lignes = await db
    .select()
    .from(ligneProduitsTable)
    .where(eq(ligneProduitsTable.factureId, factureId));

  return lignes;
}



export async function getNextFactureReference(
  isProforma: boolean
): Promise<string> {
  const year = new Date().getFullYear();

  const prefix = isProforma ? "PRO" : "FAC";
  const pattern = `${prefix}-${year}-%`;

  // récupérer la dernière facture correspondante
  const last = await db
    .select({ reference: facturesTable.reference })
    .from(facturesTable)
    .where(like(facturesTable.reference, pattern))
    .orderBy(desc(facturesTable.id))
    .limit(1);

  let nextNumber = 1;

  if (last.length > 0) {
    const lastRef = last[0].reference; // ex: FAC-2026-004

    const parts = lastRef.split("-");
    const lastNum = parseInt(parts[2], 10);

    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  const formattedNumber = String(nextNumber).padStart(3, "0");

  return `${prefix}-${year}-${formattedNumber}`;
}
