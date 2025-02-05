import { Chat } from '../types/chat.types';

export class StorageService {
  private readonly CHATS_KEY = 'gemini_chats';

  saveChat(chat: Chat): void {
    const chats = this.getAllChats();
    const existingChatIndex = chats.findIndex((c) => c.id === chat.id);

    if (existingChatIndex !== -1) {
      chats[existingChatIndex] = chat;
    } else {
      chats.push(chat);
    }

    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
  }

  getAllChats(): Chat[] {
    const chatsJson = localStorage.getItem(this.CHATS_KEY);
    return chatsJson ? JSON.parse(chatsJson) : [];
  }

  getChatById(id: string): Chat | null {
    const chats = this.getAllChats();
    return chats.find((chat) => chat.id === id) || null;
  }

  deleteChat(id: string): void {
    const chats = this.getAllChats();
    const filteredChats = chats.filter((chat) => chat.id !== id);
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(filteredChats));
  }
}
