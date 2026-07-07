// routes/clients.ts

import express from "express";
import {
  createClient,
  getAllClients,
  getClientById,
  getClientByName,
  getClientByEmail,
  updateClient,
  deleteClient,
} from "../services/clients";

const router = express.Router();


// GET /api/clients
router.get("/", async (req, res) => {
  try {
    const clients = await getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des clients.",
      error,
    });
  }
});


// GET /api/clients/nom/:nom
router.get("/nom/:nom", async (req, res) => {
  try {
    const { nom } = req.params;

    const client = await getClientByName(nom);

    if (!client) {
      return res.status(404).json({
        message: "Client introuvable.",
      });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du client.",
      error,
    });
  }
});


// GET /api/clients/email/:email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const client = await getClientByEmail(email);

    if (!client) {
      return res.status(404).json({
        message: "Client introuvable.",
      });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du client.",
      error,
    });
  }
});


// GET /api/clients/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const client = await getClientById(id);

    if (!client) {
      return res.status(404).json({
        message: "Client introuvable.",
      });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du client.",
      error,
    });
  }
});


// POST /api/clients
router.post("/", async (req, res) => {
  try {
    const result = await createClient(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du client.",
      error,
    });
  }
});


// PUT /api/clients/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const result = await updateClient(id, req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du client.",
      error,
    });
  }
});


// DELETE /api/clients/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const result = await deleteClient(id);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du client.",
      error,
    });
  }
});

export default router;