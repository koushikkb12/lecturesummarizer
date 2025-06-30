from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
import openai
import os
import re
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Create FastAPI app
app = FastAPI()

# Allow frontend access from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Request model
class VideoInput(BaseModel):
    youtube_url: str
    language: str

# Health check (optional)
@app.get("/ping")
def ping():
    return {"message": "pong"}

# Main summarization endpoint
@app.post("/summarize")
async def summarize(input: VideoInput):
    try:
        print("Received request:", input.dict())  # log input

        match = re.search(r"(?:v=|be/)([\w-]+)", input.youtube_url)
        video_id = match.group(1) if match else None
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")

        print("Video ID:", video_id)  # log extracted ID

        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        print("Transcript fetched")

        text = " ".join([t['text'] for t in transcript])
        print("Transcript processed, sending to OpenAI...")

        from openai import OpenAI

        client = OpenAI()

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful study guide creator."},
                {"role": "user", "content": f"Summarize this video in {input.language}:\n{text}"}
            ]
        )
        summary = response.choices[0].message.content


        return {
            "video_details": {
                "title": "Mock Title",
                "video_id": video_id,
                "duration": "Unknown",
            },
            "transcript_details": {
                "word_count": len(text.split()),
                "chunk_count": 1,
            },
            "summary": summary
        }

    except Exception as e:
        print("🔥 ERROR:", str(e))  # log the real issue
        raise HTTPException(status_code=500, detail=str(e))


    except Exception as e:
        print("Error in /summarize:", e)
    raise HTTPException(status_code=500, detail=str(e))
