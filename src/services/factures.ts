import { db } from '../db/db';
import { facturesTable } from '../db/schema';
import { eq } from 'drizzle-orm';


export async function createFacture(facture: typeof facturesTable.$inferInsert) {
  try {
    await db.insert(facturesTable).values(facture);
    console.log('✅ Nouveau Facture!');
    return { success: true, message: 'Facture created successfully' };
  } catch (error) {
    console.error('❌ Error creating facture:', error);
    throw error;
  }
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
