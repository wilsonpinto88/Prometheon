import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, ChatMessage } from './provider.js'

export class ClaudeProvider implements AIProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text
      }
    }
  }
}
