import { db } from '../db/db';
import { clientsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

// 📌 CREATE - Ajouter un client
export async function createClient(client: typeof clientsTable.$inferInsert) {
  try {
    await db.insert(clientsTable).values(client);
    console.log('✅ New client created!');
    return { success: true, message: 'Client created successfully' };
  } catch (error) {
    console.error('❌ Error creating client:', error);
    throw error;
  }
}

// 📌 READ - Récupérer tous les clients
export async function getAllClients() {
  try {
    const clients = await db.select().from(clientsTable);
    console.log('✅ Retrieved all clients');
    return clients;
  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    throw error;
  }
}

// 📌 READ - Récupérer un client par ID
export async function getClientById(id: number) {
  try {
    const client = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, id));
    
    if (client.length === 0) {
      console.log('⚠️ Client not found');
      return null;
    }
    
    console.log('✅ Retrieved client by ID');
    return client[0];
  } catch (error) {
    console.error('❌ Error fetching client:', error);
    throw error;
  }
}

// 📌 READ - Récupérer un client par nom d'client
export async function getClientByName(nom_client: string) {
  try {
    const client = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.nom, nom_client));
    
    if (client.length === 0) {
      console.log('⚠️ Client not found');
      return null;
    }
    
    console.log('✅ Retrieved client by clientname');
    return client[0];
  } catch (error) {
    console.error('❌ Error fetching client:', error);
    throw error;
  }
}


// 📌 READ - Récupérer un client par son mail
export async function getClientByEmail(email: string) {
  try {
    const client = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.email, email));

    if (client.length === 0) {
      console.log("⚠️ Client not found");
      return null;
    }

    console.log("✅ Retrieved client by email");
    return client[0];
  } catch (error) {
    console.error("❌ Error fetching client:", error);
    throw error;
  }
}


// 📌 UPDATE - Mettre à jour un client
export async function updateClient(
  id: number,
  updates: Partial<typeof clientsTable.$inferInsert>
) {
  try {
    await db
      .update(clientsTable)
      .set(updates)
      .where(eq(clientsTable.id, id));
    
    console.log('✅ Client updated!');
    return { success: true, message: 'Client updated successfully' };
  } catch (error) {
    console.error('❌ Error updating client:', error);
    throw error;
  }
}

// 📌 DELETE - Supprimer un client
export async function deleteClient(id: number) {
  try {
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
    console.log('✅ Client deleted!');
    return { success: true, message: 'Client deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting client:', error);
    throw error;
  }
}
