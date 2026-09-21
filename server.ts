import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini lazily
  let genAI: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!genAI && process.env.GEMINI_API_KEY) {
      try {
        genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      } catch (err) {
        console.warn('Failed to initialize Gemini client:', err);
      }
    }
    return genAI;
  }

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AXA AI Insurance Sales Agent Demo Engine',
      hasGemini: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side AI Chat endpoint
  app.post('/api/chat', async (req, res) => {
    const { message, stage, primaryNeed, customerProfile } = req.body;

    const gemini = getGeminiClient();

    if (gemini && process.env.GEMINI_API_KEY) {
      const systemInstruction = `You are the official AXA AI Insurance Sales Assistant (Demo Environment).
STRICT COMPLIANCE RULES:
1. NEVER fabricate or promise a specific numerical premium (e.g. "₱2,500/mo guaranteed"). State that official premiums depend on exact age, gender, sum insured, and authorized illustration systems.
2. NEVER guarantee returns on Unit-Linked (VUL) funds or imply risk-free market growth.
3. NEVER promise guaranteed medical underwriting approval.
4. Keep answers clear, empathetic, and professional in a premium financial services tone.
5. Emphasize that in this demo, authorized AXA advisors verify final eligibility and official illustrations.
6. The designated licensed insurance advisor for this demo is Bishop Orly B. Languisan (Mobile: +63 968 647 1868). When referring to an advisor or when human escalation is appropriate (e.g. medical conditions, formal illustrations, explicit requests for an advisor), identify Bishop Orly B. Languisan. Do not invent any email or credentials not provided.
Customer profile: Primary need is "${primaryNeed || 'Critical Illness'}", stage is "${stage || 'NEEDS_DISCOVERY'}".
Customer context: ${JSON.stringify(customerProfile || {})}`;

      // Cascade of allowed free models from Gemini SDK
      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      for (const modelName of candidateModels) {
        // Try up to 2 attempts per model with a short backoff for transient 503/429/UNAVAILABLE errors
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const response = await gemini.models.generateContent({
              model: modelName,
              contents: message || 'Hello',
              config: {
                systemInstruction,
                temperature: 0.4,
                maxOutputTokens: 600,
              },
            });

            const replyText = response.text?.trim() || '';
            if (replyText) {
              return res.json({
                reply: replyText,
                source: 'gemini',
                model: modelName,
              });
            }
          } catch (err: unknown) {
            const errObj = err as Record<string, unknown> | undefined;
            const status = (errObj?.status as string) || (errObj?.code as string | number) || '';
            const msg = (errObj?.message as string) || String(err);
            const isTransient =
              status === 503 ||
              status === '503' ||
              status === 429 ||
              status === '429' ||
              status === 'UNAVAILABLE' ||
              msg.includes('high demand') ||
              msg.includes('temporarily') ||
              msg.includes('ResourceExhausted');

            if (isTransient && attempt === 1) {
              // Wait briefly and retry once
              await new Promise((resolve) => setTimeout(resolve, 350));
              continue;
            }

            // Move to next candidate model
            console.log(`[Gemini Chat] Model ${modelName} unavailable (${status || 'busy'}). Checking next candidate model...`);
            break;
          }
        }
      }

      console.log('[Gemini Chat] External AI models currently at peak demand. Seamlessly engaging local rules engine.');
    }

    // Fallback to local orchestrator if no key or all remote models busy
    return res.json({
      reply: null,
      source: 'local_orchestrator',
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AXA AI Sales Agent running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
