import { initializeApp } from 'firebase/app';
import { environment } from './environment';
import { ChatComponent } from './components/Chat';
import { NavigationComponent } from './components/Navigation';

// Initialize Firebase
initializeApp(environment.firebase);

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Navigation on all pages
  new NavigationComponent();

  const currentPath = window.location.pathname;

  if (currentPath === '/') {
    const chat = new ChatComponent();
    const messageInput = document.getElementById(
      'message-input'
    ) as HTMLTextAreaElement;
    const sendButton = document.getElementById('send-button');

    messageInput?.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = messageInput.scrollHeight + 'px';
    });

    sendButton?.addEventListener('click', async () => {
      const message = messageInput.value.trim();
      if (message) {
        try {
          await chat.sendMessage(message);
          messageInput.value = '';
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  }
});
