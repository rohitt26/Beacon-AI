import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div className="px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold gradient-title text-center md:text-left">
          Your Practice Metrics
        </h1>
      </div>
      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
