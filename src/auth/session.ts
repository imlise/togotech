import { utilisateursTable } from "../db/schema";

type Utilisateur = typeof utilisateursTable.$inferSelect;

let utilisateurConnecte: Utilisateur | null = null;

export function ouvrirSession(
    utilisateur: Utilisateur
) {
    utilisateurConnecte = utilisateur;
}

export function fermerSession() {
    utilisateurConnecte = null;
}

export function getUtilisateurConnecte() {
    return utilisateurConnecte
        ? { ...utilisateurConnecte }
        : null;
}

export function estConnecte() {
    return utilisateurConnecte !== null;
}