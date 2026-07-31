import { verifierMotDePasse } from "./password";
import * as utilisateurService from "../services/utilisateurs";
import jwt from 'jsonwebtoken';


const SECRET = 'mon_super_secret'; // ⚠️ .env plus tard

export async function login(
  email: string,
  motDePasse: string
) {
  try {
    const utilisateur = await utilisateurService.getUtilisateurByEmail(email);

    if (!utilisateur) {
      throw new Error("Mail ou mot de passe incorrect.");
    }

    if (!utilisateur.actif) {
      throw new Error("Ce compte est désactivé.");
    }

    const motDePasseValide = await verifierMotDePasse(
      motDePasse,
      utilisateur.motDePasse
    );

    if (!motDePasseValide) {
      throw new Error("Identifiants incorrect.");
    }


    // 🆕 AJOUT : création du token
    const token = jwt.sign(
      {
        id: utilisateur.id,
        role: utilisateur.role
      },
      SECRET,
      {
        expiresIn: '1d'
      }
    );

    console.log("✅ Connexion réussie.");

    return {
      success: true,
      message: "Login successful",
      token, // 👈 IMPORTANT
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
  return {
    success: true,
    message: "Logout successful",
  };
}




export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide' });
  }
}