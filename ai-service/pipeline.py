import os
import logging
import json
from urllib import error, request
from video_editor import (
    apply_cinematic_filter, 
    convert_to_reel, 
    add_background_music,
    blur_background
)
from ai_models import (
    generate_subtitles,
    remove_watermark,
    enhance_video_quality,
    enhance_faces
)

logger = logging.getLogger(__name__)

STEP_LABELS = {
    "watermark": "Removing watermark",
    "enhance": "Enhancing video quality",
    "face": "Enhancing faces",
    "reel": "Converting to reel format",
    "cinematic": "Applying cinematic filter",
    "blur_bg": "Blurring background",
    "music": "Adding background music",
    "subtitles": "Adding subtitles",
    "fallback_cinematic": "Applying default cinematic edit"
}

SKIP_REASONS = {
    "music": "default_music.mp3 missing",
    "subtitles": "Whisper not installed",
}

def parse_prompt(prompt: str):
    """Extract supported edit intents from English/Hinglish prompts."""
    prompt = " ".join(prompt.lower().replace("-", " ").replace("_", " ").split())

    def has_any(*keywords):
        return any(keyword in prompt for keyword in keywords)

    intents = {
        "subtitles": has_any("subtitle", "subtitles", "caption", "captions", "lyrics", "text", "subtitle lagao", "caption lagao", "caption add", "likh do"),
        "cinematic": has_any("cinematic", "cinemetic", "cinemetyic", "movie", "film", "cinema", "color grade", "colour grade", "dramatic", "moody", "vintage", "filter", "movie jaisa", "cinematic banao", "cinematic karo", "cinema jaisa"),
        "reel": has_any("reel", "short", "shorts", "tiktok", "instagram", "vertical", "portrait", "9:16", "reel banao", "short banao", "vertical karo"),
        "music": has_any("music", "song", "audio", "background music", "bgm", "sound", "gaana", "gana", "music lagao", "song add"),
        "blur_bg": has_any("blur background", "background blur", "blur bg", "bg blur", "piche blur", "background dhundla"),
        "watermark": has_any("watermark", "logo", "youtube", "remove watermark", "watermark hata", "logo hata", "nishan hata"),
        "enhance": has_any("enhance", "quality", "4k", "upscale", "sharpen", "clear", "hd", "improve", "better", "bright", "brightness", "contrast", "color", "colour", "quality badhao", "clear karo", "enhance karo", "bright karo"),
        "face": has_any("face", "gfpgan", "skin", "person", "chehra", "face clear")
    }
    return intents

def parse_watermark_position(prompt: str):
    prompt = " ".join(prompt.lower().replace("-", " ").replace("_", " ").split())

    all_keywords = ["all", "anywhere", "full body", "full frame", "poora", "poore", "kahi bhi", "sab jagah", "har jagah"]
    if any(keyword in prompt for keyword in all_keywords):
        return "all"

    center_keywords = ["center", "centre", "middle", "beech", "beech me", "center me"]
    if any(keyword in prompt for keyword in center_keywords):
        return "center"

    top_keywords = ["top", "upar", "upper"]
    bottom_keywords = ["bottom", "niche", "neeche", "lower"]
    left_keywords = ["left", "baye", "baaye"]
    right_keywords = ["right", "daye", "daaye"]

    has_top = any(keyword in prompt for keyword in top_keywords)
    has_bottom = any(keyword in prompt for keyword in bottom_keywords)
    has_left = any(keyword in prompt for keyword in left_keywords)
    has_right = any(keyword in prompt for keyword in right_keywords)

    if has_top and has_left:
        return "top_left"
    if has_top and has_right:
        return "top_right"
    if has_bottom and has_left:
        return "bottom_left"
    if has_bottom and has_right:
        return "bottom_right"

    if "youtube" in prompt:
        return "bottom_right"

    return "bottom_right"

def process_video(input_path: str, output_path: str, prompt: str, job_id: str, progress_callback_url=None):
    logger.info(f"Starting processing for {input_path}")
    
    intents = parse_prompt(prompt)
    watermark_position = parse_watermark_position(prompt)
    logger.info(f"Parsed intents: {intents}")
    logger.info(f"Parsed watermark position: {watermark_position}")
    
    current_video = input_path
    temp_files = []
    applied_steps = []
    skipped_steps = []
    completed_steps = 0
    last_progress = 0
    step_order = ["watermark", "enhance", "face", "reel", "cinematic", "blur_bg", "music", "subtitles"]
    planned_steps = []

    def send_progress(progress, message, status="PROCESSING"):
        nonlocal last_progress
        if not progress_callback_url:
            return

        progress = max(last_progress, min(100, progress))
        last_progress = progress

        try:
            payload = json.dumps({
                "progressPercentage": progress,
                "message": message,
                "status": status
            }).encode("utf-8")

            progress_request = request.Request(
                progress_callback_url,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            request.urlopen(progress_request, timeout=2).close()
        except (OSError, error.URLError) as exc:
            logger.warning("Could not send progress update: %s", exc)
    
    def get_temp_path(step_name):
        path = f"temp_processing/temp_{job_id}_{step_name}.mp4"
        temp_files.append(path)
        return path

    def apply_step(step_name, processor, *args):
        nonlocal current_video, completed_steps
        label = STEP_LABELS.get(step_name, step_name.replace("_", " ").title())
        start_progress = min(90, 15 + int((completed_steps / max(len(planned_steps), 1)) * 75))
        send_progress(start_progress, label)

        next_video = get_temp_path(step_name)
        result = processor(current_video, next_video, *args)
        completed_steps += 1
        done_progress = min(95, 15 + int((completed_steps / max(len(planned_steps), 1)) * 75))

        if result is False:
            reason = SKIP_REASONS.get(step_name, "required dependency/input missing")
            logger.warning("Skipped %s step because %s.", step_name, reason)
            skipped_steps.append(step_name)
            send_progress(done_progress, f"Skipped {label.lower()} ({reason})")
            return

        if not os.path.exists(next_video) or os.path.getsize(next_video) == 0:
            raise RuntimeError(f"{step_name} step did not create an output video")

        current_video = next_video
        applied_steps.append(step_name)
        send_progress(done_progress, f"Finished {label.lower()}")

    if not any(intents.values()):
        logger.warning("Prompt did not match a supported edit keyword. Applying default cinematic edit.")
        intents["cinematic"] = True

    planned_steps = [step for step in step_order if intents[step]]
    send_progress(10, "AI service received video")

    try:
        if intents["watermark"]:
            logger.info("Applying watermark removal...")
            apply_step("watermark", remove_watermark, watermark_position)

        if intents["enhance"]:
            logger.info("Applying video enhancement...")
            apply_step("enhance", enhance_video_quality)

        if intents["face"]:
            logger.info("Applying face enhancement...")
            apply_step("face", enhance_faces)

        if intents["reel"]:
            logger.info("Converting to reel (9:16)...")
            apply_step("reel", convert_to_reel)

        if intents["cinematic"]:
            logger.info("Applying cinematic filter...")
            apply_step("cinematic", apply_cinematic_filter)

        if intents["blur_bg"]:
            logger.info("Applying background blur...")
            apply_step("blur_bg", blur_background)

        if intents["music"]:
            logger.info("Adding background music...")
            # Using a placeholder file name, this will be skipped if file doesn't exist locally
            apply_step("music", add_background_music, "default_music.mp3")

        if intents["subtitles"]:
            logger.info("Generating and adding subtitles (Whisper AI)...")
            apply_step("subtitles", generate_subtitles)

        if not applied_steps:
            logger.warning("No requested edit could be applied. Applying fallback cinematic edit.")
            planned_steps.append("fallback_cinematic")
            apply_step("fallback_cinematic", apply_cinematic_filter)

        # Final move to output path
        import shutil
        send_progress(97, "Saving final video")
        shutil.copy2(current_video, output_path)
        summary_parts = []
        if applied_steps:
            applied_labels = [STEP_LABELS.get(step, step).lower() for step in applied_steps]
            summary_parts.append(f"Applied: {', '.join(applied_labels)}")
        if skipped_steps:
            skipped_labels = [
                f"{STEP_LABELS.get(step, step).lower()} ({SKIP_REASONS.get(step, 'required dependency/input missing')})"
                for step in skipped_steps
            ]
            summary_parts.append(f"Skipped: {', '.join(skipped_labels)}")

        summary = ". ".join(summary_parts) if summary_parts else "Video ready"
        logger.info(f"Processing complete. {summary}. Saved to {output_path}")
        send_progress(100, summary, "COMPLETED")
        
        return {
            "output_path": output_path,
            "applied_steps": applied_steps,
            "skipped_steps": skipped_steps,
            "message": summary
        }
        
    finally:
        # Cleanup temp files
        for f in temp_files:
            if os.path.exists(f):
                os.remove(f)
