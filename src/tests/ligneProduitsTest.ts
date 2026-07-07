import * as ligneProduitService from "../services/ligneProduit";

async function main() {
  console.log("\n========== 🧪 TESTS LIGNES PRODUITS ==========\n");

  try {
    // 1️⃣ CREATE
    console.log("📝 1. Creating lignes produits...");

    await ligneProduitService.createLigneProduit({
      factureId: 1,
      produitId: 1,
      nombre: 2,
    });

    await ligneProduitService.createLigneProduit({
      factureId: 1,
      produitId: 2,
      nombre: 5,
    });

    await ligneProduitService.createLigneProduit({
      factureId: 1,
      produitId: 3,
      nombre: 1,
    });

    // 2️⃣ READ ALL
    console.log("\n📖 2. Fetching all lignes produits...");

    const lignes = await ligneProduitService.getAllLigneProduits();

    console.log(`✅ Found ${lignes.length} lignes produits`);

    lignes.forEach((ligne) => {
      console.log(
        `   - ID: ${ligne.id} | Facture: ${ligne.factureId} | Produit: ${ligne.produitId} | Quantité: ${ligne.nombre}`
      );
    });

    // 3️⃣ READ BY ID
    console.log("\n🔍 3. Fetching ligne produit by ID (id=1)...");

    const ligne = await ligneProduitService.getLigneProduitById(1);

    if (ligne) {
      console.log(`   - ID: ${ligne.id}`);
      console.log(`   - Facture ID: ${ligne.factureId}`);
      console.log(`   - Produit ID: ${ligne.produitId}`);
      console.log(`   - Quantité: ${ligne.nombre}`);
    }

    // 4️⃣ UPDATE
    console.log("\n✏️ 4. Updating ligne produit (id=1)...");

    await ligneProduitService.updateLigneProduit(1, {
      nombre: 10,
    });

    const updatedLigne = await ligneProduitService.getLigneProduitById(1);

    if (updatedLigne) {
      console.log(`   - Nouvelle quantité: ${updatedLigne.nombre}`);
    }

    // 5️⃣ DELETE
    console.log("\n🗑️ 5. Deleting ligne produit (id=3)...");

    await ligneProduitService.deleteLigneProduit(3);

    // 6️⃣ VERIFY
    console.log("\n✅ 6. Verifying deletion...");

    const finalLignes = await ligneProduitService.getAllLigneProduits();

    console.log(`   - Remaining lignes produits: ${finalLignes.length}`);

    console.log("\n========== ✅ ALL TESTS COMPLETED ==========\n");

  } catch (error) {
    console.error("❌ Test failed:", error);
    // process.exit(1);
  }
}

main();