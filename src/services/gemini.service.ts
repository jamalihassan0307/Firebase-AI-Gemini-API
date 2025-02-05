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

    // Format sections
    text = text.replace(
      /\*\*([A-Z])\. (.*?)\*\*/g,
      '<div class="topic-section">\n<div class="topic-header">$1. $2</div>\n<div class="topic-content">'
    );

    // Format complete bold lines
    text = text.replace(
      /^\*\*(.*?)\*\*$/gm,
      '<div class="highlight-line">$1</div>'
    );

    // Format inline bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');

    // Format bullet points
    text = text.replace(
      /- (.*?)(?=\n|$)/g,
      '<div class="topic-point"><span class="bullet">•</span><span class="point-text">$1</span></div>'
    );

    // Close sections
    text = text.replace(/(?=\*\*[A-Z]\.|$)/g, '</div></div>');

    return `<div class="topic-container">${text}</div>`;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      // Special handling for greetings
      if (prompt.toLowerCase().match(/^(hi|hello|hey|greetings)$/)) {
        return this.formatGuidelines();
      }

      // Dynamically structure the prompt based on the type of query
      const enhancedPrompt = `
### Response Guidelines

Please generate a response that is **clear, concise, and well-structured** based on the user's query. Follow the structured format below:

---

## **1. General Text Responses**
- Keep explanations **concise** (5-10 lines).
- Use **bold formatting** for key terms (e.g., **important concept**).
- Use bullet points for clarity.
- Keep the response **directly relevant** to the query.

---

## **2. Code Responses**
- Provide **working, minimal** code examples.
- Format code properly using triple backticks (\`\`\`) and a **language identifier**.
- Include **brief, meaningful comments**.
- Ensure **modern coding practices** are followed.
- Keep examples **within 20 lines** unless essential.

**Example Format:**
\`\`\`javascript
// Function to add two numbers
function add(a, b) {
    return a + b;
}
console.log(add(2, 3)); // Output: 5
\`\`\`

---

## **3. Technical Explanations**
For technical topics, structure responses as follows:

### **A. Definition & Overview**
- Provide a **one-line definition**.
- Include a **brief explanation** with key points.

### **B. Practical Use Cases**
- List **real-world applications**.
- Mention **common scenarios**.

### **C. Key Considerations & Best Practices**
- Highlight **important factors** (e.g., performance, security, optimization).

### **D. Example Code (if applicable)**
- Include a **concise snippet** demonstrating the concept.

**Example Format:**
**What is Debouncing in JavaScript?**
Debouncing limits function execution frequency to prevent excessive calls.

**Use Case:** Useful for handling **window resize events, input typing, and scroll listeners**.

\`\`\`javascript
// Debounce function to limit execution rate
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Example: Delayed search input
const search = debounce((query) => console.log("Searching:", query), 300);
document.getElementById("searchInput").addEventListener("input", (e) => search(e.target.value));
\`\`\`

---

## **4. Troubleshooting & Debugging**
If the query involves **error messages or debugging**, use this structure:

- **A. Identify the Issue**: Explain possible causes.
- **B. Step-by-Step Fix**: Provide a structured solution.
- **C. Best Practices**: Recommend improvements.
- **D. Corrected Code (if applicable)**.

---

## **5. Comparison Analysis**
For comparison-based queries, follow this structure:

- **A. Brief Overview**: Introduce the topics.
- **B. Key Differences Table**: Present differences clearly.
- **C. When to Use Each**: Explain use cases.
- **D. Performance & Scalability Considerations**.

**Example:**
| Feature       | SQL (Relational) | NoSQL (Non-Relational) |
|--------------|----------------|------------------|
| **Structure** | Tables, Rows   | Key-Value, Document, Graph |
| **Flexibility** | Fixed schema  | Dynamic schema |
| **Scalability** | Vertical Scaling | Horizontal Scaling |
| **Best For** | Structured data | Unstructured data |

---

## **6. Formatting Guidelines**
- Use bullet points and tables for clarity.
- Ensure **technical accuracy**.
- Keep responses **engaging and practical**.

---

### **User Query:**
${prompt}
        `;

      // Fetch the response from the AI model
      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      let text = response.text();

      // Format text for better readability
      text = this.formatResponse(text);

      // Format code blocks for correct rendering
      text = this.formatCodeBlocks(text);

      return text;
    } catch (error) {
      console.error('Error generating response:', error);

      // Provide detailed error message
      throw new Error(
        error instanceof Error
          ? `AI Model Error: ${error.message}`
          : 'An unknown error occurred while generating the response.'
      );
    }
  }

  private formatCodeBlocks(text: string): string {
    if (!text) return '';

    return text.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (_match, language, code) => `
      <div class="code-block">
        <div class="code-header">
          <span class="language">${language || 'plaintext'}</span>
          <button class="copy-button" onclick="copyCode(this)">Copy Code</button>
        </div>
        <pre><code class="language-${
          language || 'plaintext'
        }">${this.escapeHtml(code)}</code></pre>
      </div>
    `
    );
  }

  private escapeHtml(text: string): string {
    if (!text) return '';

    return text.replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[char] || char)
    );
  }

  private formatGuidelines(): string {
    return `
      <div class="guidelines-container">
        <div class="guidelines-section">
          <h3>Privacy & Guidelines</h3>
          <div class="guidelines-content">
            <div class="guideline-item">
              <span class="guideline-icon">🔒</span>
              <div class="guideline-text">
                <strong>Privacy First:</strong>
                Your conversations are not stored beyond the current session.
              </div>
            </div>
            <div class="guideline-item">
              <span class="guideline-icon">✓</span>
              <div class="guideline-text">
                <strong>Safe & Accurate:</strong>
                We provide helpful and factual responses, but please verify sensitive information.
              </div>
            </div>
            <div class="guideline-item">
              <span class="guideline-icon">📚</span>
              <div class="guideline-text">
                <strong>Comprehensive Support:</strong>
                Expect detailed, well-structured answers to your questions.
              </div>
            </div>
            <div class="guideline-item">
              <span class="guideline-icon">🛡️</span>
              <div class="guideline-text">
                <strong>Safe Content:</strong>
                We maintain a respectful environment and avoid harmful content.
              </div>
            </div>
            <div class="guideline-item">
              <span class="guideline-icon">👨‍⚕️</span>
              <div class="guideline-text">
                <strong>Professional Advice:</strong>
                For medical, legal, or psychological matters, please consult qualified professionals.
              </div>
            </div>
          </div>
          
          <div class="demo-commands">
            <h4>Try These Commands:</h4>
            <div class="command-list">
              <div class="command-item">
                <span class="command-bullet">•</span>
                <code>explain promises in javascript</code>
                <span class="command-hint">Get detailed technical explanations</span>
              </div>
              <div class="command-item">
                <span class="command-bullet">•</span>
                <code>how to implement debounce</code>
                <span class="command-hint">Learn common programming patterns</span>
              </div>
              <div class="command-item">
                <span class="command-bullet">•</span>
                <code>compare sql vs nosql</code>
                <span class="command-hint">See technology comparisons</span>
              </div>
              <div class="command-item">
                <span class="command-bullet">•</span>
                <code>debug react useEffect</code>
                <span class="command-hint">Get troubleshooting help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
