import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";
import Perspective from "perspective-api-client";

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Permite llamadas desde la extensión

// Usa variables de entorno para mayor seguridad
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE_KEY });

// Función de timeout para fetch
async function fetchWithTimeout(url, options, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

app.post("/analizar", async (req, res) => {
  try {
    const texto = req.body.texto;
    if (!texto) return res.status(400).json({ error: "Texto no proporcionado" });

    // --- Gemini ---
    const prompt = `
Analiza el siguiente texto y responde solo en JSON con las siguientes claves:
- riesgo: "alto", "medio" o "bajo"
- motivo: breve explicación en español
- consejos: una lista de consejos prácticos para protegerse, en español
- sentimiento: "positivo", "neutral" o "negativo"
- intencion: breve descripción de la intención del mensaje
Texto: "${texto}"
`;

    let geminiResult = {};
    try {
      const geminiResponse = await fetchWithTimeout(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const geminiData = await geminiResponse.json();
      console.log("Respuesta cruda de Gemini:", JSON.stringify(geminiData, null, 2));

      // ✅ Ajuste de parseo según Gemini 2.0
      const geminiOutput = geminiData.candidates?.[0]?.content?.[0]?.text || "{}";
      geminiResult = JSON.parse(geminiOutput);
    } catch (err) {
      console.warn("Gemini falló o retornó JSON inválido:", err);
      geminiResult = { riesgo: "desconocido", motivo: "Error al analizar con Gemini", consejos: [], sentimiento: "neutral", intencion: "desconocida" };
    }

    // --- Perspective ---
    let perspectiveResult = {};
    let alerta = false;
    try {
      const resp = await perspective.analyze(texto, {
        attributes: [
            "TOXICITY", 
            "INSULT", 
            "THREAT", 
            "PROFANITY",
            "IDENTITY_ATTACK"
        ],
        doNotStore: true
      });
      perspectiveResult = resp;
      console.log("✅ Perspective respondió:", JSON.stringify(resp, null, 2));

      // Definir alerta si TOXICITY > 0.7
      if (resp.attributeScores?.TOXICITY?.summaryScore?.value > 0.7) {
        alerta = true;
      }
    } catch (err) {
      console.warn("Perspective falló:", err);
    }

    // --- Resultado final ---
    const resultadoFinal = {
      gemini: geminiResult,
      perspective: perspectiveResult,
      alerta
    };

    res.json({ resultado: resultadoFinal });
  } catch (error) {
    console.error("Error en /analizar:", error);
    res.status(500).json({ error: "Error al analizar el texto" });
  }
});

app.listen(3000, () => console.log("✅ Servidor corriendo en http://localhost:3000"));
