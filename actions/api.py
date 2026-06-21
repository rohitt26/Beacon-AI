from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import json
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.memory import ConversationSummaryBufferMemory
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

load_dotenv()

app = FastAPI()

# Allow Next.js frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory dictionary to store active interview sessions
sessions = {}

def get_llm():
    return ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7)

# Request Models
class StartRequest(BaseModel):
    job_description: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class FeedbackRequest(BaseModel):
    session_id: str

class SkillGapRequest(BaseModel):
    target_role: str
    current_skills: str

@app.post("/api/interview/start")
async def start_interview(req: StartRequest):
    session_id = str(uuid.uuid4())
    llm = get_llm()
    memory = ConversationSummaryBufferMemory(llm=llm, max_token_limit=1000, return_messages=True, memory_key="chat_history")
    
    # Store the session setup
    sessions[session_id] = {
        "memory": memory,
        "job_description": req.job_description,
        "llm": llm
    }
    
    return {
        "session_id": session_id,
        "message": "Hello! I'm your AI Interview Coach. I've reviewed the job description. Whenever you're ready, could you please introduce yourself?"
    }

@app.post("/api/interview/chat")
async def chat_interview(req: ChatRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = sessions[req.session_id]
    
    sys_prompt = f"You are a professional, encouraging technical interviewer. Job Description: {session['job_description']}\nAsk ONE relevant question at a time. Wait for the candidate to answer. Keep the conversation natural."
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(sys_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{input}")
    ])
    
    chain = prompt | session["llm"]
    history = session["memory"].load_memory_variables({}).get("chat_history", [])
    
    response = chain.invoke({"chat_history": history, "input": req.message})
    session["memory"].save_context({"input": req.message}, {"output": response.content})
    
    return {"message": response.content}

@app.post("/api/interview/feedback")
async def get_feedback(req: FeedbackRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = sessions[req.session_id]
    sys_prompt = f"You are an expert technical interview coach. Job Description: {session['job_description']}\nEvaluate the candidate's performance based on the chat history. Provide constructive feedback, highlight strengths, and suggest improvements. Do NOT ask another question."
    
    prompt = ChatPromptTemplate.from_messages([SystemMessagePromptTemplate.from_template(sys_prompt), MessagesPlaceholder(variable_name="chat_history"), HumanMessagePromptTemplate.from_template("{input}")])
    chain = prompt | session["llm"]
    history = session["memory"].load_memory_variables({}).get("chat_history", [])
    response = chain.invoke({"chat_history": history, "input": "Please provide your final feedback on my interview performance."})
    
    return {"message": response.content}

@app.post("/api/analyze-skills")
async def analyze_skills(req: SkillGapRequest):
    llm = get_llm()
    
    sys_prompt = """You are an expert technical recruiter and career coach.
Analyze the gap between the candidate's current skills and their target role.
You MUST return ONLY a valid JSON object with the following schema:
{
  "gap_summary": "A short paragraph explaining the overall skill gap",
  "required_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "improvement_plan": [
    {"step": "Step 1 Title", "details": "Detailed explanation of what to learn and how"}
  ]
}
Do not include any markdown formatting like ```json ... ```, just return the raw JSON object."""
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(sys_prompt),
        HumanMessagePromptTemplate.from_template("Target Role: {role}\nCurrent Skills: {skills}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"role": req.target_role, "skills": req.current_skills})
    
    # Gemini occasionally wraps responses in Markdown blocks, so we clean it
    content = response.content.strip()
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
    if json_match:
        content = json_match.group(1).strip()
        
    try:
        return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")