#  Beacon-AI: Full Stack AI Career Coach

Beacon-AI is an advanced, AI-powered career development platform designed to help you advance your career. Built with Next.js, Neon DB, Prisma, and Google Gemini AI, it provides personalized tools like an intelligent Resume builder, Cover letter generator,Skill gap analysis and an adaptive Interview preparation system.

**Website Link** : https://beacon-ai-nine.vercel.app/

## ✨ Features

*   **Professional Onboarding:** Share your industry and expertise for personalized guidance and insights.
*   **Intelligent Resume Builder:** Create ATS-optimized resumes with AI-assisted description improvements.
*   **Cover Letter Generator:** Craft compelling, tailored cover letters in seconds.
*   **AI Mock Interviews:** Practice with a personalized AI technical interviewer (powered by LangChain & Gemini) tailored to your target job description.
*   **Performance Analytics:** Track your interview preparation progress and identify areas for improvement.
*   **Skill Gap Analysis:** Get a comprehensive analysis of your current skills versus target role requirements.

## 🛠️ Tech Stack

*   **Frontend:** Next.js (React), Tailwind CSS, Shadcn UI
*   **Backend:** Node.js, Next.js Server Actions, Python (FastAPI/Streamlit) for advanced AI operations
*   **Database & ORM:** Neon (Serverless Postgres), Prisma
*   **Authentication:** Clerk
*   **AI & ML:** Google Gemini API (1.5 Flash / 2.5 Flash), LangChain
*   **Background Jobs:** Inngest

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+
*   Python 3.9+ (For the FastAPI/Streamlit AI backend services)
*   A Neon DB account
*   A Clerk account
*   A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/beacon-ai.git
   cd beacon-ai
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   DATABASE_URL=your_neon_db_connection_string

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Next.js Development Server:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

*   `/app` - Next.js frontend pages, layouts, and API routes.
*   `/actions` - Server actions for database operations (User, Resume, AI Insights).
*   `/python-backend` - FastAPI application for the LangChain/Gemini powered interview coach.
*   `/components` - Reusable UI components via Shadcn UI.
*   `/data` - Static data sets for FAQs and "How It Works" sections.
*   `/lib` - Configurations for Prisma and other utilities.

---
*Built with ❤️ by Tejas*
