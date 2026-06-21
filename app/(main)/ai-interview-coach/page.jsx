import React from "react";
import InterviewCoach from "@/actions/InterviewCoach";

export const metadata = {
    title: "AI Career Chat | AI Interview Coach",
    description: "Practice your interview skills with our AI Career Coach.",
};

export default function AICareerChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] container mx-auto py-6 px-4 md:px-6 flex items-center justify-center">
      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden h-full w-full max-w-5xl mx-auto flex flex-col">
        <InterviewCoach />
      </div>
    </div>
  );
}
