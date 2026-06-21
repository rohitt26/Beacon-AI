import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-center justify-between mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold gradient-title text-center md:text-left">My Cover Letters</h1>
        <Link href="/ai-cover-letter/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}
