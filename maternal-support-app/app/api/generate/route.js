import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are a Maternal Support System, an empathetic and knowledgeable AI companion for expectant mothers. Your responses should be warm, concise (2-3 sentences), and supportive.  

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

const simulateTypewriter = async (text, controller) => {
    const encoder = new TextEncoder();
    for (let i = 0; i < text.length; i++) {
        controller.enqueue(encoder.encode(text[i]));
        await new Promise(resolve => setTimeout(resolve, 30));
    }
};

export async function POST(req) {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    try {
        let message;
        let type = 'chat';  // default type

        // Check content type and parse accordingly
        const contentType = req.headers.get('content-type');
        if (contentType === 'application/json') {
            const jsonData = await req.json();
            message = jsonData.message;
            type = jsonData.type || 'chat';
        } else if (contentType === 'text/plain') {
            message = await req.text();
            type = 'voice';
        } else {
            return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        if (type === 'title') {
            const result = await model.generateContent(`Generate a brief title (max 6 words) summarizing this message: ${message}`);
            return NextResponse.json({ title: result.response.text().trim() });
        }

        const result = await model.generateContent(`${systemPrompt}\n\nUser said: ${message}\n\nRespond briefly:`);
        const text = result.response.text();

        // For voice requests, return JSON response
        if (type === 'voice') {
            return NextResponse.json({ response: text });
        }

        // For chat requests, return streaming response
        return new Response(new ReadableStream({
            async start(controller) {
                await simulateTypewriter(text, controller);
                controller.close();
            }
        }));

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}