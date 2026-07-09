import { db } from '../db/db';
import { produitsTable } from '../db/schema';
import { eq } from 'drizzle-orm';



export async function createProduit(produit: typeof produitsTable.$inferInsert) {
  try {
    await db.insert(produitsTable).values(produit);
    console.log('✅ Nouveau Produit!');
    return { success: true, message: 'Produit created successfully' };
  } catch (error) {
    console.error('❌ Error creating produit:', error);
    throw error;
  }
}


export async function getAllProduits() {
  try {
    const produits = await db.select().from(produitsTable);
    console.log('✅ Retrieved all produits');
    return produits;
  } catch (error) {
    console.error('❌ Error fetching produits:', error);
    throw error;
  }
}


export async function getProduitById(id: number) {
  try {
    const produit = await db
      .select()
      .from(produitsTable)
      .where(eq(produitsTable.id, id));
    
    if (produit.length === 0) {
      console.log('⚠️ Produit not found');
      return null;
    }
    
    console.log('✅ Retrieved produit by ID');
    return produit[0];
  } catch (error) {
    console.error('❌ Error fetching produit:', error);
    throw error;
  }
}

export async function getProduitByName(nom: string) {
  try {
    const produit = await db
      .select()
      .from(produitsTable)
      .where(eq(produitsTable.nom, nom));
    
    if (produit.length === 0) {
      console.log('⚠️ Produit not found');
      return null;
    }
    
    console.log('✅ Retrieved produit by Name');
    return produit[0];
  } catch (error) {
    console.error('❌ Error fetching produit:', error);
    throw error;
  }
}


export async function updateProduit(
  id: number,
  updates: Partial<typeof produitsTable.$inferInsert>
) {
  try {
    await db
      .update(produitsTable)
      .set(updates)
      .where(eq(produitsTable.id, id));
    
    console.log('✅ Produit updated!');
    return { success: true, message: 'Produit updated successfully' };
  } catch (error) {
    console.error('❌ Error updating produit:', error);
    throw error;
  }
}


export async function deleteProduit(id: number) {
  try {
    // image
    const produit = await getProduitById(id);
    


    await db.delete(produitsTable).where(eq(produitsTable.id, id));
    // image
    await supprimerImage(produit!.image);

    
    console.log('✅ Produit deleted!');
    return { success: true, message: 'Produit deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting produit:', error);
    throw error;
  }
}
