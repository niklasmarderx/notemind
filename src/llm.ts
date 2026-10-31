import Anthropic from '@anthropic-ai/sdk';

export interface LlmProvider {
  readonly name: string;
  complete(prompt: string): Promise<string>;
}

/** Deterministic offline backend so notemind runs without an API key. */
export class StubProvider implements LlmProvider {
  readonly name = 'stub';
  async complete(prompt: string): Promise<string> {
    const preview = prompt.replace(/\s+/g, ' ').trim().slice(0, 160);
    return `[stub summary] ${preview}`;
  }
}

/** Real backend using Claude via the official Anthropic SDK. */
export class AnthropicProvider implements LlmProvider {
  readonly name = 'claude';
  private readonly client: Anthropic;
  constructor(apiKey: string, private readonly model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5') {
    this.client = new Anthropic({ apiKey });
  }
  async complete(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { text: string }).text)
      .join('\n');
  }
}

export function createProvider(env: NodeJS.ProcessEnv = process.env): LlmProvider {
  return env.ANTHROPIC_API_KEY ? new AnthropicProvider(env.ANTHROPIC_API_KEY) : new StubProvider();
}
