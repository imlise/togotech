import * as clientService from "../services/clients";

async function main() {
  console.log("\n========== 🧪 TESTS CLIENTS ==========\n");

  try {
    // 1️⃣ CREATE
    console.log("📝 1. Creating clients...");

    await clientService.createClient({
      nom: "Entreprise Alpha",
      email: "contact@alpha.com",
    });

    await clientService.createClient({
      nom: "Entreprise Beta",
      email: "contact@beta.com",
    });

    await clientService.createClient({
      nom: "Entreprise Gamma",
      email: "contact@gamma.com",
    });

    // 2️⃣ READ ALL
    console.log("\n📖 2. Fetching all clients...");

    const allClients = await clientService.getAllClients();

    console.log(`✅ Found ${allClients.length} clients`);

    allClients.forEach((client) => {
      console.log(
        `   - ${client.nom} (${client.email})`
      );
    });

    // 3️⃣ READ BY ID
    console.log("\n🔍 3. Fetching client by ID (id=1)...");

    const client = await clientService.getClientById(1);

    if (client) {
      console.log(`   - ID: ${client.id}`);
      console.log(`   - Nom: ${client.nom}`);
      console.log(`   - Email: ${client.email}`);
    }

    // 4️⃣ READ BY NAME
    console.log('\n🔍 4. Fetching client by name ("Entreprise Alpha")...');

    const clientByName = await clientService.getClientByClientname(
      "Entreprise Alpha"
    );

    if (clientByName) {
      console.log(`   - Found: ${clientByName.nom}`);
      console.log(`   - Email: ${clientByName.email}`);
    }

    // 5️⃣ UPDATE
    console.log("\n✏️ 5. Updating client (id=1)...");

    await clientService.updateClient(1, {
      nom: "Entreprise Alpha SARL",
      email: "contact@alphasarl.com",
    });

    const updatedClient = await clientService.getClientById(1);

    if (updatedClient) {
      console.log(`   - New name: ${updatedClient.nom}`);
      console.log(`   - New email: ${updatedClient.email}`);
    }

    // 6️⃣ DELETE
    console.log("\n🗑️ 6. Deleting client (id=3)...");

    await clientService.deleteClient(3);

    // 7️⃣ VERIFY
    console.log("\n✅ 7. Verifying deletion...");

    const finalClients = await clientService.getAllClients();

    console.log(`   - Remaining clients: ${finalClients.length}`);

    console.log("\n========== ✅ ALL TESTS COMPLETED ==========\n");

  } catch (error) {
    console.error("❌ Test failed:", error);
    // process.exit(1);
  }
}

main();