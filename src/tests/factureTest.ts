import * as factureService from "../services/factures";

async function main() {
  console.log("\n========== 🧪 TESTS FACTURES ==========\n");

  try {
    // 1️⃣ CREATE
    console.log("📝 1. Creating factures...");

    await factureService.createFacture({
      reference: "FAC-2026-001",
      totalHt: 100000,
      tva: 18,
      totalTtc: 118000,
      dateEcheance: new Date("2026-07-15"),
      dateDePaiement: new Date("2026-07-10"),
      isProforma: false,
      validite: 30,
      dateDeLivraison: new Date("2026-07-08"),
      garantie: "12 mois",
      client: 1,
    });

    await factureService.createFacture({
      reference: "PRO-2026-001",
      totalHt: 250000,
      tva: 18,
      totalTtc: 295000,
      dateEcheance: new Date("2026-08-15"),
      dateDePaiement: null,
      isProforma: true,
      validite: 15,
      dateDeLivraison: null,
      garantie: "6 mois",
      client: 1,
    });

    await factureService.createFacture({
      reference: "FAC-2026-003",
      totalHt: 50000,
      tva: 18,
      totalTtc: 59000,
      dateEcheance: new Date("2026-09-15"),
      dateDePaiement: null,
      isProforma: false,
      validite: 30,
      dateDeLivraison: new Date("2026-09-12"),
      garantie: "Aucune",
      client: 1,
    });

    // 2️⃣ READ ALL
    console.log("\n📖 2. Fetching all factures...");

    const allFactures = await factureService.getAllFactures();

    console.log(`✅ Found ${allFactures.length} factures`);

    allFactures.forEach((f) => {
      console.log(
        `   - ${f.reference} | ${f.isProforma ? "Proforma" : "Facture"} | HT: ${f.totalHt} | TTC: ${f.totalTtc}`
      );
    });

    // 3️⃣ READ BY ID
    console.log("\n🔍 3. Fetching facture by ID (id=1)...");

    const facture = await factureService.getFactureById(1);

    if (facture) {
      console.log(`   - ID: ${facture.id}`);
      console.log(`   - Reference: ${facture.reference}`);
      console.log(`   - Type: ${facture.isProforma ? "Proforma" : "Facture"}`);
      console.log(`   - Client ID: ${facture.client}`);
      console.log(`   - Total HT: ${facture.totalHt}`);
      console.log(`   - TVA: ${facture.tva}%`);
      console.log(`   - Total TTC: ${facture.totalTtc}`);
      console.log(`   - Validité: ${facture.validite} jours`);
      console.log(`   - Garantie: ${facture.garantie}`);
      console.log(`   - Date d'échéance: ${facture.dateEcheance}`);
      console.log(`   - Date de paiement: ${facture.dateDePaiement}`);
      console.log(`   - Date de livraison: ${facture.dateDeLivraison}`);
    }

    // 4️⃣ UPDATE
    console.log("\n✏️ 4. Updating facture (id=1)...");

    await factureService.updateFacture(1, {
      totalHt: 120000,
      totalTtc: 141600,
      garantie: "24 mois",
      validite: 60,
    });

    const updatedFacture = await factureService.getFactureById(1);

    if (updatedFacture) {
      console.log(`   - New HT: ${updatedFacture.totalHt}`);
      console.log(`   - New TTC: ${updatedFacture.totalTtc}`);
      console.log(`   - New Garantie: ${updatedFacture.garantie}`);
      console.log(`   - New Validité: ${updatedFacture.validite} jours`);
    }

    // 5️⃣ DELETE
    console.log("\n🗑️ 5. Deleting facture (id=3)...");

    await factureService.deleteFacture(3);

    // 6️⃣ VERIFY
    console.log("\n✅ 6. Verifying deletion...");

    const finalFactures = await factureService.getAllFactures();

    console.log(`   - Remaining factures: ${finalFactures.length}`);

    console.log("\n========== ✅ ALL TESTS COMPLETED ==========\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    // process.exit(1);
  }
}

main();