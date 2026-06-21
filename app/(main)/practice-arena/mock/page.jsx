import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";

export default function MockInterviewPage() {
  return (
    <div className="container mx-auto space-y-4 py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/practice-arena">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Practice Arena
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold gradient-title">Mock Interview</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Test your knowledge with industry-specific questions
          </p>
        </div>
      </div>

      <Quiz />
    </div>
  );
}
