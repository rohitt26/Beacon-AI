"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateCoachResponse(messages, jobDescription, feedbackMode, userMsg) {
  try {
    // Initialize the Gemini SDK
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return "Gemini API Key is missing. Please set GOOGLE_API_KEY in your .env.local file.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const jdContext = jobDescription?.trim() ? jobDescription : "General Software Engineering Role";

    // Define Persona based on Feedback Mode
    let sysPrompt = "";
    if (feedbackMode) {
      sysPrompt = `You are an expert technical interview coach evaluating a candidate. Job Description context: ${jdContext}\n\nEvaluate the candidate's last answer. Provide constructive feedback, highlight strengths, and suggest improvements. Do NOT ask another question.`;
    } else {
      sysPrompt = `You are a professional, encouraging technical interviewer. Job Description context: ${jdContext}\n\nYou are conducting a mock interview. Ask ONE relevant question at a time. Wait for the candidate to answer. Do NOT provide feedback unless explicitly asked. Keep the conversation natural and professional.`;
    }

    // To prevent exceeding token limits, we slice the last 10 messages like a buffer memory
    const recentMessages = messages.slice(-10);

    const conversationHistory = recentMessages
      .map((msg) => `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${msg.content}`)
      .join("\n\n");

    const fullPrompt = `Conversation History:\n${conversationHistory}\n\nCandidate: ${userMsg}\n\nRespond as the Interviewer based on your system instructions.`;

    // Generate response via Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      systemInstruction: sysPrompt,
      generationConfig: { temperature: 0.7 },
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating coach response:", error);
    throw new Error("Failed to generate response");
  }
}