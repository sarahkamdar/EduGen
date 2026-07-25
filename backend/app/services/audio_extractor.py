import subprocess
import os
from pathlib import Path

def extract_audio(video_path: str) -> str:
    """Extract audio from video file using FFmpeg."""
    output_path = str(Path(video_path).with_suffix('.mp3'))
    
    command = [
        'ffmpeg',
        '-i', video_path,
        '-vn',
        '-codec:a', 'libmp3lame',
        '-q:a', '2',
        '-y',
        output_path
    ]
    
    subprocess.run(command, check=True, capture_output=True)
    return output_path
