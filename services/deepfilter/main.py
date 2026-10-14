import asyncio
import os
import tempfile
import shutil
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from df.enhance import enhance, init_df, load_audio, save_audio
import df.utils

# ── Monkeypatch DeepFilterNet to avoid git dependency in Docker ──────────────
df.utils.get_git_root = lambda: "."
df.utils.get_commit_hash = lambda: "docker-build"

# ── Module-level state ───────────────────────────────────────────────────────
df_model = None
df_state = None

enhance_lock = asyncio.Lock()

ALLOWED_AUDIO_TYPES = {
    "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave",
    "application/octet-stream",
}
ALLOWED_EXTENSIONS = {".wav"}
MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB


# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(_load_models)
    yield


def _load_models() -> None:
    global df_model, df_state

    print("Initialising DeepFilterNet model…")
    df_model, df_state, _ = init_df()
    print("DeepFilterNet ready.")


app = FastAPI(title="AI Help Center – DeepFilter Service", lifespan=lifespan)


# ── Helpers ───────────────────────────────────────────────────────────────────
def _validate_audio(file: UploadFile) -> None:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if file.content_type not in ALLOWED_AUDIO_TYPES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{file.content_type}' (filename: '{file.filename}'). Only WAV files are accepted.",
        )
    if file.size is not None and file.size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
        )


def _safe_remove(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health", tags=["ops"])
def health():
    return {
        "status": "ok",
        "df_model_loaded": df_model is not None,
    }


@app.post("/enhance", tags=["audio"])
async def enhance_audio(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """Denoise / enhance a WAV file using DeepFilterNet."""
    _validate_audio(file)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
        shutil.copyfileobj(file.file, tmp_in)
        input_path = tmp_in.name

    output_path = input_path.replace(".wav", "_enhanced.wav")

    try:
        async with enhance_lock:
            audio, _ = await asyncio.to_thread(load_audio, input_path, df_state.sr())
            enhanced = await asyncio.to_thread(enhance, df_model, df_state, audio)
            await asyncio.to_thread(save_audio, output_path, enhanced, df_state.sr())
    except Exception as exc:
        _safe_remove(input_path)
        _safe_remove(output_path)
        raise HTTPException(status_code=500, detail=str(exc))

    background_tasks.add_task(_safe_remove, input_path)
    background_tasks.add_task(_safe_remove, output_path)

    return FileResponse(output_path, media_type="audio/wav", filename="enhanced.wav")


# ── Dev entry-point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
