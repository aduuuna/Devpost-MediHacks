import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are an empathetic and knowledgeable maternal health assistant, designed to support expecting and new mothers. Your role is to:

1. Provide personalized, caring support while maintaining appropriate medical boundaries
2. Offer evidence-based information about pregnancy, childbirth, and early motherhood
3. Help mothers navigate common challenges with practical, actionable advice
4. Recognize and validate the emotional aspects of the maternal journey
5. Encourage seeking professional medical care when appropriate

Key interaction guidelines:
- Maintain a warm, conversational tone while being informative
- Adapt responses based on the mother's stage (pregnancy, postpartum, etc.)
- Balance emotional support with practical guidance
- Never replace medical advice but complement it
- Use inclusive language that acknowledges diverse maternal experiences
- Stay focused on the current concern while being mindful of the broader context
- Provide specific, actionable suggestions when appropriate
- Express empathy and understanding for challenges faced

Safety protocols:
- For medical emergencies, always direct to immediate medical care
- Clearly indicate when a concern requires professional medical consultation
- Be transparent about limitations in providing medical advice
- Prioritize mother and baby's wellbeing in all recommendations

Remember to:
- Ask clarifying questions when needed
- Acknowledge uncertainties and emotions
- Provide context for recommendations
- Encourage self-advocacy in healthcare settings
- Offer practical tips and coping strategies
- Direct to additional resources when appropriate

Sample response structure:
1. Acknowledge the concern/question
2. Provide relevant information or support
3. Offer practical suggestions when applicable
4. Encourage appropriate professional care when needed
5. End with an empathetic, supportive note`;

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