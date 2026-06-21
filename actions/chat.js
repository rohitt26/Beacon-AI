"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API using either GEMINI_API_KEY or GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

export async function generateChatResponse(chatHistory, jobDescription, feedbackMode) {
  try {
    const jdContext = jobDescription?.trim() ? jobDescription : "General Software Engineering Role";
    
    let sysPrompt = "";
    if (feedbackMode) {
      sysPrompt = `You are an expert technical interview coach evaluating a candidate. Job Description context: ${jdContext}\n\nEvaluate the candidate's last answer. Provide constructive feedback, highlight strengths, and suggest improvements. Do NOT ask another question.`;
    } else {
      sysPrompt = `You are a professional, encouraging technical interviewer. Job Description context: ${jdContext}\n\nYou are conducting a mock interview. Ask ONE relevant question at a time. Wait for the candidate to answer. Do NOT provide feedback unless explicitly asked. Keep the conversation natural and professional.`;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: sysPrompt,
      generationConfig: {
        temperature: 0.7,
      },
    });

    // Format history for Gemini API
    // Skip the last message as it will be sent as the new prompt
    const formattedHistory = chatHistory.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const lastMessage = chatHistory[chatHistory.length - 1].content;
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate response");
  }
}