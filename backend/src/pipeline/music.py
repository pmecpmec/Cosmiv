import subprocess


def generate_music_bed(duration: float, output_path: str, freq: int = 220) -> str:
    cmd = [
        "ffmpeg",
        "-y",
        "-f", "lavfi",
        "-t", str(duration),
        "-i", f"sine=frequency={freq}:sample_rate=44100:beep_factor=2",
        "-filter:a", "volume=0.15",
        output_path,
    ]
    subprocess.run(cmd, check=True)
    return output_path


def build_ducking_filter(main_label: str = "a0", music_label: str = "a1") -> str:
    # Sidechain compress: duck music under main audio
    # Requires inputs mapped as [0:a] and [1:a]
    return (
        f"[0:a]aresample=async=1,volume=1.0[{main_label}];"
        f"[1:a]volume=0.4[{music_label}];"
        f"[{music_label}][{main_label}]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=200[amix]"
    )
