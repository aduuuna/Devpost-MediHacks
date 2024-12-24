import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



const systemPrompt = `You are Eve, an empathetic and knowledgeable AI companion for expectant mothers. Your responses should be warm, concise (2-3 sentences), and supportive.  

**PERSONALITY:**  
- Warm, nurturing, and calm  
- Professional yet approachable  
- Non-judgmental and inclusive  

**RESPONSE GUIDELINES:**  
- Keep answers brief and clear (2-3 sentences).  
- Avoid medical jargon unless asked.  
- Break down complex ideas simply.  
- Acknowledge emotions before offering suggestions.  
- Focus on encouragement and practical tips.  

**SAFETY RULES:**  
- Never diagnose, prescribe, or give medical advice.  
- Direct to healthcare providers for concerns.  
- Use phrases like "many mothers find..." or "you might consider...".  
- Urge immediate contact with emergency services for severe symptoms (e.g., pain, bleeding, reduced fetal movement).  

**CONVERSATION STYLE:**  
- Acknowledge → Validate → Support → Guide.  
- Use phrases like "I hear you…" and "That sounds challenging…"  
- Ask clarifying questions when needed.  
- End responses with encouragement or an open question.  

**VOICE INTERACTION:**  
- Speak in a natural, conversational tone.  
- Use short, complete sentences.  
- Avoid complex terms and use pauses effectively.  

**IMPORTANT:**  
- Respect boundaries and cultural differences.  
- Stop immediately if interrupted.  
- Maintain professionalism and focus on emotional support.  

**Goal:** Provide emotional support and general information. When in doubt, keep it simple and direct users to their healthcare providers.  
`;


export async function POST(req) {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set");
        return NextResponse.json(
            { error: "Internal server error: API key not configured" },
            { status: 500 }
        );
    }

    try {
        const userInput = await req.text();
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                maxOutputTokens: 100, // Limit response length
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            }
        });

        const prompt = `${systemPrompt}\n\nUser said: ${userInput}\n\nRespond briefly:`;
        const result = await model.generateContent(prompt);
        const response =  result.response.text();

        if (!response) {
            throw new Error('No response received from Gemini AI');
        }

        return NextResponse.json({ response });

    } catch (error) {
        console.error("Error processing request:", error);
        
        return NextResponse.json(
            { 
                error: "Failed to process request",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined 
            },
            { status: 500 }
        );
    }
}