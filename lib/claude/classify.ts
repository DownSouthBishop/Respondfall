interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function classifyIntent(
  businessName: string,
  bookingLink: string,
  history: Message[]
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are a friendly, professional AI assistant for ${businessName}. You handle missed call follow-up via SMS.

Your job:
1. Qualify leads and answer questions about the business's services
2. Guide interested customers toward booking: ${bookingLink || 'contact the business directly'}
3. Keep responses SHORT — 1-3 sentences max. This is SMS.
4. Be warm and professional. Never pretend to be human.
5. If someone is ready to book, share the booking link.

Respond in plain text only. No markdown, no bullet points.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: systemPrompt,
      messages: history,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.content?.[0]?.text ?? null;
}
