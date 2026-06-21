import os
from langchain_anthropic import ChatAnthropic
from langchain.memory import ConversationSummaryBufferMemory
from prompts.system_prompt import get_init_prompt, get_interview_prompt, get_feedback_prompt

# In-memory session store for simplicity
# In production, use a database or Redis
sessions = {}

def get_llm():
    return ChatAnthropic(
        model="claude-3-5-sonnet-20240620", 
        temperature=0.7,
        # API key is automatically picked up from ANTHROPIC_API_KEY env var
    )

def init_session(session_id: str, job_description: str):
    llm = get_llm()
    # Summarize history if it gets too long, but keep recent messages intact
    memory = ConversationSummaryBufferMemory(llm=llm, max_token_limit=2000, return_messages=True)
    
    sessions[session_id] = {
        "memory": memory,
        "job_description": job_description,
        "last_user_message": None,
    }
    
    prompt = get_init_prompt()
    chain = prompt | llm
    
    # Generate the very first question based on the job description
    response = chain.invoke({"job_description": job_description})
    
    # Save the initial context to memory
    memory.save_context({"input": "Start interview for: " + job_description}, {"output": response.content})
    return response.content

def get_interview_response(session_id: str, message: str):
    if session_id not in sessions:
        raise ValueError("Invalid session ID. Please restart the interview.")
        
    session = sessions[session_id]
    memory = session["memory"]
    llm = get_llm()
    
    # Store their last response for potential feedback requests later
    session["last_user_message"] = message
    
    prompt = get_interview_prompt()
    
    # Load past messages from memory
    history_messages = memory.load_memory_variables({})["history"]
    if isinstance(history_messages, str):
        # Fallback if memory returns string instead of list (should be list due to return_messages=True)
        from langchain_core.messages import SystemMessage
        history_messages = [SystemMessage(content=history_messages)]
        
    chain = prompt | llm
    
    response = chain.invoke({
        "job_description": session["job_description"],
        "history": history_messages,
        "input": message
    })
    
    # Save this turn to memory
    memory.save_context({"input": message}, {"output": response.content})
    return response.content

def get_feedback_response(session_id: str):
    if session_id not in sessions:
        raise ValueError("Invalid session ID.")
    
    session = sessions[session_id]
    last_msg = session["last_user_message"]
    
    if not last_msg:
        return "You haven't answered any questions yet, so there is nothing to provide feedback on."
        
    llm = get_llm()
    prompt = get_feedback_prompt()
    chain = prompt | llm
    
    response = chain.invoke({"answer": last_msg})
    return response.content
