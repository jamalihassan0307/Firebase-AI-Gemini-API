import { initializeApp } from 'firebase/app';
import { environment } from './environment';
import { ChatComponent } from './components/Chat';

// Initialize Firebase
initializeApp(environment.firebase);

// Initialize Chat Component
const chat = new ChatComponent();

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById(
    'message-input'
  ) as HTMLInputElement;
  const sendButton = document.getElementById('send-button');

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
});
