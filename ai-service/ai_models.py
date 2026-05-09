import os
import subprocess
import logging

logger = logging.getLogger(__name__)

def generate_subtitles(input_path, output_path):
    try:
        import whisper
        logger.info("Loading Whisper model (base)...")
        model = whisper.load_model("base")
        
        audio_path = "temp_processing/temp_audio.wav"
        subprocess.run(["ffmpeg", "-y", "-i", input_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path], check=True)
        
        logger.info("Transcribing audio...")
        result = model.transcribe(audio_path, fp16=False)
        
        srt_path = "temp_processing/temp_subs.srt"
        with open(srt_path, "w", encoding="utf-8") as srt:
            for i, segment in enumerate(result["segments"]):
                start = segment["start"]
                end = segment["end"]
                text = segment["text"].strip()
                
                def format_time(seconds):
                    hours = int(seconds / 3600)
                    minutes = int((seconds % 3600) / 60)
                    secs = int(seconds % 60)
                    millisecs = int((seconds - int(seconds)) * 1000)
                    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
                
                srt.write(f"{i+1}\n")
                srt.write(f"{format_time(start)} --> {format_time(end)}\n")
                srt.write(f"{text}\n\n")
        
        logger.info("Burning subtitles into video...")
        escaped_srt = srt_path.replace("\\", "/").replace(":", "\\:")
        
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-vf", f"subtitles={escaped_srt}:force_style='FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=1'",
            "-c:a", "copy", output_path
        ], check=True)
        
    except ImportError:
        logger.error("Whisper AI not installed. Skipping subtitles.")
        import shutil
        shutil.copy2(input_path, output_path)
    finally:
        if os.path.exists("temp_processing/temp_audio.wav"):
            os.remove("temp_processing/temp_audio.wav")
        if os.path.exists("temp_processing/temp_subs.srt"):
            os.remove("temp_processing/temp_subs.srt")

def remove_watermark(input_path, output_path):
    logger.info("Removing watermark...")
    try:
        # Simple FFmpeg placeholder (top left corner) for watermark removal
        # True AI inpainting requires LaMa which will be added as an optional advanced step
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-vf", "delogo=x=10:y=10:w=150:h=50",
            "-c:a", "copy", output_path
        ], check=True)
    except subprocess.CalledProcessError:
        logger.warning("Delogo failed. Skipping.")
        import shutil
        shutil.copy2(input_path, output_path)

def enhance_video_quality(input_path, output_path):
    logger.info("Enhancing video quality (Placeholder for Real-ESRGAN)...")
    import shutil
    shutil.copy2(input_path, output_path)

def enhance_faces(input_path, output_path):
    logger.info("Enhancing faces (Placeholder for GFPGAN)...")
    import shutil
    shutil.copy2(input_path, output_path)
