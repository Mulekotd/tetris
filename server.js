import express from "express";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/src", express.static(path.join(__dirname, "src")));

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "index.html")));

const PORT = 4173;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
