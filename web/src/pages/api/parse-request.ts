import type { NextApiRequest, NextApiResponse } from 'next'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, Output } from 'ai'
import { z } from 'zod/v4'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const requestSchema = z.object({
  title: z
    .string()
    .describe(
      'A clear, concise title for the material request, e.g. "50 red bricks for garden wall"',
    ),
  category: z
    .enum([
      'lumber',
      'steel',
      'concrete',
      'brick',
      'glass',
      'pipe',
      'electrical',
      'fixtures',
      'other',
    ])
    .describe('Best matching category. Use "other" for non-construction items like furniture, appliances, tools, decor, etc.'),
  quantity: z
    .number()
    .describe(
      'The numeric quantity of items requested. Extract from the message, e.g. "50 bricks" => 50, "a few planks" => 5, "some lumber for decking" => 10. Always provide a reasonable estimate.',
    ),
  unit: z
    .string()
    .describe(
      'The unit of measurement, e.g. "pcs", "kg", "meters", "sheets", "bags", "boxes". Default to "pcs" if unclear.',
    ),
  budget: z
    .string()
    .describe(
      'Estimated budget as a string, e.g. "$100-200" or "Under $500". If not mentioned, return "Flexible".',
    ),
  urgency: z
    .enum(['Urgent', 'This week', 'Flexible'])
    .describe(
      'How urgently the requester needs the materials. Default to "Flexible" if not specified.',
    ),
  reply: z
    .string()
    .describe(
      'A brief, friendly 1-sentence confirmation message to the user summarizing what you understood including the quantity, e.g. "Got it — looking for ~50 red bricks for a garden wall, flexible budget."',
    ),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' })
  }

  try {
    const result = await generateText({
      model: openrouter.chat('google/gemini-3.1-flash-lite-preview'),
      output: Output.object({ schema: requestSchema }),
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant for ScrapYard, a surplus materials marketplace. The user is describing what items they need — these can be construction materials, furniture, appliances, tools, or any reusable item. Extract the structured request data from their message. Use "other" as the category for non-construction items. Be practical and specific with the title. If they mention a budget, format it as a range like "$100-200". If they mention urgency or a deadline, set urgency accordingly. Always write a friendly, brief reply confirming what you understood.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    if (result.output) {
      return res.status(200).json(result.output)
    }

    return res.status(500).json({ error: 'Failed to parse request' })
  } catch (error) {
    console.error('Parse request error:', error)
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to parse request',
    })
  }
}
