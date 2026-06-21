import os
import streamlit as st
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.memory import ConversationSummaryBufferMemory
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

# Load environment variables from .env
load_dotenv(override=True)


# ==========================================
# Phase 2: Core Logic (The Brain)
# ==========================================

@st.cache_resource
def get_llm(api_key: str):
    # Initialize the Gemini 2.5 Flash model
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, api_key=api_key)

# ==========================================
# Phase 3: Features & UI
# ==========================================

st.set_page_config(page_title="AI Interview Coach", page_icon="🤖")
st.title("🤖 AI Interview Coach")

# Sidebar: Context & Features
st.sidebar.title("Interview Setup")

# API Key Handling
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    api_key = st.sidebar.text_input("Enter your Gemini API Key:", type="password")
    if not api_key:
        st.error("API Key not found! Please restart your command prompt, create a `.env` file, or enter it in the sidebar.")
        st.stop()

llm = get_llm(api_key)

# Initialize ConversationSummaryBufferMemory in Streamlit session state
# This ensures the AI remembers context without overflowing token limits.
if "memory" not in st.session_state:
    st.session_state.memory = ConversationSummaryBufferMemory(
        llm=llm,
        max_token_limit=1000,
        return_messages=True,
        memory_key="chat_history"
    )

job_description = st.sidebar.text_area(
    "Job Description", 
    height=250, 
    placeholder="Paste the Job Description here to give the AI context..."
)

# Feedback Mode Toggle
feedback_mode = st.sidebar.toggle("Feedback Mode 📝", value=False, help="Turn ON to evaluate your last answer. Turn OFF to continue the interview.")

# Define Persona using System Prompt Template
if feedback_mode:
    sys_prompt = (
        "You are an expert technical interview coach evaluating a candidate. "
        "Job Description context: {job_description}\n\n"
        "Evaluate the candidate's last answer. Provide constructive feedback, "
        "highlight strengths, and suggest improvements. Do NOT ask another question."
    )
else:
    sys_prompt = (
        "You are a professional, encouraging technical interviewer. "
        "Job Description context: {job_description}\n\n"
        "You are conducting a mock interview. Ask ONE relevant question at a time. "
        "Wait for the candidate to answer. Do NOT provide feedback unless explicitly asked. "
        "Keep the conversation natural and professional."
    )

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(sys_prompt),
    MessagesPlaceholder(variable_name="chat_history"),
    HumanMessagePromptTemplate.from_template("{input}")
])

# LangChain Expression Language (LCEL) Chain
chain = prompt | llm

# UI: Chat Interface
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hello! I'm your AI Interview Coach. Please paste the Job Description in the sidebar, and whenever you're ready, say 'Hi' or introduce yourself to start!"}
    ]

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if user_input := st.chat_input("Type your response here..."):
    # 1. Add Human message to UI
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)
        
    # 2. Retrieve Memory
    memory_variables = st.session_state.memory.load_memory_variables({})
    history = memory_variables.get("chat_history", [])
    
    jd_context = job_description if job_description.strip() else "General Software Engineering Role"

    # 3. Invoke LCEL Chain
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = chain.invoke({
                "job_description": jd_context,
                "chat_history": history,
                "input": user_input
            })
            ai_response = response.content
            st.markdown(ai_response)
            
    # 4. Save to UI state and LangChain Memory
    st.session_state.messages.append({"role": "assistant", "content": ai_response})
    st.session_state.memory.save_context(
        {"input": user_input}, 
        {"output": ai_response}
    )