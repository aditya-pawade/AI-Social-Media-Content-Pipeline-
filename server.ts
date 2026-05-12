import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDtp4hNFcxhX2X7MRmV9owaE1WBV4zUPj4";
  const ai = new GoogleGenAI({ apiKey });

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generateStream", async (req, res) => {
    try {
      const { workspace, platform, topic, generateImage } = req.body;
      
      const systemInstruction = `You are an expert social media marketer and content pipeline creator.
You are generating content for the following brand/workspace:
- Brand Name: ${workspace.name}
- Industry: ${workspace.industry || 'Not specified'}
- Target Audience: ${workspace.targetAudience || 'Not specified'}
- Tone: ${workspace.tone || 'Professional'}

Target Platform: ${platform}
Topic: ${topic}

Respond ONLY with the final post content. Do not include introductory or concluding conversational text. Include emojis and hashtags where appropriate for the platform. For Twitter threads, separate tweets with "---".`;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-flash-latest',
        contents: topic,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      let fullText = "";
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          res.write(`data: ${JSON.stringify({ textChunk: chunk.text })}\n\n`);
        }
      }
      
      let imageUrl = null;
      if (generateImage) {
        const imagePromptRes = await ai.models.generateContent({
           model: 'gemini-flash-latest',
           contents: `Generate a concise, descriptive image generation prompt (max 30 words) for a social media poster/graphic based on this text:\n\n${fullText}\n\nThe style should fit a ${workspace.industry} brand with a ${workspace.tone} tone.`,
        });
        const imagePrompt = imagePromptRes.text;
        try {
          imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt || 'Professional social media background graphic')}?width=1024&height=1024&nologo=true`;
          res.write(`data: ${JSON.stringify({ imageUrl })}\n\n`);
        } catch (imgError) {
          console.error("Image gen error:", imgError);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error('Error generating content stream:', error);
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate content' })}\n\n`);
      res.end();
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite not found or failed to load. Falling back to static serving.", e);
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Notice how Express 4 handles catch-all vs Express 5.
    // Using simple approach suitable for both if avoiding *all syntax for v4 or specific router syntax.
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
