from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from media_processing import process_zip_highlight
import tempfile, os

app = FastAPI(title="Auto-Editor MVP")

@app.post("/upload")
async def upload_zip(file: UploadFile = File(...), target_duration: int = Form(60)):
    workdir = tempfile.mkdtemp()
    try:
        zip_path = os.path.join(workdir, file.filename)
        with open(zip_path, "wb") as f:
            f.write(await file.read())
        highlight_path = process_zip_highlight(zip_path, target_duration)
        return FileResponse(highlight_path, filename="highlight.mp4", media_type="video/mp4")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
