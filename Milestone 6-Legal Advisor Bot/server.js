import Express from 'express';
import cors from 'cors';

const app = Express();
const PORT = 3000;
const RAG_SERVICE_URL = 'http://localhost:5000'; // Python RAG service

app.use(Express.static('./public'));
app.use(Express.json());
app.use(cors());

app.get("/", (req,res)=>{
    return res.sendFile("index.html", { root: "./public" });
});

app.post("/chat", async (req,res)=>{
    try {
        // Get relevant context from Python RAG service
        const userMessage = req.body.message;
        let context = null;
        let hasRelevantInfo = false;
        
        try {
            const ragResponse = await fetch(`${RAG_SERVICE_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: userMessage
                })
            });
            
            if (ragResponse.ok) {
                const ragData = await ragResponse.json();
                context = ragData.context;
                hasRelevantInfo = context !== null;
                
                // If no relevant info found, return "I don't know" immediately
                if (!hasRelevantInfo) {
                    return res.json({
                        choices: [{
                            message: {
                                content: "I don't know - I couldn't find relevant information about this topic in the legal documents I have access to. For specific legal advice, please consult with a qualified lawyer."
                            }
                        }]
                    });
                }
            }
        } catch (ragError) {
            console.log("RAG service not available, using fallback");
        }
        
        // Only proceed with LLM if we have relevant context
        if (!hasRelevantInfo) {
            return res.json({
                choices: [{
                    message: {
                        content: "I don't know - I couldn't find relevant information about this topic. For specific legal advice, please consult with a qualified lawyer."
                    }
                }]
            });
        }
        
        // Create enhanced system message with context
        const systemMessage = `You are a Legal Advisor Bot that provides helpful legal information and guidance based on Indian laws. 

Use the following legal context to answer the user's question:
${context}

Please provide accurate legal information based on the context provided. Keep your response focused on the provided context. If you cannot answer based on the given context, say "I don't know" and recommend consulting a qualified lawyer.`;

        const response = await fetch("http://127.0.0.1:1234/api/v0/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: req.body.model || "deepseek-llm-7b-chat",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userMessage },
                ]
            })
        });

        const data = await response.json();
        console.log("LLM Response:", data);
        
        return res.json(data);
    } catch (error) {
        console.error("Error calling LLM API:", error);
        return res.status(500).json({
            error: "Failed to get response from LLM",
            choices: [{
                message: {
                    content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again later."
                }
            }]
        });
    }
});

// Fallback endpoint for direct RAG responses (when LLM is not available)
app.post("/chat-rag-only", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        const ragResponse = await fetch(`${RAG_SERVICE_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: userMessage
            })
        });
        
        if (!ragResponse.ok) {
            throw new Error(`RAG service error: ${ragResponse.status}`);
        }
        
        const ragData = await ragResponse.json();
        const context = ragData.context || "No relevant legal information found.";
        
        // Simple response format matching the LLM API
        const response = {
            choices: [{
                message: {
                    content: `${context}`
                }
            }]
        };
        
        return res.json(response);
    } catch (error) {
        console.error("Error in RAG-only chat:", error);
        return res.status(500).json({
            error: "Failed to process request",
            choices: [{
                message: {
                    content: "I apologize, but I'm having trouble processing your request right now. Please try again later."
                }
            }]
        });
    }
});

app.listen(PORT, ()=>{
    console.log(`Listening at Port ${PORT}`)
})