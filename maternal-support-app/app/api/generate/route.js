import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



const systemPrompt = `You are Adam, an empathetic and knowledgeable AI companion for expectant mothers. Your responses should be warm, concise (2-3 sentences), and supportive.  

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
           model: "gemini-pro"
       });

       const prompt = `${systemPrompt}\n\nUser said: ${userInput}\n\nRespond briefly:`;
       const result = await model.generateContent(prompt);
       const response = await result.response.text();

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



// app/speak/page.js - Update the processAndRespond function
const processAndRespond = async (text) => {
   if (isCancelledRef.current) return;
   
   try {
       setIsProcessing(true);
       setStatus("Processing your message...");

       const response = await fetch("/api/generate", {
           method: "POST",
           headers: {
               "Content-Type": "text/plain",
           },
           body: text,
       });

       if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
       }

       const data = await response.json();
       
       if (data.response && synthesisRef.current && !isCancelledRef.current) {
           setStatus("Responding...");
           const utterance = new SpeechSynthesisUtterance(data.response);
           
           utterance.onend = () => {
               if (!isCancelledRef.current) {
                   setIsProcessing(false);
                   setStatus(isRecording ? "Listening..." : "Click on the mic to start recording");
                   setTranscript("");
               }
           };

           utterance.onerror = (error) => {
               console.error("Speech synthesis error:", error);
               setStatus("Error in speech synthesis. Please try again.");
               setIsProcessing(false);
           };

           synthesisRef.current.speak(utterance);
       }
   } catch (error) {
       console.error("Error processing response:", error);
       setStatus("Error occurred. Please try again.");
       setIsProcessing(false);
   }
};