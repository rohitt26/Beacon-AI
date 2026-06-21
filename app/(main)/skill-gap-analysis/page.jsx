"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Loader2 } from "lucide-react"

export default function SkillGapAnalysisPage() {
  const [targetRole, setTargetRole] = useState("")
  const [currentSkills, setCurrentSkills] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    if (!targetRole || !currentSkills) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/analyze-skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target_role: targetRole,
          current_skills: currentSkills
        })
      })
      
      if (!response.ok) {
        let errorMessage = "Failed to analyze skills";
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          if (errorData.detail) errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } catch (e) {
          errorMessage = `Server Error (${response.status}): Failed to connect to Python backend.`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      alert(error.message || "Something went wrong while analyzing the skill gap.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-24 pb-10 max-w-4xl space-y-6 md:space-y-8">
      <div>
        <h1 className="font-bold gradient-title text-3xl md:text-5xl lg:text-6xl">Skill Gap Analysis</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Discover what you need to learn to land your targeted role.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role & Current Skills</CardTitle>
          <CardDescription>Enter the job you want and your existing skills.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Targeted Role</Label>
            <Input 
              id="role" 
              placeholder="e.g. Data Scientist, Frontend Developer..." 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Current Skills</Label>
            <Textarea 
              id="skills" 
              placeholder="e.g. Python, basic SQL, Communication..." 
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              rows={4}
            />
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !targetRole || !currentSkills}
            className="w-full md:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Analyzing..." : "Analyze Skill Gap"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>The Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{result.gap_summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>What the role demands</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {result.required_skills?.map((skill, index) => (
                <Badge key={`req-${index}`} variant="secondary">{skill}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Missing Skills</CardTitle>
              <CardDescription>What you need to acquire</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {result.missing_skills?.map((skill, index) => (
                <Badge key={`miss-${index}`} variant="destructive">{skill}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>How to Improve (Action Plan)</CardTitle>
              <CardDescription>Your roadmap to closing the gap</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {result.improvement_plan?.map((plan, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      Step {index + 1}: {plan.step}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {plan.details}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}