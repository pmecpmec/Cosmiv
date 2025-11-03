import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import { AnimatedContainer, StaggeredList, StaggeredItem } from "./ui/AnimatedContainer";

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
  // Unified file state - replaced clipFile and files with single array
  const [files, setFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [targetDuration, setTargetDuration] = useState(60);
  const [theme, setTheme] = useState("gaming");
  const [format, setFormat] = useState("landscape");
  const [jobId, setJobId] = useState(null);

  const inputRef = useRef(null);

  const THEMES = [
    { id: "gaming", name: "Gaming", description: "Fast-paced action" },
    { id: "cinematic", name: "Cinematic", description: "Epic moments" },
    { id: "energetic", name: "Energetic", description: "High energy" },
  ];

  // Cleanup URLs on unmount
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

  // Unified file validation and acceptance
  const validateAndAcceptFiles = useCallback(
    (fileList) => {
      const newFiles = Array.from(fileList || []);
      if (!newFiles.length) return false;

      // Filter valid files (videos or ZIP)
      const validFiles = newFiles.filter(
        (f) =>
          ACCEPTED_VIDEO_TYPES.includes(f.type) ||
          f.type === "application/zip"
      );

      if (validFiles.length === 0) {
        setError(
          "Please choose video files (MP4, MOV, WEBM, MKV, AVI) or a ZIP archive"
        );
        return false;
      }

      // Check total size
      const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize / (1024 * 1024) > MAX_CLIP_SIZE_MB) {
        setError("Total file size is too large (max 2GB)");
        return false;
      }

      // Set files and update preview
      setError("");
      setStatusMessage("");
      setFiles(validFiles);

      // Preview first video file if available
      const firstVideo = validFiles.find((f) =>
        ACCEPTED_VIDEO_TYPES.includes(f.type)
      );
      if (firstVideo) {
        updatePreview(firstVideo);
      } else {
        updatePreview(null);
      }

      return true;
    },
    []
  );

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
    setFiles([]);
    updatePreview(null);
    clearResultUrl();
    setIsUploading(false);
    setProgress(0);
    setStatusMessage("");
    setError("");
    setJobId(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [clearResultUrl, updatePreview]);

  // Unified drag handlers
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
    validateAndAcceptFiles(event.dataTransfer.files);
  };

  // Unified file input handler
  const handleFileChange = (event) => {
    if (isUploading) return;
    validateAndAcceptFiles(event.target.files);
  };

  // Sync upload (single file, XHR with progress)
  const uploadSync = useCallback(async () => {
    if (!files.length) {
      setError("Please select files");
      return;
    }

    const fileToUpload = files[0]; // Sync upload uses first file only
    setIsUploading(true);
    setProgress(0);
    setError("");
    setStatusMessage("Uploading clip...");
    clearResultUrl();

    const formData = new FormData();
    formData.append("file", fileToUpload);
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

        // Try to parse error response
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
  }, [files, targetDuration, clearResultUrl]);

  // Async v2 upload (multiple files, job polling)
  const uploadAsyncV2 = useCallback(async () => {
    if (!files.length) {
      setError("Please select files");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError("");
    setStatusMessage("Creating job...");
    clearResultUrl();
    setJobId(null);

    try {
      const formData = new FormData();
      formData.append("target_duration", String(targetDuration));
      files.forEach((f) => formData.append("files", f));
      formData.append("formats", "landscape,portrait");
      if (theme) formData.append("style", theme);

      const res = await fetch("/api/v2/jobs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create job");
      }

      const data = await res.json();
      setJobId(data.job_id);
      setStatusMessage("Processing...");

      // Poll job status with progress updates
      let attempts = 0;
      const maxAttempts = 180; // ~6 minutes @ 2s intervals
      const pollInterval = 2000; // 2 seconds

      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, pollInterval));
        attempts++;

        try {
          const statusRes = await fetch(
            `/api/v2/jobs/${data.job_id}/status`
          );
          if (!statusRes.ok) {
            throw new Error("Failed to fetch job status");
          }

          const statusData = await statusRes.json();

          // Update progress from API if available
          if (statusData.progress) {
            const prog =
              typeof statusData.progress === "object"
                ? statusData.progress.percentage
                : statusData.progress;
            setProgress(prog || 0);
          } else {
            // Fallback: estimate progress based on attempts
            setProgress(Math.min(90, 10 + attempts * 2));
          }

          // Check job status
          if (statusData.status === "SUCCESS") {
            setProgress(100);
            break;
          }

          if (statusData.status === "FAILED") {
            let errorMsg = statusData.error || "Job failed";
            if (
              statusData.error_detail &&
              Array.isArray(statusData.error_detail)
            ) {
              const criticalErrors = statusData.error_detail.filter(
                (e) => e.category === "CRITICAL"
              );
              if (criticalErrors.length > 0) {
                errorMsg = criticalErrors.map((e) => e.error).join("; ");
              }
            }
            throw new Error(errorMsg);
          }
        } catch (pollError) {
          // Network error during polling - retry a few times
          if (attempts < 5) {
            continue;
          }
          throw pollError;
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error("Job processing timeout");
      }

      // Fetch download URL for selected format
      const dlRes = await fetch(
        `/api/v2/jobs/${data.job_id}/download?format=${format}`
      );
      if (!dlRes.ok) {
        throw new Error("Failed to get download URL");
      }

      const dlData = await dlRes.json();
      const url = dlData.url || dlData.path;
      if (!url) {
        throw new Error("Download not ready");
      }

      setResultUrl(url);
      setProgress(100);
      setStatusMessage("Highlight ready!");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setProgress(0);
      setStatusMessage("");
    } finally {
      setIsUploading(false);
    }
  }, [files, targetDuration, theme, format, clearResultUrl]);

  const isZipSelected =
    files.length === 1 && files[0]?.type === "application/zip";

  return (
    <div className="broken-planet-card rounded-2xl shadow-2xl p-6 sm:p-8 float">
      <div className="flex flex-col gap-6 lg:gap-10">
        <header className="text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text-cosmic mb-2">
            Create Your Highlight Reel with Cosmiv
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto lg:mx-0">
            Drop in clips or a ZIP archive, tweak the desired highlight
            length, and let Cosmiv handle the rest. We'll process your footage
            and deliver a polished highlight reel.
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
              className={`rounded-2xl border-2 border-dashed transition-all p-8 sm:p-10 flex flex-col items-center justify-center gap-4 text-center broken-planet-card ${
                isDragging
                  ? "border-cosmic-neon-cyan bg-cosmic-violet/20 neon-glow-cyan"
                  : "border-cosmic-neon-cyan/30 bg-white/5 hover:bg-white/10 hover:border-cosmic-neon-cyan hover:neon-glow-cyan"
              } ${isUploading ? "opacity-60 cursor-progress" : "cursor-pointer"}`}
            >
              <input
                ref={inputRef}
                id="clip-upload-input"
                type="file"
                accept="video/*,.zip"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <span className="text-4xl sm:text-5xl">🎞️</span>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-semibold text-white">
                  Drag & drop your clips
                </p>
                <p className="text-sm text-gray-300">
                  or{" "}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-cosmic-violet underline underline-offset-4"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-gray-400">
                  MP4, MOV, WEBM, MKV, AVI or ZIP archive up to 2GB
                </p>
              </div>

              {files.length > 0 && (
                <div className="w-full max-w-sm mx-auto rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-left space-y-2">
                  {files.map((f, idx) => (
                    <div key={idx}>
                      <p
                        className="text-sm font-semibold text-white truncate"
                        title={f.name}
                      >
                        {f.name}
                      </p>
                      <p className="text-xs text-gray-300">
                        {formatBytes(f.size)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Selector */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-4 sm:py-5">
              <label className="text-sm font-semibold text-gray-200 mb-3 block">
                Choose Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    disabled={isUploading}
                    className={`p-3 border-2 rounded-lg transition-all text-sm broken-planet-card ${
                      theme === t.id
                        ? "border-cosmic-neon-cyan bg-cosmic-violet/20 text-cosmic-neon-cyan neon-glow-cyan"
                        : "border-white/20 bg-white/5 text-gray-300 hover:border-cosmic-neon-cyan/50 hover:text-white"
                    } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="font-semibold mb-1">{t.name}</div>
                    <div className="text-xs opacity-70">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="target-duration"
                  className="text-sm font-semibold text-gray-200"
                >
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
                  onChange={(event) =>
                    setTargetDuration(Number(event.target.value))
                  }
                  className="w-full accent-purple-400"
                />
                <div className="flex justify-between text-[11px] text-gray-400 uppercase tracking-wide">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-xs text-gray-400">
                  Adjust to control how long the generated highlight reel
                  should be.
                </div>
                <div className="flex gap-2">
                  {files.length > 0 && (
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
                    onClick={uploadSync}
                    disabled={files.length === 0 || isUploading}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue text-white shadow-lg shadow-cosmic-violet/20 hover:from-cosmic-purple hover:to-cosmic-violet transition disabled:opacity-40 disabled:cursor-not-allowed neon-glow hover:neon-glow-cyan chromatic-aberration"
                  >
                    {isUploading ? "Processing..." : "Sync Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={uploadAsyncV2}
                    disabled={files.length === 0 || isUploading}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cosmic-deep-blue to-cosmic-neon-cyan text-white shadow-lg shadow-cosmic-neon-cyan/20 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed neon-glow-cyan hover:neon-glow-pink chromatic-aberration"
                  >
                    {isUploading ? "Queued..." : "Async V2"}
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

            <ProgressBar
              progress={progress}
              isProcessing={isUploading}
              isComplete={Boolean(resultUrl)}
            />
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 broken-planet-card">
            <h3 className="text-lg font-semibold text-white">Preview</h3>
            {!files.length && !resultUrl && (
              <p className="text-sm text-gray-300">
                Your selected clips will appear here. Drop files to preview
                them instantly and make sure you picked the right footage.
              </p>
            )}

            {previewUrl && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Selected Clip
                </p>
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-xl border border-white/20 bg-black max-h-56"
                />
              </div>
            )}

            {resultUrl && (
              <div className="space-y-3 border-t border-white/10 pt-3">
                <p className="text-xs uppercase tracking-wide text-cosmic-neon-cyan">
                  Processed Highlight
                </p>
                <video
                  src={resultUrl}
                  controls
                  className="w-full rounded-xl border border-cosmic-neon-cyan/40 bg-black max-h-64"
                />
                <div className="flex flex-wrap gap-2">
                  <a
                    href={resultUrl}
                    download="highlight.mp4"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cosmic-violet to-cosmic-deep-blue hover:from-cosmic-purple hover:to-cosmic-violet text-white text-sm font-semibold transition shadow-lg shadow-cosmic-violet/20 neon-glow hover:neon-glow-cyan chromatic-aberration"
                  >
                    Download highlight
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusMessage(
                        "Highlight ready! Share it or download for later."
                      );
                      setResultUrl(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-100 hover:border-white/40 transition"
                  >
                    Create another
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
