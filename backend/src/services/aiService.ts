import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

const MODEL = 'llama-3.3-70b-versatile'
const VISION_MODEL = 'llama-3.2-11b-vision-preview'

interface AISummaryResult {
  summary: string
  importantPoints: string[]
  category: string
  confidence: number
}

interface EntityResult {
  people: string[]
  companies: string[]
  locations: string[]
  products: string[]
  amounts: string[]
  category: string
}

interface DateResult {
  date: string
  event: string
}

export const analyzeImage = async (imageBuffer: Buffer, mimeType: string): Promise<{
  summary: string
  description: string
  tags: string[]
  entities: EntityResult
}> => {
  try {
    const base64 = imageBuffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`

    const response = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a visual memory assistant. Analyze the image and return a JSON object with:
          - summary: a concise 2-sentence summary of what the image shows
          - description: a detailed description of the image contents
          - tags: array of 3-7 relevant keywords
          - entities: object with people, companies, locations, products, amounts arrays
          Return ONLY valid JSON. No markdown. No code fences. Just the raw JSON object.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image in detail.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ] as any,
        },
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content || '{}'
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      summary: parsed.summary || 'Image analyzed',
      description: parsed.description || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      entities: parsed.entities || { people: [], companies: [], locations: [], products: [], amounts: [], category: 'other' },
    }
  } catch (error) {
    console.error('AI image analysis error:', error)
    return {
      summary: 'Image analysis unavailable',
      description: '',
      tags: [],
      entities: { people: [], companies: [], locations: [], products: [], amounts: [], category: 'other' },
    }
  }
}

export const summarizeText = async (text: string): Promise<AISummaryResult> => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a memory analysis AI. Analyze the following text and return a JSON object with:
          - summary: a concise 2-sentence summary
          - importantPoints: array of key points
          - category: one of (document, finance, project, purchase, idea, personal, business, technical, other)
          - confidence: number 0-1
          Return ONLY valid JSON.`,
        },
        { role: 'user', content: text.substring(0, 10000) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    return JSON.parse(response.choices[0]?.message?.content || '{}') as AISummaryResult
  } catch (error) {
    console.error('AI summarization error:', error)
    return { summary: 'AI analysis unavailable', importantPoints: [], category: 'other', confidence: 0 }
  }
}

export const extractEntities = async (text: string): Promise<EntityResult> => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Extract entities from the text. Return a JSON object with:
          - people: array of person names
          - companies: array of company/organization names
          - locations: array of location names
          - products: array of product names
          - amounts: array of monetary amounts or quantities
          - category: one of (equipment, construction, service, purchase, legal, personal, other)
          Return ONLY valid JSON.`,
        },
        { role: 'user', content: text.substring(0, 10000) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    return JSON.parse(response.choices[0]?.message?.content || '{}') as EntityResult
  } catch (error) {
    console.error('AI entity extraction error:', error)
    return { people: [], companies: [], locations: [], products: [], amounts: [], category: 'other' }
  }
}

export const extractDates = async (text: string): Promise<DateResult[]> => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Extract all dates and their associated events from the text. Return a JSON array of objects with:
          - date: ISO date string (YYYY-MM-DD)
          - event: short description of what happened/is scheduled
          Return ONLY valid JSON array. If no dates found, return [].`,
        },
        { role: 'user', content: text.substring(0, 10000) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0]?.message?.content || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('AI date extraction error:', error)
    return []
  }
}

export const answerQuestion = async (question: string, context: string): Promise<{ answer: string; sources: string[] }> => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a personal knowledge assistant. Answer the user's question based on the provided context (their memories, documents, and notes).

          Rules:
          - Answer concisely and accurately
          - If you don't know, say so
          - Reference specific details from the context
          - Return JSON: { "answer": "your answer", "sources": ["source1", "source2"] }`,
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    return JSON.parse(response.choices[0]?.message?.content || '{}') as { answer: string; sources: string[] }
  } catch (error) {
    console.error('AI question answering error:', error)
    return { answer: 'AI assistant is currently unavailable.', sources: [] }
  }
}

export const generateTags = async (text: string): Promise<string[]> => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Generate 3-7 relevant tags for this content. Return a JSON array of lowercase single-word or two-word tags. Example: ["construction", "electricity", "expenses"]. Return ONLY valid JSON array.`,
        },
        { role: 'user', content: text.substring(0, 5000) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0]?.message?.content || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('AI tag generation error:', error)
    return []
  }
}

export const generateRelations = async (text: string, existingMemories: string[]): Promise<{ type: string; reason: string }[]> => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Given new content and a list of existing memory summaries, find connections between them. Return a JSON array of objects with:
          - type: "same_project" | "related_topic" | "financial" | "temporal" | "location"
          - reason: short explanation of the connection
          Return empty array if no connections found.`,
        },
        {
          role: 'user',
          content: `New content: ${text.substring(0, 3000)}\n\nExisting memories: ${existingMemories.join('\n')}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0]?.message?.content || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('AI relation generation error:', error)
    return []
  }
}
