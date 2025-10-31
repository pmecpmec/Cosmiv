import { useState } from "react";
import ProgressBar from "./ProgressBar";

const THEMES = [
  { id: "cinematic", name: "Cinematic", description: "Slow, dramatic, movie-like" },
  { id: "esports", name: "Esports Fast-Cut", description: "Fast-paced, energetic" },
  { id: "chill", name: "Chill Montage", description: "Relaxed, smooth transitions" },
];

export default function UploadForm() {
  const [files, setFiles] = useState([]);
  const [targetDuration, setTargetDuration] = useState(60);
  const [theme, setTheme] = useState("cinematic");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [asyncMode, setAsyncMode] = useState(true);
  const [format, setFormat] = useState("landscape");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    handlePickedFiles(dropped);
  };

  const handlePickedFiles = (picked) => {
    const acceptedVideoTypes = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm", "video/avi", "video/m4v"];
    const isZip = picked.length === 1 && picked[0].type === "application/zip";
    const areVideos = picked.length > 0 && picked.every((f) => acceptedVideoTypes.includes(f.type));

    if (!isZip && !areVideos) {
      setError("Please select a ZIP or one/more video files (mp4/mov/mkv/webm)");
      setFiles([]);
      return;
    }

    setError(null);
    setFiles(picked);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    handlePickedFiles(selected);
  };

  const uploadVideo = async () => {
    if (!files.length) {
      setError("Please select files");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append("target_duration", targetDuration);

      let endpoint = "/api/upload";

      if (files.length === 1 && files[0].type === "application/zip") {
        formData.append("file", files[0]);
      } else {
        endpoint = "/api/upload-clips";
        for (const f of files) {
          formData.append("files", f);
        }
      }

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadAsyncV2 = async () => {
    if (!files.length) {
      setError("Please select files");
      return;
    }
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setJobId(null);

    try {
      const formData = new FormData();
      formData.append("target_duration", targetDuration);
      for (const f of files) formData.append("files", f);
      formData.append("formats", "landscape,portrait");

      const res = await fetch("/api/v2/jobs", { method: "POST", body: formData });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create job");
      }
      const data = await res.json();
      setJobId(data.job_id);

      // Poll status
      let attempts = 0;
      const maxAttempts = 180; // ~6 minutes @ 2s intervals
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
        const st = await fetch(`/api/v2/jobs/${data.job_id}/status`);
        const stData = await st.json();
        if (typeof stData.progress === "number") {
          setProgress(Math.min(95, Math.max(10, stData.progress)));
        } else {
          setProgress((prev) => Math.min(90, Math.max(prev, 10 + attempts)));
        }
        if (stData.status === "SUCCESS") break;
        if (stData.status === "FAILED") throw new Error(stData.error || "Job failed");
      }

      // Fetch download URL for selected format
      const dl = await fetch(`/api/v2/jobs/${data.job_id}/download?format=${format}`);
      const dlData = await dl.json();
      const url = dlData.url || dlData.path;
      if (!url) throw new Error("Download not ready");
      setResultUrl(url);
      setProgress(100);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadVideo = () => {
    if (resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = "highlight.mp4";
      a.click();
    }
  };

  const isZipSelected = files.length === 1 && files[0].type === "application/zip";

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Create Your Highlight Reel
      </h2>

      {/* Theme Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Choose Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              disabled={isUploading}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === t.id
                  ? "border-purple-400 bg-purple-500/20"
                  : "border-white/20 hover:border-white/40"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="font-semibold text-white text-sm mb-1">{t.name}</div>
              <div className="text-xs text-gray-400">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Target Duration: {targetDuration} seconds
        </label>
        <input
          type="range"
          min="30"
          max="120"
          step="10"
          value={targetDuration}
          onChange={(e) => setTargetDuration(parseInt(e.target.value))}
          disabled={isUploading}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>30s</span>
          <span>120s</span>
        </div>
      </div>

      {/* File Upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all mb-6 ${
          isDragging
            ? "border-purple-400 bg-purple-500/10"
            : "border-white/30 bg-white/5"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/10"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".zip,video/*"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        {files.length === 0 && (
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-5xl mb-4">📦</div>
            <div className="text-white font-semibold mb-2">
              Drag & drop a ZIP or video files
            </div>
            <div className="text-gray-400 text-sm">or click to browse</div>
          </label>
        )}
        {files.length > 0 && (
          <div className="text-white">
            <div className="text-3xl mb-2">✓</div>
            <div className="font-semibold">
              {isZipSelected ? files[0].name : `${files.length} video file(s) selected`}
            </div>
            {!isZipSelected && (
              <ul className="text-xs text-gray-400 mt-2 max-h-24 overflow-auto text-left mx-auto" style={{maxWidth:'28rem'}}>
                {files.slice(0,5).map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
                {files.length > 5 && <li>+ {files.length - 5} more...</li>}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Format selector for v2 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">Output Format</label>
        <div className="flex gap-2">
          {(["landscape","portrait"]).map((f) => (
            <button key={f} type="button" onClick={() => setFormat(f)} disabled={isUploading}
              className={`px-3 py-2 rounded-lg border ${format===f?"border-purple-400 bg-purple-500/20":"border-white/20 hover:border-white/40"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        <button onClick={uploadVideo} disabled={files.length===0 || isUploading}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 rounded-xl transition-all hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isUploading?<>⏳ Synchronous...</>:<>⚡ Sync (MVP) Download</>}
        </button>
        <button onClick={uploadAsyncV2} disabled={files.length===0 || isUploading}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold py-4 rounded-xl transition-all hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isUploading?<>⏳ Queued...</>:<>🚀 Async (v2) Render</>}
        </button>
      </div>

      {/* Progress */}
      <ProgressBar progress={progress} isProcessing={isUploading} isComplete={resultUrl !== null} />

      {/* Result Preview */}
      {resultUrl && (
        <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-green-400 font-semibold flex items-center gap-2">
              <span>✓</span> <span>Your highlight is ready!</span>
            </div>
            <a href={resultUrl} target="_blank" rel="noreferrer"
               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all">
              Open
            </a>
          </div>
          <video src={resultUrl} controls className="w-full rounded-lg" style={{ maxHeight: "400px" }} />
        </div>
      )}
    </div>
  );
}

