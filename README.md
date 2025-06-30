# lecturesummarizer

## 📚 YouTube Video Summarizer

Transform any YouTube video into a concise, comprehensive study guide using AI.

---

### 🚀 **Features**

✅ Enter a YouTube URL and generate a summary
✅ Supports multiple output languages (e.g., English, Tamil)
✅ Displays video details (title, duration, ID)
✅ Provides transcript statistics (word count, chunk count)
✅ Copy summary to clipboard or download as Markdown

---

### 🛠️ **Tech Stack**

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Shadcn/ui
* **Icons:** Lucide-react
* **Backend:** FastAPI (Python)
* **Model:** OpenAI LLM / Whisper for transcript & summarization

---

### ⚙️ **Getting Started**

1. **Clone this repo**

   ```bash
   git clone https://github.com/koushikkb12/lecturesummarizer.git
   cd lecturesummarizer
   ```

2. **Install frontend dependencies**

   ```bash
   cd youtube-summarizer-frontend
   npm install
   ```

3. **Run frontend**

   ```bash
   npm run dev
   ```

4. **Run backend**

   ```bash
   # In a separate terminal
   d youtube-summarizer-backend
   uvicorn main:app --reload --port 8000
   ```

5. Open [http://localhost:3000](http://localhost:3000) and start summarizing!

---

### 📄 **Project Structure**

```
.
├── youtube-summarizer-frontend/   # Next.js frontend
├── youtube-summarizer-backend/    # FastAPI backend
├── README.md                      # Project README
```

---

### ✅ **To Do**

* [ ] Add authentication
* [ ] Support more languages
* [ ] Deploy to Vercel & Render

---

### 👨‍💻 **Author**

* [Koushik Babu](https://github.com/koushikkb12)

---

### 📜 **License**

This project is licensed under the MIT License.

---

If you’d like, I can create the actual `README.md` file for you — just say **“Yes, make it for me!”** and I’ll format it ready-to-paste. 🚀
