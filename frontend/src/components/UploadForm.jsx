import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState(null);

  const uploadVideo = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_duration", 60);

    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "highlight.mp4";
    a.click();
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadVideo} disabled={!file}>Upload</button>
    </div>
  );
}
