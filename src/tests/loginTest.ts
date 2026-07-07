import { login, logout } from "../auth/auth";
import {
  estConnecte,
  getUtilisateurConnecte,
} from "../auth/session";

async function main() {
  console.log("\n========== 🧪 TEST LOGIN ==========\n");

  try {
    // 1️⃣ Vérification avant connexion
    console.log("📋 1. Vérification de la session...");
    console.log(`   - Connecté : ${estConnecte()}`);

    // 2️⃣ Connexion
    console.log("\n🔑 2. Tentative de connexion...");

    const resultat = await login(
      "john_doe@gmail.com",
      "password456"
    );

    console.log("✅ Connexion réussie !");
    console.log(resultat);

    // 3️⃣ Vérification de la session
    console.log("\n👤 3. Utilisateur connecté...");

    const utilisateur = getUtilisateurConnecte();

    console.log(`   - Connecté : ${estConnecte()}`);

    if (utilisateur) {
      console.log(`   - ID : ${utilisateur.id}`);
      console.log(
        `   - Nom : ${utilisateur.nomUtilisateur}`
      );
      console.log(
        `   - Rôle : ${utilisateur.role}`
      );
    }

    // 4️⃣ Déconnexion
    console.log("\n🚪 4. Déconnexion...");

    logout();

    // 5️⃣ Vérification finale
    console.log("\n✅ 5. Vérification...");

    console.log(
      `   - Connecté : ${estConnecte()}`
    );

    console.log(
      `   - Utilisateur :`,
      getUtilisateurConnecte()
    );

    console.log(
      "\n========== ✅ TEST TERMINÉ ==========\n"
    );

  } catch (error) {
    console.error("❌ Test échoué :", error);
  }
}

main();