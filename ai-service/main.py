import os
import shutil
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
import logging
from pipeline import process_video

app = FastAPI(title="Local AI Video Editor Service")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TEMP_DIR = "temp_processing"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/process")
async def process_video_endpoint(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    job_id: str = Form(...),
    progress_callback_url: Optional[str] = Form(None)
):
    try:
        logger.info(f"Received job {job_id} with prompt: {prompt}")
        
        # Save the uploaded file temporarily
        input_path = os.path.join(TEMP_DIR, f"input_{job_id}_{file.filename}")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "outputs"))
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"output_{job_id}.mp4")

        # Process the video
        result = process_video(
            input_path,
            output_path,
            prompt,
            job_id,
            progress_callback_url=progress_callback_url
        )
        
        # Clean up input
        if os.path.exists(input_path):
            os.remove(input_path)
            
        # Return the actual video file instead of JSON so Java can download it
        return FileResponse(path=output_path, media_type="video/mp4", filename=f"output_{job_id}.mp4")
        
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
