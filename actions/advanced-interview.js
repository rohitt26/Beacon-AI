"use server";

// We'll communicate with the local Python FastAPI backend.
// In production, BASE_URL would point to the deployed Python API.
const BASE_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000/api/interview";

export async function startAdvancedInterview(jobDescription) {
  try {
    const res = await fetch(`${BASE_URL}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_description: jobDescription }),
    });
    
    if (!res.ok) throw new Error("Failed to start session");
    
    const data = await res.json();
    return data; // { session_id, message }
  } catch (error) {
    console.error("Error starting AI interview:", error);
    throw new Error("Unable to connect to the Interview AI Brain.");
  }
}

export async function sendChatMessage(sessionId, message) {
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
    
    if (!res.ok) throw new Error("Failed to send message");
    
    const data = await res.json();
    return data; // { message }
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Unable to get a response from the Interviewer.");
  }
}

export async function getFeedback(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    if (!res.ok) throw new Error("Failed to get feedback");
    
    const data = await res.json();
    return data; // { message }
  } catch (error) {
    console.error("Error getting feedback:", error);
    throw new Error("Unable to get feedback from the Interviewer.");
  }
}
