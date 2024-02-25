import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
})

export const POST: APIRoute = async ({ request }) => {
  const { text, language } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        "role": "system",
        "content": `You will be provided with a sentence in English, and your task is to translate it into ${language}.`
      },
      {
        "role": "user",
        "content": text
      }
    ],
    temperature: 0.7,
    max_tokens: 64,
    top_p: 1,
  });

  return new Response(
    JSON.stringify({
      text: response.choices[0].message.content
    })
  )
}