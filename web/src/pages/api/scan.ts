import type { NextApiRequest, NextApiResponse } from "next";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod/v4";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const materialSchema = z.object({
  material: z
    .string()
    .describe("Specific material name, e.g. 'Douglas Fir 2x4 Lumber'"),
  category: z
    .enum([
      "lumber",
      "steel",
      "concrete",
      "brick",
      "glass",
      "pipe",
      "electrical",
      "fixtures",
    ])
    .describe("Best matching category"),
  condition: z
    .enum(["Excellent", "Good", "Fair", "Poor"])
    .describe("Assessed condition of the material"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence percentage of the identification"),
  suggestedPrice: z
    .string()
    .describe("Suggested resale price in USD, e.g. '$45'"),
  description: z
    .string()
    .describe(
      "Brief 1-2 sentence description of the material suitable for a marketplace listing",
    ),
  carbonSaved: z
    .number()
    .describe(
      "Estimated kg of CO2 saved by reusing this material instead of buying new",
    ),
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;

  if (!image || typeof image !== "string") {
    return res.status(400).json({ error: "Missing image data" });
  }

  try {
    const result = await generateText({
      model: openrouter.chat("google/gemini-3.1-flash-lite-preview"),
      output: Output.object({ schema: materialSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are a construction material identification expert for a surplus materials marketplace called ScrapYard. Analyze this image and identify the construction material shown. Provide detailed information including the specific material name, category, condition assessment, your confidence level, a suggested resale price, a brief marketplace description, and estimated CO2 savings from reusing instead of manufacturing new. Be specific and practical.",
            },
            {
              type: "image",
              image,
            },
          ],
        },
      ],
    });

    if (result.output) {
      return res.status(200).json(result.output);
    }

    return res.status(500).json({ error: "Failed to analyze material" });
  } catch (error) {
    console.error("Scan error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to analyze material",
    });
  }
}
