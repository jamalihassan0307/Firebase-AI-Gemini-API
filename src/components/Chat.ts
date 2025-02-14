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

    this.setupMobileMenu();
    this.initializeEventListeners();
    this.loadChats();
  }

  private setupMobileMenu(): void {
    const menuToggle = document.getElementById('menuToggle');
    const navBar = document.querySelector('.nav-bar');
    const sidebar = document.querySelector('.sidebar');

    menuToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      navBar?.classList.toggle('mobile-menu-open');
      sidebar?.classList.toggle('active');
    });

    // Close menu and sidebar when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-bar') && !target.closest('.sidebar')) {
        navBar?.classList.remove('mobile-menu-open');
        sidebar?.classList.remove('active');
      }
    });
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

      chatElement.innerHTML = `
        <div class="chat-item-content">
          <input 
            type="text" 
            class="chat-title-input" 
            value="${chat.title}"
            ${chat.id === this.currentChat?.id ? 'autofocus' : ''}
          >
          <button class="delete-chat" title="Delete chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      `;

      // Add event listeners
      const titleInput = chatElement.querySelector(
        '.chat-title-input'
      ) as HTMLInputElement;
      const deleteBtn = chatElement.querySelector(
        '.delete-chat'
      ) as HTMLButtonElement;

      titleInput.addEventListener('change', (e) => {
        const newTitle = (e.target as HTMLInputElement).value.trim();
        this.updateChatTitle(chat.id, newTitle);
      });

      titleInput.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent chat selection when clicking input
      });

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteChat(chat.id);
      });

      chatElement.addEventListener('click', () => this.loadChat(chat.id));
      this.chatHistory.appendChild(chatElement);
    });
  }

  private updateChatTitle(chatId: string, newTitle: string): void {
    const chat = this.storageService.getChatById(chatId);
    if (chat) {
      chat.title = newTitle || 'Untitled Chat';
      this.storageService.saveChat(chat);
      this.loadChats();
    }
  }

  private async deleteChat(chatId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this chat?')) {
      this.storageService.deleteChat(chatId);

      if (this.currentChat?.id === chatId) {
        this.currentChat = null;
        this.renderMessages();
      }

      await this.loadChats();
    }
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

  private renderWelcomeMessage(): void {
    const welcomeHtml = `
      <div class="welcome-message">
        <h1>Gemini AI Chat</h1>
        <p>How can I help you today?</p>
        
        <div class="guidelines">
          <h2>Privacy & Guidelines</h2>
          <ul>
            <li>
              <strong>Privacy First:</strong> Your conversations are not stored beyond the current session.
            </li>
            <li>
              <strong>Safe & Accurate:</strong> We provide helpful and factual responses, but please verify sensitive information.
            </li>
            <li>
              <strong>Comprehensive Support:</strong> Expect detailed, well-structured answers to your questions.
            </li>
            <li>
              <strong>Safe Content:</strong> We maintain a respectful environment and avoid harmful content.
            </li>
            <li>
              <strong>Professional Advice:</strong> For medical, legal, or psychological matters, please consult qualified professionals.
            </li>
          </ul>
        </div>
      </div>
    `;

    this.messagesContainer.innerHTML = welcomeHtml;
  }

  private renderMessages(): void {
    if (!this.currentChat) {
      this.renderWelcomeMessage();
      return;
    }

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
