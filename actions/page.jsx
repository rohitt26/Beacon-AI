"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Loader2 } from "lucide-react"

export default function SkillGapAnalysis() {
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
      alert(error.message || "Something went wrong during the analysis.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Discover what you need to learn to land your dream role.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Enter your target role and current skills to get a personalized roadmap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Target Role</Label>
            <Input 
              id="role" 
              placeholder="e.g. Senior Frontend Developer" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Current Skills</Label>
            <Textarea 
              id="skills" 
              placeholder="e.g. React, CSS, basic Node.js, 2 years of experience" 
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading || !targetRole || !currentSkills}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze Skills
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Role Match: {result.match_percentage}%</CardTitle>
              <CardDescription>Estimated fit based on your current skills</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={result.match_percentage} className="h-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Missing Skills</CardTitle>
              <CardDescription>Areas you need to improve</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {result.missing_skills.map((skill, index) => (
                <Badge key={index} variant="destructive">{skill}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume Tips</CardTitle>
              <CardDescription>How to frame your current experience</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                {result.resume_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Action Plan</CardTitle>
              <CardDescription>Your step-by-step roadmap to bridge the gap</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {result.action_plan.map((plan, index) => (
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
