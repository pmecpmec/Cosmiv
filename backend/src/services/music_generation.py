"""
AI Music Generation Service
Supports multiple backends: MusicGen (Meta), API services, or improved procedural fallback
"""

import os
import subprocess
import logging
import tempfile
from typing import Optional, Dict, Any
from config import settings

logger = logging.getLogger(__name__)

# Music generation backends
MUSICGEN_ENABLED = os.getenv("MUSICGEN_ENABLED", "false").lower() == "true"
SUNO_API_ENABLED = os.getenv("SUNO_API_ENABLED", "false").lower() == "true"
SUNO_API_KEY = os.getenv("SUNO_API_KEY", "")
SUNO_API_URL = os.getenv("SUNO_API_URL", "https://api.suno.ai/v1")
MUBERT_API_ENABLED = os.getenv("MUBERT_API_ENABLED", "false").lower() == "true"
MUBERT_API_KEY = os.getenv("MUBERT_API_KEY", "")
MUBERT_API_URL = os.getenv("MUBERT_API_URL", "https://api.mubert.com/v2")


class MusicGenerator:
    """Unified music generation interface"""

    @staticmethod
    def generate(
        duration: float,
        output_path: str,
        style: Optional[str] = None,
        tempo: Optional[str] = None,
        mood: Optional[str] = None,
    ) -> str:
        """
        Generate music using the best available backend.

        Args:
            duration: Duration in seconds
            output_path: Output file path
            style: Music style (e.g., "electronic", "rock", "cinematic", "gaming")
            tempo: Tempo hint (e.g., "fast", "medium", "slow")
            mood: Mood hint (e.g., "energetic", "calm", "epic")

        Returns:
            Path to generated music file
        """
        # Build prompt from parameters
        prompt = MusicGenerator._build_prompt(style, tempo, mood)

        # Try AI backends in order of preference
        if MUSICGEN_ENABLED:
            try:
                return MusicGenerator._generate_musicgen(duration, output_path, prompt)
            except Exception as e:
                logger.warning(f"MusicGen failed: {str(e)}, trying fallback")

        if SUNO_API_ENABLED and SUNO_API_KEY:
            try:
                return MusicGenerator._generate_suno(duration, output_path, prompt)
            except Exception as e:
                logger.warning(f"Suno API failed: {str(e)}, trying fallback")

        if MUBERT_API_ENABLED and MUBERT_API_KEY:
            try:
                return MusicGenerator._generate_mubert(duration, output_path, prompt)
            except Exception as e:
                logger.warning(f"Mubert API failed: {str(e)}, trying fallback")

        # Fallback to improved procedural generation
        logger.info("Using improved procedural music generation")
        return MusicGenerator._generate_procedural(duration, output_path, prompt)

    @staticmethod
    def _build_prompt(
        style: Optional[str], tempo: Optional[str], mood: Optional[str]
    ) -> str:
        """Build a descriptive prompt for AI generation"""
        parts = []
        if style:
            parts.append(style)
        if mood:
            parts.append(mood)
        if tempo:
            parts.append(f"{tempo} tempo")

        if not parts:
            return "energetic gaming background music, electronic, upbeat"

        return ", ".join(parts) + ", instrumental background music"

    @staticmethod
    def _generate_musicgen(duration: float, output_path: str, prompt: str) -> str:
        """
        Generate music using Meta's MusicGen model via Hugging Face
        Requires: pip install transformers torch audio
        """
        try:
            from transformers import AutoProcessor, MusicgenForConditionalGeneration
            import torch
            import torchaudio
        except ImportError:
            raise Exception(
                "MusicGen dependencies not installed. Install: pip install transformers torch torchaudio"
            )

        logger.info(f"Generating music with MusicGen: {prompt} ({duration}s)")

        # Load model (cache on first use)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = MusicgenForConditionalGeneration.from_pretrained(
            "facebook/musicgen-small",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        )
        model.to(device)
        processor = AutoProcessor.from_pretrained("facebook/musicgen-small")

        # Generate
        inputs = processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        ).to(device)

        # Generate audio (MusicGen outputs ~5s at a time, we need to loop)
        sample_rate = 32000  # MusicGen's sample rate
        total_samples = int(duration * sample_rate)
        generated_audio = []

        samples_per_chunk = int(5 * sample_rate)  # 5 seconds per generation
        num_chunks = int(duration / 5) + (1 if duration % 5 > 0 else 0)

        for i in range(num_chunks):
            audio_values = model.generate(
                **inputs, max_new_tokens=samples_per_chunk, do_sample=True
            )
            generated_audio.append(audio_values[0, 0].cpu().numpy())

        # Concatenate chunks
        import numpy as np

        full_audio = np.concatenate(generated_audio)[:total_samples]

        # Convert to 44100 Hz and mono
        full_audio = torch.tensor(full_audio).unsqueeze(0)
        if full_audio.shape[0] > 1:
            full_audio = torch.mean(full_audio, dim=0, keepdim=True)  # Convert to mono
        full_audio = torchaudio.functional.resample(full_audio, sample_rate, 44100)

        # Save to temporary WAV file first
        temp_wav = output_path.replace(".mp3", "_temp.wav")
        torchaudio.save(temp_wav, full_audio, 44100)

        # Convert to MP3
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                temp_wav,
                "-acodec",
                "libmp3lame",
                "-b:a",
                "192k",
                "-ar",
                "44100",
                "-ac",
                "1",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
        os.remove(temp_wav)

        logger.info(f"MusicGen generation complete: {output_path}")
        return output_path

    @staticmethod
    def _generate_suno(duration: float, output_path: str, prompt: str) -> str:
        """
        Generate music using Suno API (if available)
        Note: Suno API may require paid subscription
        """
        import requests

        logger.info(f"Generating music with Suno API: {prompt}")

        # Suno API endpoint (example - actual API may differ)
        url = f"{SUNO_API_URL}/generate"
        headers = {
            "Authorization": f"Bearer {SUNO_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "prompt": prompt,
            "duration": int(duration),
            "format": "mp3",
        }

        response = requests.post(url, json=payload, headers=headers, timeout=120)
        response.raise_for_status()

        data = response.json()
        audio_url = data.get("audio_url") or data.get("url")

        if not audio_url:
            raise Exception("Suno API did not return audio URL")

        # Download audio
        audio_response = requests.get(audio_url, timeout=60)
        audio_response.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(audio_response.content)

        logger.info(f"Suno API generation complete: {output_path}")
        return output_path

    @staticmethod
    def _generate_mubert(duration: float, output_path: str, prompt: str) -> str:
        """
        Generate music using Mubert API
        Note: Mubert API may require paid subscription
        """
        import requests

        logger.info(f"Generating music with Mubert API: {prompt}")

        # Mubert API endpoint
        url = f"{MUBERT_API_URL}/generate"
        headers = {
            "Authorization": f"Bearer {MUBERT_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "prompt": prompt,
            "duration": int(duration),
            "format": "mp3",
        }

        response = requests.post(url, json=payload, headers=headers, timeout=120)
        response.raise_for_status()

        data = response.json()
        audio_url = (
            data.get("audio_url") or data.get("url") or data.get("data", {}).get("url")
        )

        if not audio_url:
            raise Exception("Mubert API did not return audio URL")

        # Download audio
        audio_response = requests.get(audio_url, timeout=60)
        audio_response.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(audio_response.content)

        logger.info(f"Mubert API generation complete: {output_path}")
        return output_path

    @staticmethod
    def _generate_procedural(duration: float, output_path: str, prompt: str) -> str:
        """
        Improved procedural music generation using FFmpeg
        Creates multi-layered, evolving music bed
        """
        logger.info(f"Generating procedural music: {prompt} ({duration}s)")

        # Extract style hints from prompt
        is_energetic = (
            "energetic" in prompt.lower()
            or "gaming" in prompt.lower()
            or "fast" in prompt.lower()
        )
        is_calm = "calm" in prompt.lower() or "slow" in prompt.lower()

        # Determine base frequency and chord progression
        if is_energetic:
            # Minor pentatonic in A: A, C, D, E, G (frequencies)
            base_freq = 220  # A3
            chords = [220, 262, 294, 330, 392]  # A, C, D, E, G
            tempo_divisor = 2  # Faster
        elif is_calm:
            base_freq = 165  # E3
            chords = [165, 196, 220, 262, 294]  # E, G, A, C, D (more mellow)
            tempo_divisor = 4  # Slower
        else:
            base_freq = 220
            chords = [220, 262, 294, 330, 392]
            tempo_divisor = 3

        # Create complex filter chain for multi-layered music
        # Layer 1: Base chord progression (changes every 8 seconds)
        # Layer 2: Melodic line (sine wave with slow LFO)
        # Layer 3: Bass line (octave down)
        # Layer 4: Percussion-like element (short bursts)

        filter_complex = []
        inputs = []

        # Generate each layer
        chunk_duration = 8.0
        num_chunks = int(duration / chunk_duration) + (
            1 if duration % chunk_duration > 0 else 0
        )

        temp_dir = tempfile.gettempdir()
        temp_files = []

        for chunk_idx in range(num_chunks):
            chunk_start = chunk_idx * chunk_duration
            chunk_dur = min(chunk_duration, duration - chunk_start)

            if chunk_dur <= 0:
                break

            # Select chord for this chunk (cycle through)
            chord_freq = chords[chunk_idx % len(chords)]

            # Layer 1: Chord base
            temp1 = os.path.join(temp_dir, f"aiditor_layer1_{chunk_idx}.wav")
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-f",
                    "lavfi",
                    "-i",
                    f"sine=frequency={chord_freq}:duration={chunk_dur}:sample_rate=44100",
                    "-af",
                    "volume=0.12,lowpass=f=800",
                    temp1,
                ],
                check=False,
            )
            temp_files.append(temp1)

            # Layer 2: Melodic line (5th above with vibrato)
            temp2 = os.path.join(temp_dir, f"aiditor_layer2_{chunk_idx}.wav")
            melodic_freq = chord_freq * 1.5  # Perfect 5th
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-f",
                    "lavfi",
                    "-i",
                    f"sine=frequency={melodic_freq}:duration={chunk_dur}:sample_rate=44100",
                    "-af",
                    "volume=0.08,vibrato=f=4.5:d=0.3",
                    temp2,
                ],
                check=False,
            )
            temp_files.append(temp2)

            # Layer 3: Bass (octave down)
            temp3 = os.path.join(temp_dir, f"aiditor_layer3_{chunk_idx}.wav")
            bass_freq = chord_freq / 2
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-f",
                    "lavfi",
                    "-i",
                    f"sine=frequency={bass_freq}:duration={chunk_dur}:sample_rate=44100",
                    "-af",
                    "volume=0.15,lowpass=f=200",
                    temp3,
                ],
                check=False,
            )
            temp_files.append(temp3)

        # Concatenate all chunks for each layer
        concat_files = {}
        for layer in [1, 2, 3]:
            concat_list = os.path.join(temp_dir, f"aiditor_concat_layer{layer}.txt")
            with open(concat_list, "w") as f:
                for chunk_idx in range(num_chunks):
                    temp = os.path.join(
                        temp_dir, f"aiditor_layer{layer}_{chunk_idx}.wav"
                    )
                    if os.path.exists(temp):
                        # Normalize path for concat file
                        normalized_path = (
                            temp.replace("\\", "/") if os.name == "nt" else temp
                        )
                        f.write(f"file '{normalized_path}'\n")

            concat_out = os.path.join(temp_dir, f"aiditor_layer{layer}_full.wav")
            if os.path.exists(concat_list):
                subprocess.run(
                    [
                        "ffmpeg",
                        "-y",
                        "-f",
                        "concat",
                        "-safe",
                        "0",
                        "-i",
                        concat_list,
                        "-acodec",
                        "pcm_s16le",
                        concat_out,
                    ],
                    check=False,
                    capture_output=True,
                )
                if os.path.exists(concat_out):
                    concat_files[layer] = concat_out

        # Mix all layers together
        filter_parts = []
        input_count = 0

        for layer, file_path in concat_files.items():
            inputs.extend(["-i", file_path])
            filter_parts.append(f"[{input_count}:a]volume=1.0[a{input_count}]")
            input_count += 1

        if len(filter_parts) > 1:
            # Mix layers with volume balancing
            mix_inputs = "".join([f"[a{i}]" for i in range(len(filter_parts))])
            filter_complex_str = (
                ";".join(filter_parts)
                + f";{mix_inputs}amix=inputs={len(filter_parts)}:duration=longest:dropout_transition=0[out]"
            )
        else:
            filter_complex_str = filter_parts[0] + "[out]"

        # Add fade in/out and normalize
        filter_complex_str += (
            ";[out]afade=t=in:st=0:d=1,afade=t=out:st={}:d=1,volume=0.2[final]".format(
                max(0, duration - 1)
            )
        )

        # Final mix
        cmd = (
            [
                "ffmpeg",
                "-y",
            ]
            + inputs
            + [
                "-filter_complex",
                filter_complex_str,
                "-map",
                "[final]",
                "-ar",
                "44100",
                "-ac",
                "1",
                "-acodec",
                "libmp3lame",
                "-b:a",
                "128k",
                "-t",
                str(duration),
                output_path,
            ]
        )

        subprocess.run(cmd, check=True, capture_output=True)

        # Cleanup temp files
        cleanup_files = temp_files + list(concat_files.values())
        for layer in [1, 2, 3]:
            cleanup_files.append(
                os.path.join(temp_dir, f"aiditor_concat_layer{layer}.txt")
            )

        for temp_file in cleanup_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except:
                pass

        logger.info(f"Procedural music generation complete: {output_path}")
        return output_path


# Backward compatibility wrapper
def generate_music_bed(
    duration: float, output_path: str, freq: int = 220, style: Optional[str] = None
) -> str:
    """
    Generate music bed (wrapper for backward compatibility)

    Args:
        duration: Duration in seconds
        output_path: Output file path
        freq: Frequency hint (deprecated, use style instead)
        style: Music style (e.g., "electronic", "gaming", "cinematic")
    """
    # Map old freq parameter to style if needed
    if not style:
        if freq > 300:
            style = "energetic"
        elif freq < 180:
            style = "calm"
        else:
            style = "gaming"

    return MusicGenerator.generate(
        duration=duration,
        output_path=output_path,
        style=style,
        tempo="medium",
        mood="energetic" if "energetic" in style else "balanced",
    )
