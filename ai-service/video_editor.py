import subprocess
import os

def run_ffmpeg(args):
    command = ["ffmpeg", "-y"] + args
    subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def apply_cinematic_filter(input_path, output_path):
    run_ffmpeg([
        "-i", input_path,
        "-vf", "eq=contrast=1.28:saturation=1.35:brightness=-0.03,vignette=PI/5,drawbox=x=0:y=0:w=iw:h=ih*0.09:color=black@0.95:t=fill,drawbox=x=0:y=ih*0.91:w=iw:h=ih*0.09:color=black@0.95:t=fill",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-c:a", "copy",
        output_path
    ])
    return True

def convert_to_reel(input_path, output_path):
    run_ffmpeg([
        "-i", input_path,
        "-vf", "split[original][copy];[copy]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:20[blurred];[original]scale=1080:1920:force_original_aspect_ratio=decrease[scaled];[blurred][scaled]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2",
        "-c:a", "copy",
        output_path
    ])
    return True

def add_background_music(input_path, output_path, music_path):
    if not os.path.exists(music_path):
        return False

    run_ffmpeg([
        "-i", input_path,
        "-i", music_path,
        "-filter_complex", "[0:a]volume=1.0[a1];[1:a]volume=0.2[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2",
        "-c:v", "copy",
        "-c:a", "aac",
        output_path
    ])
    return True

def blur_background(input_path, output_path):
    run_ffmpeg([
        "-i", input_path,
        "-vf", "boxblur=10:10",
        "-c:a", "copy",
        output_path
    ])
    return True
