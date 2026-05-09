<!-- 🎬 AI VIDEO EDITOR - Animated README -->

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?size=30&duration=3500&color=8B5CF6&center=true&vCenter=true&width=900&lines=✨+WELCOME+TO+AI+VIDEO+EDITOR+✨;AI-Powered+Local+Video+Editing+Platform;FastAPI+%2B+React+%2B+FFmpeg+%2B+OpenCV;Smart.+Fast.+Creative.+Responsive." />
</p>

<h1 align="center">🎥 AI Video Editor — AI Powered Smart Video Processing Platform</h1>

<div align="center">

[![Frontend - React](https://img.shields.io/badge/Frontend-Vite%20React-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)]()
[![Backend - FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)]()
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)]()
[![FFmpeg](https://img.shields.io/badge/Processing-FFmpeg-black?style=for-the-badge&logo=ffmpeg&logoColor=green)]()
[![OpenCV](https://img.shields.io/badge/OpenCV-AI%20Vision-red?style=for-the-badge&logo=opencv&logoColor=white)]()
[![AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge&logo=openai&logoColor=white)]()
![API](https://img.shields.io/badge/API-REST-orange?style=for-the-badge)

</div>

---

# 🔴 LIVE DEMO

<p align="center">
  <a href="https://your-demo-link.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀 LIVE DEMO Available-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
</p>

<p align="center">
  <i>Click above to explore the live AI Video Editor demo!</i>
</p>

---

# 🌟 Overview

AI Video Editor is a modern AI-powered local video editing platform that allows users to upload videos and apply intelligent AI-based editing using prompts and quick editing tools.

The platform combines:
- ⚡ FastAPI backend
- 🎨 React + Tailwind frontend
- 🎥 FFmpeg video processing
- 🧠 AI-based prompt editing
- 📦 Local processing support

Users can:
✔ Upload videos  
✔ Apply cinematic effects  
✔ Remove or place watermarks  
✔ Convert videos into reels  
✔ Blur backgrounds  
✔ Enhance faces  
✔ Add subtitles  
✔ Add music  
✔ Preview processed videos  
✔ Download edited output  

---

# 🎥 Main Features

# 🎞 Cinematic Editing
Apply movie-style cinematic effects automatically using AI prompts.

# ✨ Video Enhancement
Improve:
- Sharpness
- Brightness
- Contrast
- Overall quality

# 📱 Reel 9:16 Conversion
Convert landscape videos into:
- Instagram Reels
- YouTube Shorts
- TikTok format

# 🌫 Background Blur
Automatically blur unwanted backgrounds.

# 🧼 Watermark System

Supports:
- WM Top Left
- WM Top Right
- WM Bottom Left
- WM Bottom Right
- WM Center
- WM All Areas

# 🧠 Face Enhancement
AI improves facial clarity automatically.

# 📝 Auto Subtitle Support
Generate subtitle-ready videos.

# 🎵 Music Integration
Add background music easily.

# ⚡ Fast Processing
Uses FFmpeg optimized processing pipeline.

---

# 🎨 UI / UX Features

✨ Modern Dark Theme  
✨ Responsive Layout  
✨ AI Prompt Box  
✨ Smooth Animations  
✨ Preview Panel  
✨ Drag & Drop Upload  
✨ Quick Edit Buttons  
✨ Tailwind UI Components  
✨ Real-Time Processing Feel  

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?size=22&duration=3000&color=38BDF8&center=true&width=650&lines=AI+Powered+Editing.;Modern+Dark+UI.;Fast+FFmpeg+Processing.;Beautiful+Animations.;Fully+Responsive.;" />
</p>

---

# ⚡ Tech Stack

# 🎨 Frontend
- React
- Vite
- Tailwind CSS
- Axios

# 🛠 Backend
- FastAPI
- Python
- REST API
- Uvicorn

# 🎥 Video Processing
- FFmpeg
- MoviePy
- OpenCV
- Pillow

# 🤖 AI System
- AI Prompt Processing
- Smart Video Enhancement
- AI-based Effects

---

# 📁 Project Structure

```text
AI-Video-Editor/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── processing/
│   ├── uploads/
│   ├── outputs/
│   └── utils/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── package.json
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

# ⚙️ Complete Installation & Setup Guide

# 🟦 Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/AI-Video-Editor.git
```

Open project folder:

```bash
cd AI-Video-Editor
```

---

# 🟪 Step 2: Frontend Setup

Move into frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend will start on:

```text
http://localhost:5173
```

---

# 🟩 Step 3: Backend Setup

Move into backend folder:

```bash
cd backend
```

---

# 🟨 Step 4: Create Virtual Environment

## Windows

```bash
python -m venv venv
```

Activate:

```bash
venv\Scripts\activate
```

---

## Mac/Linux

```bash
python3 -m venv venv
```

Activate:

```bash
source venv/bin/activate
```

---

# 🟧 Step 5: Install Python Requirements

Install all required packages:

```bash
pip install -r requirements.txt
```

OR manually:

```bash
pip install fastapi uvicorn python-multipart moviepy ffmpeg-python opencv-python pillow
```

---

# 🎥 Step 6: FFmpeg Installation (VERY IMPORTANT)

Without FFmpeg the project will NOT work.

---

# 🪟 Windows FFmpeg Setup

## Download FFmpeg

Open:

```text
https://www.gyan.dev/ffmpeg/builds/
```

Download:
- release full build

---

## Extract ZIP

Extract into:

```text
C:\ffmpeg
```

---

## Add FFmpeg Path

Path should be:

```text
C:\ffmpeg\bin
```

---

## Add Into Environment Variables

Steps:
1. Open Start Menu
2. Search:
   Environment Variables
3. Open:
   Edit System Environment Variables
4. Open:
   Environment Variables
5. Select:
   Path
6. Click:
   New
7. Paste:

```text
C:\ffmpeg\bin
```

8. Save all windows.

---

# ✅ Verify FFmpeg

Open terminal:

```bash
ffmpeg -version
```

If version appears then FFmpeg setup successful.

---

# ▶️ Step 7: Run Backend Server

Start FastAPI server:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger API Docs:

```text
http://127.0.0.1:8000/docs
```

---

# 🚀 How To Use Application

# 1️⃣ Upload Video

- Click Upload Area
- OR Drag & Drop Video

Supported formats:
- MP4
- MOV
- AVI
- MKV

---

# 2️⃣ Select Quick Edit

Available Quick Buttons:

| Feature | Description |
|---|---|
| Cinematic | Movie style effect |
| Enhance | Improve quality |
| Reel 9:16 | Social media format |
| Background Blur | Blur background |
| WM Top L | Watermark top left |
| WM Top R | Watermark top right |
| WM Bottom L | Watermark bottom left |
| WM Bottom R | Watermark bottom right |
| WM Center | Center watermark |
| WM All Areas | Multiple watermark |
| Face Clear | Enhance face |
| Subtitles | Subtitle support |
| Music | Add background music |

---

# 3️⃣ Enter AI Prompt

Example prompts:

```text
Make it cinematic
```

```text
Remove watermark and add subtitles
```

```text
Convert to reel 9:16 with music
```

```text
Enhance face and blur background
```

```text
Improve quality and add cinematic effect
```

---

# 4️⃣ Process Video

Click:
- Process Button

Backend will:
- Upload file
- Start FFmpeg processing
- Apply AI edits
- Generate output video

Processing Time:
- Small video → 10–30 sec
- Medium video → 1–2 min
- Large HD video → 3–5 min

---

# 5️⃣ Preview & Download

After processing:
- Preview appears automatically
- Click Download button
- Save edited video

---

# 📦 API Documentation

# POST Endpoint

```text
POST /process
```

---

# Form Data

| Key | Type |
|---|---|
| file | Video File |
| prompt | String |
| job_id | String |

---

# Example CURL Request

```bash
curl -X POST "http://127.0.0.1:8000/process" \
-F "file=@video.mp4" \
-F "prompt=make cinematic" \
-F "job_id=123"
```

---

# 🐛 Common Errors & Fixes

# ❌ FFmpeg Not Found

Error:

```text
ffmpeg is not recognized
```

Fix:
- Add FFmpeg path correctly
- Restart terminal

---

# ❌ CORS Error

Add in FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

# ❌ Upload Failed

Fix:
- Use supported format
- Reduce file size
- Check backend running

---

# ❌ Processing Too Slow

Fix:
- Use SSD
- Enable GPU
- Reduce video resolution
- Use shorter clips

---

# 🔐 Security Features

✔ File Validation  
✔ Secure Upload Handling  
✔ Local Video Processing  
✔ API-based Architecture  
✔ Scalable Backend  

---

# ⚡ Recommended System Requirements

| Requirement | Recommended |
|---|---|
| RAM | 8GB+ |
| CPU | Intel i5 / Ryzen 5 |
| GPU | NVIDIA GTX 1650+ |
| Storage | SSD |
| Python | 3.10+ |

---

# 🌍 Deployment Guide

# Frontend Deployment

Recommended:
- Vercel
- Netlify

Build command:

```bash
npm run build
```

---

# Backend Deployment

Recommended:
- Render
- Railway
- VPS
- AWS EC2

Run command:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

# ❤️ Contributing

Create new branch:

```bash
git checkout -b feature-name
```

Commit changes:

```bash
git commit -m "Added new feature"
```

Push code:

```bash
git push origin feature-name
```

Then create Pull Request.

---

# 👨‍💻 Developer

Made with ❤️ using:
- React
- Tailwind CSS
- FastAPI
- FFmpeg
- OpenCV
- MoviePy
- Python
- AI Processing

---

# ⭐ Support

If you like this project then give it a ⭐ on GitHub.

---

# 📜 License

MIT License

---

# 🚀 Future Improvements

Planned Features:
- AI Voice Cloning
- Auto Shorts Generator
- AI Scene Detection
- GPU Acceleration
- Cloud Rendering
- Real-Time Processing
- AI Thumbnail Generator
- AI Caption Generator

---
