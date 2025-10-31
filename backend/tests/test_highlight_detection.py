import pytest

from pipeline import highlight_detection as hd


class DummyModel:
    def detect_events(self, video_path: str):
        return [
            {"time": 1.0, "confidence": 0.9},
            {"time": 10.0, "confidence": 0.2},
        ]


@pytest.fixture(autouse=True)
def stub_dependencies(monkeypatch):
    monkeypatch.setattr(hd, "detect_scenes_seconds", lambda _: [(0.0, 2.0), (2.0, 6.0)])
    monkeypatch.setattr(hd, "motion_score", lambda *args, **kwargs: 5.0)
    monkeypatch.setattr(hd, "estimate_loudness", lambda *args, **kwargs: -10.0)
    monkeypatch.setattr(hd, "get_model", lambda: DummyModel())


def test_heuristic_detector_with_model_boost(monkeypatch):
    detector = hd.HeuristicHighlightDetector(enable_model=True)
    slices = detector.detect(["video.mp4"], target_duration=3)
    assert slices, "Detector should return at least one slice"
    first = slices[0]
    assert first.start == pytest.approx(0.0)
    assert 0 < first.duration <= 4.0
    # Score should include model boost
    boosted_score = detector.motion_weight * 5.0 + detector.loudness_weight * max(0.0, 30 - 10) + detector.model_weight * 0.9
    assert first.score == pytest.approx(boosted_score, rel=0.1)


def test_get_highlight_detector_defaults_to_heuristic(monkeypatch):
    monkeypatch.setattr(hd.settings, "HIGHLIGHT_DETECTOR", "unknown")
    detector = hd.get_highlight_detector()
    assert isinstance(detector, hd.HeuristicHighlightDetector)
