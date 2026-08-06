import { verifierMotDePasse } from "./password";
import * as utilisateurService from "../services/utilisateurs";
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { utilisateursTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/db";

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
        email:utilisateur.email,
        nom: utilisateur.nomUtilisateur,
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



export const changePassword = async (req: Request, res: Response) => {
  try {
    const { motDePasse, motDePasseNouveau } = req.body;
    const userId = (req as any).user?.id; // De la session/token JWT

    // ✅ Validations
    if (!motDePasse || !motDePasseNouveau) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires.",
      });
    }

    if (motDePasseNouveau.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié.",
      });
    }

    // ✅ Récupère l'utilisateur
    const utilisateur = await db
      .select()
      .from(utilisateursTable)
      .where(eq(utilisateursTable.id, userId))
      .limit(1);

    if (utilisateur.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }

    const user = utilisateur[0];

    // ✅ Vérifie le mot de passe actuel
    const isValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe actuel incorrect.",
      });
    }

    // ✅ Hash le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(motDePasseNouveau, 12);

    // ✅ Met à jour en base de données
    await db
      .update(utilisateursTable)
      .set({ motDePasse: hashedPassword })
      .where(eq(utilisateursTable.id, userId));

    return res.json({
      success: true,
      message: "Mot de passe modifié avec succès.",
    });
  } catch (error) {
    console.error("Erreur changement password:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};