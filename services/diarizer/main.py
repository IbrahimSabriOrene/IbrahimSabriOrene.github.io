# =============================================================================
# DIARIZER SERVICE — CURRENTLY INACTIVE
# =============================================================================
# Speaker diarization via Pyannote.audio has been DISABLED and this container
# is excluded from the Docker Compose `audio` profile.
#
# REASON: Pyannote.audio (speaker-diarization-3.1) requires a dedicated
# CUDA-capable GPU with ≥ 8 GB VRAM to operate at any practical speed.
# On CPU-only hardware it runs at 10–30× real-time, making it completely
# unsuitable for production workloads.
#
# The service code is preserved here in its entirety so it can be
# re-activated in the future without any re-implementation effort.
#
# TO RE-ENABLE:
#   1. Provision a machine with a CUDA-capable GPU (≥ 8 GB VRAM).
#   2. Uncomment the `diarizer` service block in docker-compose.yml.
#   3. Un-skip step 3 in AudioPipelineJob.cs (backend).
#   4. Uncomment the Diarizer HTTP client in DependencyInjection.cs (backend).
#   5. Set HF_TOKEN in your .env file (required by Pyannote model download).
# =============================================================================

import asyncio
import os
import shutil
import tempfile
from contextlib import asynccontextmanager

import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pyannote.audio import Pipeline

# ── Module-level state ───────────────────────────────────────────────────────
diarization_pipeline = None

diarize_lock = asyncio.Lock()

ALLOWED_AUDIO_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/vnd.wave",
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
    global diarization_pipeline

    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        print("Initialising Pyannote speaker-diarisation model…")
        try:
            diarization_pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1", token=hf_token
            )
            if torch.cuda.is_available():
                diarization_pipeline.to(torch.device("cuda"))
                print("Diarisation model moved to GPU.")
            else:
                print("Diarisation model loaded on CPU.")
        except Exception as exc:
            print(f"Error loading diarisation model: {exc}")
    else:
        print("HF_TOKEN not set — diarisation endpoint will be unavailable.")


app = FastAPI(title="AI Help Center – Diarizer Service", lifespan=lifespan)


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


def _run_diarization(audio_path: str):
    """Load audio with soundfile and run pyannote.
    soundfile is reliable for WAV and avoids the torchaudio/torchcodec dependency issues.
    pyannote accepts a pre-loaded waveform dict, bypassing its own broken decoder.
    """
    waveform_np, sample_rate = sf.read(audio_path, dtype="float32", always_2d=True)
    # soundfile → (samples, channels), pyannote expects (channels, samples)
    waveform = torch.from_numpy(waveform_np.T)
    return diarization_pipeline({"waveform": waveform, "sample_rate": sample_rate})


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
        "diarization_loaded": diarization_pipeline is not None,
    }


@app.post("/diarize", tags=["audio"])
async def diarize_audio(file: UploadFile = File(...)):
    """Run speaker diarisation on a WAV file using Pyannote 3.1."""
    if diarization_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="Diarisation model is not available. Ensure HF_TOKEN is set and the model loaded successfully.",
        )

    _validate_audio(file)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        audio_path = tmp.name

    try:
        async with diarize_lock:
            diarization = await asyncio.to_thread(_run_diarization, audio_path)

        segments = [
            {
                "start": round(turn.start, 3),
                "end": round(turn.end, 3),
                "speaker": speaker,
            }
            for turn, _, speaker in diarization.itertracks(yield_label=True)
        ]
        return JSONResponse(content={"segments": segments})

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    finally:
        _safe_remove(audio_path)


# ── Dev entry-point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
