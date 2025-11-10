"""
Music generation pipeline module
Supports both simple FFmpeg generation and AI-powered generation via services.music_generation
"""

from pipeline.utils.ffmpeg import run_ffmpeg

try:
    from services.music_generation import generate_music_bed as ai_generate_music_bed

    HAS_AI_MUSIC = True
except ImportError:
    HAS_AI_MUSIC = False


def generate_music_bed(
    duration: float, output_path: str, freq: int = 220, style: str = None
) -> str:
    """Generate music bed - uses AI if available, falls back to FFmpeg sine wave"""
    if HAS_AI_MUSIC and style:
        try:
            return ai_generate_music_bed(duration, output_path, style)
        except Exception:
            pass  # Fall back to simple generation

    # Simple FFmpeg-based generation
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "lavfi",
        "-t",
        str(duration),
        "-i",
        f"sine=frequency={freq}:sample_rate=44100:beep_factor=2",
        "-filter:a",
        "volume=0.15",
        output_path,
    ]
    run_ffmpeg(cmd)
    return output_path


def build_ducking_filter(main_label: str = "a0", music_label: str = "a1") -> str:
    # Sidechain compress: duck music under main audio
    # Requires inputs mapped as [0:a] and [1:a]
    return (
        f"[0:a]aresample=async=1,volume=1.0[{main_label}];"
        f"[1:a]volume=0.4[{music_label}];"
        f"[{music_label}][{main_label}]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=200[amix]"
    )
