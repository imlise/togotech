// routes/ligneProduits.ts (or .js)
import { Router } from 'express';
import {
  createLigneProduit,
  getAllLigneProduits,
  getLigneProduitById,
  updateLigneProduit,
  deleteLigneProduit,
} from '../services/ligneProduit'; // adjust path as needed

const router = Router();

// GET all ligneProduits
router.get('/', async (req, res) => {
  try {
    const data = await getAllLigneProduits();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('GET /ligne-produits error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des lignes produit' });
  }
});

// GET one ligneProduit by ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'ID invalide' });
  }

  try {
    const data = await getLigneProduitById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Ligne produit non trouvée' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('GET /ligne-produits/:id error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la ligne produit' });
  }
});

// POST create a new ligneProduit
router.post('/', async (req, res) => {
  try {
    const result = await createLigneProduit(req.body);
    res.status(201).json({ success: true, message: result.message });
  } catch (error) {
    console.error('POST /ligne-produits error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la ligne produit' });
  }
});

// PUT update a ligneProduit by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'ID invalide' });
  }

  try {
    // Check if the record exists
    const existing = await getLigneProduitById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Ligne produit non trouvée' });
    }

    const result = await updateLigneProduit(id, req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('PUT /ligne-produits/:id error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la ligne produit' });
  }
});

// DELETE a ligneProduit by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'ID invalide' });
  }

  try {
    const existing = await getLigneProduitById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Ligne produit non trouvée' });
    }

    const result = await deleteLigneProduit(id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('DELETE /ligne-produits/:id error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la ligne produit' });
  }
});

export default router;