import subprocess
import os
from pathlib import Path

def extract_audio(video_path: str) -> str:
    """Extract audio from video file using FFmpeg."""
    output_path = str(Path(video_path).with_suffix('.wav'))
    
    command = [
        'ffmpeg',
        '-i', video_path,
        '-vn',
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        '-y',
        output_path
    ]
    
    subprocess.run(command, check=True, capture_output=True)
    return output_path
