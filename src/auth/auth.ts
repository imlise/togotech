import { verifierMotDePasse } from "./password";
import { ouvrirSession, fermerSession } from "./session";
import * as utilisateurService from "../services/utilisateurs";

export async function login(
  email: string,
  motDePasse: string
) {
  try {
    // Recherche de l'utilisateur
    const utilisateur = await utilisateurService.getUtilisateurByEmail(
      email
    );

    // Vérifie que l'utilisateur existe
    if (!utilisateur) {
      throw new Error("Mail ou mot de passe incorrect.");
    }

    // Vérifie que le compte est actif
    if (!utilisateur.actif) {
      throw new Error("Ce compte est désactivé.");
    }

    // Vérifie le mot de passe
    const motDePasseValide = await verifierMotDePasse(
      motDePasse,
      utilisateur.motDePasse
    );

    if (!motDePasseValide) {
      throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
    }

    // Ouvre la session
    ouvrirSession(utilisateur);

    console.log("✅ Connexion réussie.");

    // Ne jamais retourner le hash du mot de passe
    return {
      success: true,
      message: "Login successful",
      utilisateur: {
        id: utilisateur.id,
        nomUtilisateur: utilisateur.nomUtilisateur,
        role: utilisateur.role,
        actif: utilisateur.actif,
      },
    };
  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error);
    throw error;
  }
}


export function logout() {
    fermerSession();

    return {
        success: true,
        message: "Logout successful",
    };
}
