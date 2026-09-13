// Example serverless endpoint for Vercel, Netlify, or a similar Node-compatible host.
// Keep OPENAI_API_KEY in the host's environment settings; it must never reach the browser.
import persona from '../advisor-persona.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const messages = Array.isArray(request.body?.messages) ? request.body.messages.slice(-8) : [];
  if (!messages.length) return response.status(400).json({ error: 'A message is required' });
  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5', instructions: persona, input: messages, store: false, text: { verbosity: 'low' } })
    });
    if (!apiResponse.ok) throw new Error('OpenAI request failed');
    const result = await apiResponse.json();
    return response.status(200).json({ reply: result.output_text || 'I’m sorry, I could not form a useful response just now.' });
  } catch (error) { return response.status(500).json({ error: 'The advisor is temporarily unavailable.' }); }
}
