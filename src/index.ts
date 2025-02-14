import { initializeApp } from 'firebase/app';
import { environment } from './environment';
import { ChatComponent } from './components/Chat';

// Initialize Firebase
initializeApp(environment.firebase);

document.addEventListener('DOMContentLoaded', () => {
  // Get the current path
  const currentPath = window.location.pathname;

  if (currentPath === '/') {
    // Initialize Chat Component only on main page
    const chat = new ChatComponent();

    const messageInput = document.getElementById(
      'message-input'
    ) as HTMLTextAreaElement;
    const sendButton = document.getElementById('send-button');

    // Auto-resize textarea
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
