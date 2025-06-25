require('dotenv').config();
const Express = require('express');
const { createServer } = require('http');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = new Express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(Express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const API_KEY = process.env.API_KEY 
const MODEL = 'gemini-1.5-flash';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

app.use(bodyParser.json());

// Initialize conversation with bot's identity and instructions
const initialPrompt = "You are DineshGPT, created by Dinesh for IITB Summer of Code 2025. Follow these rules strictly: Use bullet points only when needed. Format responses with HTML tags, but output only the HTML text (no ```html or markdown). No greetings or intros at the start. For long topics: give a short overview, ask if more is needed, then use <h1>, <h2>, <h3>. Use markdown code blocks (```) for code only. Use emojis sparingly to enhance clarity. Be creative, engaging, accurate, and cheerful.";

let conversationHistory = initialPrompt;

// POST /gemini 
app.post('/gemini', async (req, res) => {
  const prompt = req.body.prompt;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required in the body.' });
  }

  // Add user's message to conversation
  const userMessage = `\nUser: ${prompt}\nDineshGPT: `;
  const currentContext = conversationHistory + userMessage;

  try {
    const response = await axios.post(URL, {
      contents: [{
        parts: [{
          text: currentContext
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      throw new Error('No response received from Gemini API');
    }

    // Update conversation history with bot's response
    conversationHistory = currentContext + result;
    
    // Keep conversation history manageable by limiting length
    if (conversationHistory.length > 4096) {
      // Reset to initial prompt if too long, keeping last exchange
      conversationHistory = initialPrompt + 
        conversationHistory.slice(conversationHistory.lastIndexOf('\nUser:'));
    }
    
    res.json({ response: result });

  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error?.message || 'Failed to fetch response from Gemini API.';
    
    // Don't update conversation history on error
    res.status(500).json({ error: errorMessage });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});