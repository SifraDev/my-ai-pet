import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from "@google/genai";
import { getPetById } from "./petData";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    try {
      const { petId, message, history } = req.body;

      if (!petId || !message) {
        return res.status(400).json({ error: "petId and message are required" });
      }

      const pet = getPetById(petId);
      if (!pet) {
        return res.status(400).json({ error: "Invalid petId" });
      }

      const characterContext = `You are ${pet.name}, a ${pet.species} on BNB Chain. Your personality: ${pet.personality} The user says: "${message}". Answer strictly in character. Do not be a generic assistant — BE the character. Keep it punchy, 2-3 sentences max.`;

      const rawHistory = (history || []).map((m: { role: string; content: string }) => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chatHistory = rawHistory.length > 0 && rawHistory[0].role === "model"
        ? rawHistory.slice(1)
        : rawHistory;

      const validHistory: { role: string; parts: { text: string }[] }[] = [];
      for (const entry of chatHistory) {
        const lastEntry = validHistory[validHistory.length - 1];
        if (lastEntry && lastEntry.role === entry.role) {
          lastEntry.parts[0].text += "\n" + entry.parts[0].text;
        } else {
          validHistory.push(entry);
        }
      }

      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === "user") {
        validHistory.pop();
      }

      const contents = [
        ...validHistory,
        { role: "user", parts: [{ text: characterContext }] },
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: { maxOutputTokens: 8192 },
      });

      for await (const chunk of stream) {
        const content = chunk.text || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Chat failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Chat failed" });
      }
    }
  });

  return httpServer;
}
