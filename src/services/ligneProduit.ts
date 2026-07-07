import { db } from '../db/db';
import { ligneProduitsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

// 📌 CREATE - Ajouter un utilisateur
export async function createLigneProduit(ligneProduit: typeof ligneProduitsTable.$inferInsert) {
  try {
    await db.insert(ligneProduitsTable).values(ligneProduit);
    console.log('✅ New ligneProduit created!');
    return { success: true, message: 'LigneProduit created successfully' };
  } catch (error) {
    console.error('❌ Error creating ligneProduit:', error);
    throw error;
  }
}

// 📌 READ - Récupérer tous les utilisateurs
export async function getAllLigneProduits() {
  try {
    const ligneProduits = await db.select().from(ligneProduitsTable);
    console.log('✅ Retrieved all ligneProduits');
    return ligneProduits;
  } catch (error) {
    console.error('❌ Error fetching ligneProduits:', error);
    throw error;
  }
}

// 📌 READ - Récupérer un utilisateur par ID
export async function getLigneProduitById(id: number) {
  try {
    const ligneProduit = await db
      .select()
      .from(ligneProduitsTable)
      .where(eq(ligneProduitsTable.id, id));
    
    if (ligneProduit.length === 0) {
      console.log('⚠️ LigneProduit not found');
      return null;
    }
    
    console.log('✅ Retrieved ligneProduit by ID');
    return ligneProduit[0];
  } catch (error) {
    console.error('❌ Error fetching ligneProduit:', error);
    throw error;
  }
}


// 📌 UPDATE - Mettre à jour un utilisateur
export async function updateLigneProduit(
  id: number,
  updates: Partial<typeof ligneProduitsTable.$inferInsert>
) {
  try {
    await db
      .update(ligneProduitsTable)
      .set(updates)
      .where(eq(ligneProduitsTable.id, id));
    
    console.log('✅ LigneProduit updated!');
    return { success: true, message: 'LigneProduit updated successfully' };
  } catch (error) {
    console.error('❌ Error updating ligneProduit:', error);
    throw error;
  }
}

// 📌 DELETE - Supprimer un utilisateur
export async function deleteLigneProduit(id: number) {
  try {
    await db.delete(ligneProduitsTable).where(eq(ligneProduitsTable.id, id));
    console.log('✅ LigneProduit deleted!');
    return { success: true, message: 'LigneProduit deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting ligneProduit:', error);
    throw error;
  }
}
