from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def get_init_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical interviewer. The user wants to interview for a job with this description:\n{job_description}\nIntroduce yourself briefly and ask the first relevant technical question."),
    ])

def get_interview_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "You are a professional, encouraging technical interviewer. You must ask ONLY ONE question at a time. The job description is:\n{job_description}\nStay in character. Acknowledge their answer briefly, then ask the NEXT question. NEVER provide constructive feedback on their answer; just move forward with the interview."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])

def get_feedback_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical mentor. The user is practicing for an interview. Provide constructive feedback on their last answer. Detail what they did well and what they missed or could improve. Be concise and encouraging. Do NOT ask the next interview question."),
        ("human", "My last answer was:\n{answer}\n\nPlease critically evaluate my answer.")
    ])
