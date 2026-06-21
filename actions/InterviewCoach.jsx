"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, CheckCircle2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterviewCoach() {
  const [jobDescription, setJobDescription] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hello! I'm your AI Interview Coach. I'm here to help you practice and refine your interview skills. Please provide the Job Description to get started!" 
    }
  ]);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleStart = async () => {
    if (!jobDescription.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/api/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setMessages([{ role: "assistant", content: data.message }]);
    } catch (error) {
      console.error(error);
      setMessages([{ role: "assistant", content: "Error connecting to Python backend. Ensure the FastAPI server is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !sessionId) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/api/interview/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userMsg }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error connecting to the Python server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/api/interview/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: `**Feedback:**\n\n${data.message}` }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background w-full">
      {/* Main Container */}
      <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="py-6 md:py-8 px-4 md:px-8 border-b flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold gradient-title mb-2">
              AI Interview Coach
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-medium">
              Elevate your interview skills with real-time AI feedback.
            </p>
          </div>
          {sessionId && (
            <Button 
              onClick={handleFeedback} 
              disabled={isLoading}
              variant="outline"
              className="hidden md:flex shadow-sm"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Get Final Feedback
            </Button>
          )}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col p-4 md:p-8 space-y-6">
          
          {/* Pre-Interview Setup State */}
          {!sessionId && (
            <div className="flex-1 flex items-start justify-center">
              <div className="w-full max-w-2xl mt-8">
                <div className="bg-card text-card-foreground border rounded-xl shadow-sm">
                  <div className="p-6 flex flex-row items-center gap-4 border-b">
                    <div className="p-2 bg-muted rounded-lg">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold leading-none tracking-tight">Target Role Context</h2>
                      <p className="text-sm text-muted-foreground mt-1.5">Provide the job description to tailor the interview.</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <textarea
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g. We are looking for a Senior Frontend Developer with 5+ years of experience in React, Next.js, and modern CSS..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={isLoading}
                    />
                    
                    <Button 
                      onClick={handleStart} 
                      disabled={!jobDescription.trim() || isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Initializing Interview..." : "Start Interview"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Chat State */}
          {sessionId && messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center shadow-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted border border-border text-foreground"
                }`}>
                  {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div> 
                
                {/* Message Bubble */}
                <div className={`p-4 md:p-5 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-muted/50 border border-border text-foreground rounded-tl-sm whitespace-pre-wrap"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && sessionId && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[85%] md:max-w-[75%]">
                <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5 text-foreground" />
                </div>
                <div className="p-5 rounded-3xl bg-muted/50 border border-border rounded-tl-sm text-sm flex items-center gap-2 shadow-sm h-14">
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Panel */}
        {sessionId && (
          <form onSubmit={handleSend} className="p-4 md:p-6 bg-background border-t border-border">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 max-w-4xl mx-auto w-full">
              <input
                type="text"
                className="flex-1 p-3 sm:p-4 md:p-5 bg-background border border-input rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                placeholder="Type your response here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="h-10 sm:h-11 md:h-12 rounded-xl shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 px-4 sm:px-6 md:px-8"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile Feedback Button */}
            <Button 
              onClick={handleFeedback} 
              disabled={isLoading}
              variant="outline"
              className="mt-4 w-full flex md:hidden text-muted-foreground rounded-xl"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Get Final Feedback
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}