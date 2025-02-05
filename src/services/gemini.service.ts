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
    // First, handle bold text with **
    text = text.replace(/\*\*(.*?)\*\*/g, '<br><strong>$1</strong><br>');

    // Handle definition blocks
    text = text.replace(
      /\*\*Definition:\*\*(.*?)(?=\*\*|$)/g,
      '<div class="definition-block"><br><h3>Definition:</h3><br>$1<br></div>'
    );

    // Handle component lists
    text = text.replace(
      /\*\*Components:\*\*\s*\*(.*?)(?=\*\*|$)/gs,
      (match, content) => {
        const listItems = content
          .split('*')
          .filter((item: string) => item.trim())
          .map((item: string) => `<li>${item.trim()}</li>`)
          .join('');
        return `<div class="components-block">
          <br><h3>Components:</h3><br>
          <ul>${listItems}</ul><br>
        </div>`;
      }
    );

    // Handle other sections
    text = text.replace(
      /\*\*(.*?):\*\*\s*\*(.*?)(?=\*\*|$)/gs,
      (match, title, content) => {
        const listItems = content
          .split('*')
          .filter((item: string) => item.trim())
          .map((item: string) => `<li>${item.trim()}</li>`)
          .join('');
        return `<div class="section-block">
          <br><h3>${title}:</h3><br>
          <ul>${listItems}</ul><br>
        </div>`;
      }
    );

    return text;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Format text content
      text = this.formatResponse(text);

      // Format code blocks if present
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

    // Trigger Prism highlighting after adding code blocks
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
