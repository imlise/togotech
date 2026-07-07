import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import facturesRouter from "./routes/factures";
import produitsRouter from "./routes/produits"
import clientsRouter from "./routes/clients"
import utilisateursRouter from "./routes/utilisateurs"
import loginRouter from "./routes/login"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsPath = path.join(__dirname, "..", "assets"); // Construit le chemin vers le dossier ../assets depuis src/

app.use("/assets", express.static(assetsPath));

// fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api/factures", facturesRouter);
app.use("/api/produits", produitsRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/utilisateurs", utilisateursRouter);
app.use("/api/login", loginRouter);


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
});