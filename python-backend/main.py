import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv

# Load env variables from parent directories
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(base_dir, ".env")
env_local_path = os.path.join(base_dir, ".env.local")
load_dotenv(dotenv_path=env_path)
load_dotenv(dotenv_path=env_local_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartRequest(BaseModel):
    job_description: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class FeedbackRequest(BaseModel):
    session_id: str

sessions = {}

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing from environment variables.")
    # Utilizing Gemini 2.5 Flash as requested
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, api_key=api_key)

@app.get("/")
async def root():
    return {"message": "AI Career Coach Backend is running successfully!"}

@app.post("/api/interview/start")
async def start_interview(req: StartRequest):
    session_id = str(uuid.uuid4())
    sys_prompt = SystemMessage(
        content=(
            "You are a professional, encouraging technical interviewer. "
            f"Job Description context: {req.job_description}\n\n"
            "You are conducting a mock interview. Ask ONE relevant question at a time. "
            "Wait for the candidate to answer. Do NOT provide feedback unless explicitly asked. "
            "Keep the conversation natural and professional. "
            "Introduce yourself briefly and ask the very first interview question based on the job description."
        )
    )
    
    llm = get_llm()
    # Gemini requires at least one HumanMessage
    start_message = HumanMessage(content="Hello, I am the candidate. I am ready to begin the interview.")
    messages = [sys_prompt, start_message]
    
    try:
        response = llm.invoke(messages)
        messages.append(AIMessage(content=response.content))
        
        sessions[session_id] = {
            "job_description": req.job_description,
            "messages": messages
        }
        
        return {"session_id": session_id, "message": response.content}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/chat")
async def chat_interview(req: ChatRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
        
    session = sessions[req.session_id]
    messages = session["messages"]
    
    messages.append(HumanMessage(content=req.message))
    
    llm = get_llm()
    
    # Maintain context window without memory buffer missing class
    # keep the system prompt and the last 10 messages
    if len(messages) > 11:
        current_messages = [messages[0]] + messages[-10:]
    else:
        current_messages = messages
        
    response = llm.invoke(current_messages)
    
    messages.append(AIMessage(content=response.content))
    
    return {"message": response.content}

@app.post("/api/interview/feedback")
async def feedback_interview(req: FeedbackRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
        
    session = sessions[req.session_id]
    messages = session["messages"]
    
    sys_prompt = SystemMessage(
        content=(
            "You are an expert technical interview coach evaluating a candidate. "
            f"Job Description context: {session['job_description']}\n\n"
            "Evaluate the candidate's last answer based on the conversation history. "
            "Provide constructive feedback, highlight strengths, and suggest improvements. "
            "Do NOT ask another question."
        )
    )
    
    eval_messages = [sys_prompt]
    # Add conversation history
    eval_messages.extend(messages[1:])
    eval_messages.append(HumanMessage(content="Please provide feedback on my last answer."))
    
    llm = get_llm()
    response = llm.invoke(eval_messages)
    
    return {"message": response.content}

class AnalyzeSkillsRequest(BaseModel):
    target_role: str
    current_skills: str

class PlanStep(BaseModel):
    step: str
    details: str

class AnalyzeSkillsResponse(BaseModel):
    gap_summary: str
    match_percentage: int
    required_skills: list[str]
    missing_skills: list[str]
    resume_tips: list[str]
    improvement_plan: list[PlanStep]
    action_plan: list[PlanStep]

@app.post("/api/analyze-skills")
async def analyze_skills(req: AnalyzeSkillsRequest):
    llm = get_llm()
    structured_llm = llm.with_structured_output(AnalyzeSkillsResponse)
    
    prompt = (
        "You are an expert career coach. Analyze the skill gap for the user.\n"
        f"Target Role: {req.target_role}\n"
        f"Current Skills: {req.current_skills}\n\n"
        "Please provide a comprehensive analysis including a gap summary, a match percentage (0-100), "
        "required skills for the role, missing skills, resume tips to highlight current skills, "
        "and a step-by-step improvement or action plan. Provide the plan identically in both 'improvement_plan' and 'action_plan' lists."
    )
    
    try:
        response = structured_llm.invoke(prompt)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
