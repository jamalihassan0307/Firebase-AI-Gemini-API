import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../environment';

declare global {
  interface Window {
    Prism: any;
  }
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.gemini_api_key);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  private formatResponse(text: string): string {
    if (!text) return '';

    // Handle bold text (**bold**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle italic text (*italic*)
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle definition blocks
    text = text.replace(
      /\*\*Definition:\*\*(.*?)(?=\n|$)/gs,
      '<div class="definition-block"><h3>Definition:</h3><p>$1</p></div>'
    );

    // Handle sections with lists
    text = text.replace(
      /\*\*(.*?):\*\*\s*\*(.*?)(?=\*\*|$)/gs,
      (_match: string, title: string, content: string) => {
        const listItems = content
          .split('*')
          .filter((item: string) => item.trim())
          .map((item: string) => `<li>${item.trim()}</li>`)
          .join('');
        return `<div class="section-block">
          <h3>${title}:</h3>
          <ul>${listItems}</ul>
        </div>`;
      }
    );

    return text;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const enhancedPrompt = `
Please provide a clear and structured response following these guidelines:

1. Start with a Definition:
- One clear, concise sentence explaining the concept
- Bold key terms using **term**

2. Main Points (2-3 only):
- Focus on essential information
- Use bullet points for clarity
- Keep each point to one line

3. Practical Examples:
- Give 1-2 real-world examples
- Keep examples relevant and simple

4. Code Example (if relevant):
- Use proper formatting: \`\`\`language
- Keep code under 10 lines
- Include brief comments
- Show practical usage

5. Response Format:
**Definition:**
[Your one-line definition]

**Key Points:**
• [First key point]
• [Second key point]
• [Third key point]

**Examples:**
• [First example]
• [Second example]

**Code Sample:**
\`\`\`[language]
[Your concise code example]
\`\`\`

User Query: ${prompt}
`;

      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      let text = response.text();

      text = this.formatResponse(text);
      text = this.formatCodeBlocks(text);

      return text;
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
      throw error;
    }
  }

  private formatCodeBlocks(text: string): string {
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    let formattedText = text;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1];
      const code = match[2].trim();

      const formattedBlock = `
<div class="code-block">
  <div class="code-header">
    <span class="language">${language}</span>
    <button class="copy-button" onclick="copyCode(this)">Copy Code</button>
  </div>
  <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
</div>`;

      formattedText = formattedText.replace(match[0], formattedBlock);
    }

    setTimeout(() => {
      if (typeof window !== 'undefined' && window.Prism) {
        window.Prism.highlightAll();
      }
    }, 0);

    return formattedText;
  }

  private escapeHtml(text: string): string {
    const entities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => entities[char]);
  }
}
