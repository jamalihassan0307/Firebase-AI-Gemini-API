import { GeminiService } from '../services/gemini.service';
import { StorageService } from '../services/storage.service';
import { Chat, Message } from '../types/chat.types';

export class ChatComponent {
  private geminiService: GeminiService;
  private storageService: StorageService;
  private currentChat: Chat | null = null;
  private messagesContainer: HTMLElement;
  private messageInput: HTMLTextAreaElement;
  private chatHistory: HTMLElement;

  constructor() {
    this.geminiService = new GeminiService();
    this.storageService = new StorageService();
    this.messagesContainer = document.getElementById(
      'chat-messages'
    ) as HTMLElement;
    this.messageInput = document.getElementById(
      'message-input'
    ) as HTMLTextAreaElement;
    this.chatHistory = document.querySelector('.chat-history') as HTMLElement;

    this.initializeEventListeners();
    this.loadChats();
  }

  private initializeEventListeners(): void {
    document
      .getElementById('send-button')
      ?.addEventListener('click', () => this.handleSend());

    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    document
      .querySelector('.new-chat')
      ?.addEventListener('click', () => this.createNewChat());

    // Auto-resize textarea
    this.messageInput.addEventListener('input', () => {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    });
  }

  private async loadChats(): Promise<void> {
    const chats = this.storageService.getAllChats();
    this.renderChatHistory(chats);

    if (chats.length > 0) {
      await this.loadChat(chats[chats.length - 1].id);
    }
  }

  private renderChatHistory(chats: Chat[]): void {
    this.chatHistory.innerHTML = '';

    chats.forEach((chat) => {
      const chatElement = document.createElement('div');
      chatElement.className = `chat-history-item${
        chat.id === this.currentChat?.id ? ' active' : ''
      }`;

      const title =
        chat.messages.length > 0
          ? chat.messages[0].content.slice(0, 30) + '...'
          : 'New Chat';

      chatElement.innerHTML = `
        <svg stroke="currentColor" fill="none" viewBox="0 0 24 24">
          <path d="M8 10h8M8 14h4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke-width="1.5"/>
        </svg>
        <span>${title}</span>
      `;

      chatElement.addEventListener('click', () => this.loadChat(chat.id));
      this.chatHistory.appendChild(chatElement);
    });
  }

  private async loadChat(chatId: string): Promise<void> {
    const chat = this.storageService.getChatById(chatId);
    if (!chat) return;

    this.currentChat = chat;
    this.renderMessages();
    this.updateActiveChatInHistory();
  }

  private updateActiveChatInHistory(): void {
    const items = this.chatHistory.querySelectorAll('.chat-history-item');
    items.forEach((item) => item.classList.remove('active'));

    if (this.currentChat) {
      const activeItem = Array.from(items).find((item) =>
        item.textContent?.includes(
          this.currentChat!.messages[0]?.content.slice(0, 30) || 'New Chat'
        )
      );
      activeItem?.classList.add('active');
    }
  }

  private async handleSend(): Promise<void> {
    const content = this.messageInput.value.trim();
    if (!content) return;

    try {
      await this.sendMessage(content);
      this.messageInput.value = '';
      this.messageInput.style.height = 'auto';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private renderMessage(message: Message): void {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}`;

    messageElement.innerHTML = `
      <div class="avatar">${message.role === 'user' ? 'U' : 'A'}</div>
      <div class="content">${message.content}</div>
    `;

    this.messagesContainer.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: 'smooth' });
  }

  private renderMessages(): void {
    if (!this.currentChat) return;

    this.messagesContainer.innerHTML = '';
    this.currentChat.messages.forEach((message) => this.renderMessage(message));
  }

  async createNewChat(): Promise<void> {
    this.currentChat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.storageService.saveChat(this.currentChat);
    this.renderMessages();
    this.loadChats(); // Refresh chat history
    this.messageInput.focus();
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.currentChat) {
      await this.createNewChat();
    }

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    this.currentChat!.messages.push(userMessage);
    this.renderMessage(userMessage);

    try {
      const response = await this.geminiService.generateResponse(content);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      this.currentChat!.messages.push(assistantMessage);
      this.renderMessage(assistantMessage);
      this.storageService.saveChat(this.currentChat!);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}
