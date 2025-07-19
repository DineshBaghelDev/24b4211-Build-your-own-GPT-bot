// Simple variables
let isTyping = false;
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const charCount = document.getElementById('charCount');
const typingIndicator = document.getElementById('typingIndicator');

const API_URL = "http://localhost:3000/chat-rag-only"

// Setup when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateSendButton();
});

function setupEventListeners() {
    // Message input events
    messageInput.addEventListener('input', () => {
        updateCharCount();
        updateSendButton();
        autoResize();
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button
    sendBtn.addEventListener('click', sendMessage);

    // Quick actions
    document.querySelectorAll('.quick-action').forEach(action => {
        action.addEventListener('click', () => {
            messageInput.value = action.dataset.prompt;
            updateCharCount();
            updateSendButton();
            messageInput.focus();
        });
    });

    // Other buttons
    document.getElementById('clearChat')?.addEventListener('click', clearChat);
    document.getElementById('downloadChat')?.addEventListener('click', () => alert('Download feature - coming soon!'));
    document.getElementById('attachBtn')?.addEventListener('click', () => alert('File attachment - coming soon!'));
}

function updateCharCount() {
    charCount.textContent = messageInput.value.length;
}

function updateSendButton() {
    const hasContent = messageInput.value.trim().length > 0;
    sendBtn.disabled = !hasContent || isTyping;
}

function autoResize() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;

    // Add user message
    addMessage(message, 'user');

    // Clear input
    messageInput.value = '';
    updateCharCount();
    updateSendButton();
    autoResize();

    // Show typing and get response
    showTyping();
    
    try {
        const response = await getResponse(message);
        hideTyping();
        addMessage(response, 'bot');
    } catch (error) {
        hideTyping();
        addMessage("I'm sorry, something went wrong. Please try again.", 'bot');
        console.error("Error in sendMessage:", error);
    }
}

function addMessage(content, sender) {
    const messageGroup = document.createElement('div');
    messageGroup.className = `message-group ${sender}-group`;

    messageGroup.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message ${sender}-message">
                <div class="message-text">
                    <p>${content}</p>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        </div>
    `;

    chatMessages.appendChild(messageGroup);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getResponse(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "deepseek-llm-7b-chat",
                message: message,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Bot response data:", data);
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else if (data.error) {
            return "I apologize, but I encountered an error. Please try again.";
        } else {
            return "I'm sorry, I couldn't generate a response. Please try again.";
        }
    } catch (error) {
        console.error("Error getting response:", error);
        return "I'm having trouble connecting right now. Please check your connection and try again.";
    }
}

function showTyping() {
    isTyping = true;
    typingIndicator.style.display = 'block';
    updateSendButton();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    isTyping = false;
    typingIndicator.style.display = 'none';
    updateSendButton();
}

function clearChat() {
    if (confirm('Clear chat history?')) {
        const welcome = document.querySelector('.message-group');
        chatMessages.innerHTML = '';
        chatMessages.appendChild(welcome);
        document.getElementById('quickActions').style.display = 'flex';
    }
}