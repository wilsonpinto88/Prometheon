import OpenAI from 'openai'
import type { AIProvider, ChatMessage } from './provider.js'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content
      if (text) yield text
    }
  }
}
