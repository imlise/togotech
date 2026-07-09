import express from "express";
import { db } from "../db/db";
import { produitsTable } from "../db/schema";
import { eq, InferInsertModel } from "drizzle-orm";
import { upload } from "../middlewares/uploads"; // adapte le chemin

const router = express.Router();


// CREATE (avec image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { nom, description, prixUnitaire } = req.body;

    const image = req.file ? req.file.filename : null;

    const result = await db.insert(produitsTable).values({
      nom,
      description,
      image,
      prixUnitaire: Number(prixUnitaire)
    }).returning().get();

    res.json(result);
  } catch (err) {
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Une erreur inconnue est survenue' });
  }
}
});


// READ ALL
router.get("/", async (req, res) => {
  const data = await db.select().from(produitsTable);
  res.json(data);
});


// READ ONE
router.get("/:id", async (req, res) => {
  const data = await db
    .select()
    .from(produitsTable)
    .where(eq(produitsTable.id, Number(req.params.id))).get();

    if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});


// UPDATE

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. récupérer produit actuel
    const produit = await db
      .select()
      .from(produitsTable)
      .where(eq(produitsTable.id, id))
      .get();

    if (!produit) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    const { nom, description, prixUnitaire } = req.body;

    const updateData: Partial<InferInsertModel<typeof produitsTable>> = {
  nom,
  description,
  prixUnitaire: Number(prixUnitaire)
};

    // 2. si nouvelle image
    if (req.file) {

      // supprimer ancienne image
      if (produit.image) {
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(produit.image)
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // ajouter nouvelle image
      updateData.image = req.file.filename;
    }

    // 3. update DB
    const updated = await db
      .update(produitsTable)
      .set(updateData)
      .where(eq(produitsTable.id, id))
      .returning()
      .get();

    res.json(updated);

  } catch (err) {
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Une erreur inconnue est survenue' });
  }}
});

// DELETE
import fs from "fs";
import path from "path";

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. récupérer le produit
    const produit = await db
      .select()
      .from(produitsTable)
      .where(eq(produitsTable.id, id))
      .get();

    if (!produit) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    // 2. supprimer l'image si elle existe
    if (produit.image) {
      const imagePath = path.join(process.cwd(), "uploads", produit.image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 3. supprimer en base
    await db
      .delete(produitsTable)
      .where(eq(produitsTable.id, id));

    res.json({ success: true });

  }  catch (err) {
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Une erreur inconnue est survenue' });
  }}
});

export default router;