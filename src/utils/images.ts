import fs from "fs/promises";
import path from "path";



const TAILLE_MAX_IMAGE = 2 * 1024 * 1024; // 2 Mo

const EXTENSIONS_AUTORISEES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
];


export async function enregistrerImage(
  cheminSource: string
): Promise<string> {


// Verification
await fs.access(cheminSource);
const extension = path.extname(cheminSource).toLowerCase();

if (!EXTENSIONS_AUTORISEES.includes(extension)) {
    throw new Error(
        `Extension non autorisée : ${extension}`
    );
}
const statistiques = await fs.stat(cheminSource);

if (statistiques.size > TAILLE_MAX_IMAGE) {
    throw new Error(
        "L'image dépasse la taille maximale de 2 Mo."
    );
}
// Verification






  // Nom du fichier
  const nomOriginal = path.basename(cheminSource);

  // Nom unique
  const nomUnique = `${Date.now()}-${nomOriginal}`;

  // Dossier des images
  const dossierDestination = path.join(
    process.cwd(),
    "assets",
    "images"
  );

  // ✅ Crée le dossier s'il n'existe pas
  await fs.mkdir(dossierDestination, {
    recursive: true,
  });

  // Chemin final
  const cheminDestination = path.join(
    dossierDestination,
    nomUnique
  );

  // Copier l'image
  await fs.copyFile(
    cheminSource,
    cheminDestination
  );

  // Retourner le chemin enregistré en base
  return `images/${nomUnique}`;
}


export async function supprimerImage(
    cheminRelatif: string
) {

    const cheminComplet = path.join(
        process.cwd(),
        "assets",
        cheminRelatif
    );

    try {

        await fs.unlink(cheminComplet);

    } catch {

        // L'image n'existe pas.
        // On ignore simplement l'erreur.

    }

}



export async function remplacerImage(
    ancienneImage: string,
    nouvelleImage: string
): Promise<string> {
    // Verification
await fs.access(nouvelleImage);
const extension = path.extname(nouvelleImage).toLowerCase();

if (!EXTENSIONS_AUTORISEES.includes(extension)) {
    throw new Error(
        `Extension non autorisée : ${extension}`
    );
}
const statistiques = await fs.stat(nouvelleImage);

if (statistiques.size > TAILLE_MAX_IMAGE) {
    throw new Error(
        "L'image dépasse la taille maximale de 2 Mo."
    );
}
// Verification


    // Copier la nouvelle image
    const nouveauChemin = await enregistrerImage(nouvelleImage);

    // Supprimer l'ancienne
    await supprimerImage(ancienneImage);

    // Retourner le nouveau chemin
    return nouveauChemin;
}