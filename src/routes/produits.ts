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
    const { nom, description, prixUnitaire } = req.body;

    const updateData: Partial<InferInsertModel<typeof produitsTable>> = {
  nom,
  description,
  prixUnitaire: Number(prixUnitaire)
};

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const result = await db
      .update(produitsTable)
      .set(updateData)
      .where(eq(produitsTable.id, Number(req.params.id)))
      .returning();

    res.json(result[0]);
  }  catch (err) {
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Une erreur inconnue est survenue' });
  }}
});


// DELETE
router.delete("/:id", async (req, res) => {
  await db
    .delete(produitsTable)
    .where(eq(produitsTable.id, Number(req.params.id)));

  res.json({ success: true });
});

export default router;