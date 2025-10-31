from typing import List, Dict


def build_censor_filter_chain() -> str:
    # Placeholder mild EQ; kept for compatibility
    return "highpass=f=60, lowpass=f=12000"


def build_profanity_mute_filters(spans: List[Dict]) -> str:
    # Create aasetpts for audio mute around spans using volume enable expressions
    # We'll sum multiple volume filters sequentially
    parts = []
    for s in spans:
        start = float(s.get("start", 0.0))
        end = float(s.get("end", start + 0.5))
        parts.append(f"volume=enable='between(t,{start},{end})':volume=0")
    if not parts:
        return "anull"
    return ",".join(parts)
