import { useState, useCallback, useEffect, useRef } from "react";
import ProgressBar from "./ProgressBar";

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
  "video/avi",
  "video/m4v",
];

const MAX_CLIP_SIZE_MB = 2048; // 2GB safeguard for browser uploads

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export default function UploadForm() {
  const [clipFile, setClipFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [targetDuration, setTargetDuration] = useState(60);

  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [previewUrl, resultUrl]);

  const clearResultUrl = useCallback(() => {
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const updatePreview = useCallback((file) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const resetState = useCallback(() => {
    setClipFile(null);
    updatePreview(null);
    clearResultUrl();
    setIsUploading(false);
    setProgress(0);
    setStatusMessage("");
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [clearResultUrl, updatePreview]);

  const acceptFile = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      const video = files.find((f) => ACCEPTED_VIDEO_TYPES.includes(f.type));
      if (!video) {
        setError("Please choose a video file (MP4, MOV, WEBM, MKV, AVI)");
        return;
      }

      if (video.size / (1024 * 1024) > MAX_CLIP_SIZE_MB) {
        setError("Clip is too large to upload via browser");
        return;
      }

      setError("");
      setStatusMessage("");
      clearResultUrl();
      setClipFile(video);
      setProgress(0);
      updatePreview(video);
    },
    [clearResultUrl, updatePreview]
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isUploading) return;
    setIsDragging(false);
    acceptFile(event.dataTransfer.files);
  };

  const handleFileChange = (event) => {
    if (isUploading) return;
    acceptFile(event.target.files);
  };

  const handleUpload = useCallback(() => {
    if (!clipFile) {
      setError("Select a clip before uploading");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError("");
    setStatusMessage("Uploading clip...");
    clearResultUrl();

    const formData = new FormData();
    formData.append("file", clipFile);
    formData.append("target_duration", String(targetDuration));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      } else {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setProgress(0);
      setStatusMessage("");
      setError("Upload failed. Check your connection and try again.");
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setProgress(100);
        setIsUploading(false);
        setStatusMessage("Highlight ready!");

        const blob = xhr.response;
        setResultUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return blob ? URL.createObjectURL(blob) : null;
        });
      } else {
        setIsUploading(false);
        setProgress(0);
        setStatusMessage("");

        if (xhr.response) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const parsed = JSON.parse(reader.result || "{}");
              setError(parsed.error || "Upload failed. Please try again.");
            } catch (err) {
              setError("Upload failed. Please try again.");
            }
          };
          reader.readAsText(xhr.response);
        } else {
          setError("Upload failed. Please try again.");
        }
      }
    };

    xhr.send(formData);
  }, [clipFile, clearResultUrl, targetDuration]);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:gap-10">
        <header className="text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Upload Your Clip
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto lg:mx-0">
            Drop in a single clip, tweak the desired highlight length, and let Aiditor handle the rest. We’ll process your footage and deliver a polished highlight reel.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
          <section className="flex flex-col gap-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className={`rounded-2xl border-2 border-dashed transition-all p-8 sm:p-10 flex flex-col items-center justify-center gap-4 text-center ${
                isDragging
                  ? "border-purple-400 bg-purple-500/20"
                  : "border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/40"
              } ${isUploading ? "opacity-60 cursor-progress" : "cursor-pointer"}`}
            >
              <input
                ref={inputRef}
                id="clip-upload-input"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <span className="text-4xl sm:text-5xl">🎞️</span>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-semibold text-white">
                  Drag & drop your clip
                </p>
                <p className="text-sm text-gray-300">
                  or <button type="button" onClick={() => inputRef.current?.click()} className="text-purple-300 underline underline-offset-4">browse files</button>
                </p>
                <p className="text-xs text-gray-400">MP4, MOV, WEBM, MKV, AVI up to 2GB</p>
              </div>

              {clipFile && (
                <div className="w-full max-w-sm mx-auto rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-left">
                  <p className="text-sm font-semibold text-white truncate" title={clipFile.name}>
                    {clipFile.name}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatBytes(clipFile.size)}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="target-duration" className="text-sm font-semibold text-gray-200">
                  Target highlight duration — {targetDuration} seconds
                </label>
                <input
                  id="target-duration"
                  type="range"
                  min="30"
                  max="180"
                  step="10"
                  value={targetDuration}
                  disabled={isUploading}
                  onChange={(event) => setTargetDuration(Number(event.target.value))}
                  className="w-full accent-purple-400"
                />
                <div className="flex justify-between text-[11px] text-gray-400 uppercase tracking-wide">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-xs text-gray-400">
                  Adjust to control how long the generated highlight reel should be.
                </div>
                <div className="flex gap-2">
                  {clipFile && (
                    <button
                      type="button"
                      onClick={resetState}
                      disabled={isUploading}
                      className="px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-200 hover:border-white/40 transition disabled:opacity-50"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!clipFile || isUploading}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Create Highlight"}
                  </button>
                </div>
              </div>
            </div>

            {(error || statusMessage) && (
              <div
                className={`rounded-xl px-4 py-3 text-sm border ${
                  error
                    ? "border-red-500/40 bg-red-500/10 text-red-200"
                    : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                }`}
                data-testid="upload-status"
              >
                {error ? `⚠️ ${error}` : statusMessage}
              </div>
            )}

            <ProgressBar progress={progress} isProcessing={isUploading} isComplete={Boolean(resultUrl)} />
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white">Clip Preview</h3>
            {!clipFile && !resultUrl && (
              <p className="text-sm text-gray-300">
                Your selected clip will appear here. Drop a file to preview it instantly and make sure you picked the right footage.
              </p>
            )}

            {previewUrl && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-400">Selected Clip</p>
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-xl border border-white/20 bg-black max-h-56"
                />
              </div>
            )}

            {resultUrl && (
              <div className="space-y-3 border-t border-white/10 pt-3">
                <p className="text-xs uppercase tracking-wide text-green-300">Processed Highlight</p>
                <video
                  src={resultUrl}
                  controls
                  className="w-full rounded-xl border border-green-400/40 bg-black max-h-64"
                />
                <div className="flex flex-wrap gap-2">
                  <a
                    href={resultUrl}
                    download="highlight.mp4"
                    className="px-4 py-2 rounded-lg bg-green-500/90 hover:bg-green-500 text-white text-sm font-semibold transition"
                  >
                    Download highlight
                  </a>
                  <button
                    type="button"
                    onClick={() => setStatusMessage("Highlight ready! Share it or download for later.")}
                    className="px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-100 hover:border-white/40 transition"
                  >
                    Keep editing
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

