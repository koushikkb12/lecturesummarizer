"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Download, RefreshCw, Youtube, Clock, FileText, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideoDetails {
  title: string
  video_id: string
  duration: string
}

interface TranscriptDetails {
  word_count: number
  chunk_count: number
}

interface SummaryResponse {
  video_details: VideoDetails
  transcript_details: TranscriptDetails
  summary: string
}

export default function YouTubeSummarizer() {
  const [url, setUrl] = useState("")
  const [language, setLanguage] = useState("en")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [result, setResult] = useState<SummaryResponse | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
    return youtubeRegex.test(url)
  }

  const simulateProgress = () => {
    const steps = [
      { progress: 20, message: "Fetching transcript..." },
      { progress: 40, message: "Processing video content..." },
      { progress: 60, message: "Chunking transcript..." },
      { progress: 80, message: "Generating summary..." },
      { progress: 95, message: "Finalizing study guide..." },
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress)
        setStatus(steps[currentStep].message)
        currentStep++
      } else {
        clearInterval(interval)
      }
    }, 1000)

    return interval
  }

  const handleSummarize = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)
    setProgress(0)
    setStatus("Starting...")

    const progressInterval = simulateProgress()

    try {
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtube_url: url,
          language: language,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SummaryResponse = await response.json()

      clearInterval(progressInterval)
      setProgress(100)
      setStatus("Complete!")
      setResult(data)

      toast({
        title: "Success!",
        description: "Video summarized successfully",
      })
    } catch (err) {
      clearInterval(progressInterval)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to summarize video. Make sure your backend is running on http://localhost:8000",
      )
      setProgress(0)
      setStatus("")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (result?.summary) {
      await navigator.clipboard.writeText(result.summary)
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      })
    }
  }

  const downloadMarkdown = () => {
    if (result?.summary) {
      const blob = new Blob([result.summary], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `youtube-summary-${result.video_details.video_id}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Downloaded!",
        description: "Summary downloaded as Markdown file",
      })
    }
  }

  const resetForm = () => {
    setUrl("")
    setResult(null)
    setError("")
    setProgress(0)
    setStatus("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Youtube className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-slate-800">YouTube Video Summarizer</h1>
          </div>
          <p className="text-slate-600">Transform any YouTube video into a comprehensive study guide</p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Video Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">Enter YouTube URL:</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Output Language:</Label>
              <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
            )}

            <Button onClick={handleSummarize} disabled={isLoading || !url.trim()} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Summarize Video"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Progress Section */}
        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{status}</span>
                  <span className="text-slate-600">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Details Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                Video Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Title</p>
                  <p className="text-sm text-slate-800">{result.video_details.title}</p>
                </div>
                <div className="space-y-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Duration</p>
                    <p className="text-sm text-slate-800">{result.video_details.duration}</p>
                  </div>
                </div>
                <div className="space-y-1 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Video ID</p>
                    <p className="text-sm text-slate-800 font-mono">{result.video_details.video_id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcript Details Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcript Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Word Count</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {result.transcript_details.word_count.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">Chunks Processed</p>
                  <p className="text-2xl font-bold text-slate-800">{result.transcript_details.chunk_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Output Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Study Guide Summary
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Summary
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto bg-slate-50 rounded-lg p-4 border">
                <div
                  className="prose prose-slate max-w-none text-sm"
                  dangerouslySetInnerHTML={{
                    __html: result.summary
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
                      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
                      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                      .replace(/\n\n/g, '</p><p class="mb-3">')
                      .replace(/^(?!<[h|l])/gm, '<p class="mb-3">')
                      .replace(/<p class="mb-3"><\/p>/g, ""),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
