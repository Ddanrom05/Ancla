import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Permite llamadas desde la extensión

const GEMINI_API_KEY = "TU_API_KEY_AQUI";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

app.post("/analizar", async (req, res) => {
  try {
    const { texto } = req.body;

    const prompt = `
Analiza el siguiente texto y responde solo en JSON:
- riesgo: "alto", "medio" o "bajo"
- motivo: breve explicación en español
Texto: "${texto}"
`;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    res.json({ resultado: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al analizar el texto" });
  }
});

app.listen(3000, () => console.log("✅ Servidor corriendo en http://localhost:3000"));
