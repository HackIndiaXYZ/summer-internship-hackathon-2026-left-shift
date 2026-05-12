from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import shutil
import uuid

from app.ela import generate_ela_image
from app.detector import analyze_ela_image
from app.onnx_detector import analyze_with_model

app = FastAPI(
    title="Fake Document Detection API",
    version="1.0.0"
)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# PATHS
# =========================

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Static files
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# =========================
# ROOT
# =========================

@app.get("/")
def home():
    return {
        "message": "Fake Document Detection API Running"
    }

# =========================
# DETECT ENDPOINT
# =========================

@app.post("/detect")
async def detect_document(file: UploadFile = File(...)):

    # Unique ID
    unique_id = str(uuid.uuid4())

    # File paths
    input_path = UPLOAD_DIR / f"{unique_id}.jpg"

    ela_output_path = OUTPUT_DIR / f"{unique_id}_ela.jpg"

    # Save uploaded image
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Generate ELA image
    generate_ela_image(
        input_path=input_path,
        output_path=ela_output_path
    )

    # Analyze ELA image
    analysis = analyze_ela_image(str(ela_output_path))

    # Analyze Original image with ONNX model
    onnx_results = analyze_with_model(str(input_path))
    
    # Compute ONNX score on 1-10 scale (max confidence * 10)
    model_score = 0
    if onnx_results:
        model_score = max(res["confidence"] for res in onnx_results) * 10

    # Final score (1-10 scale) - Weighted combination of ELA (40%) and ONNX (60%)
    ela_score = analysis["tampering_scale"]
    final_score = float(round((ela_score * 0.4) + (model_score * 0.6), 1))
    
    # Combine suspicious regions
    combined_regions = analysis["regions"].copy()
    for res in onnx_results:
        combined_regions.append({
            "x": res["x"], "y": res["y"], "w": res["w"], "h": res["h"]
        })

    # =========================
    # Verdict Logic
    # =========================

    if final_score >= 7:

        verdict = "Potentially tampered document detected"

    elif final_score >= 4:

        verdict = "Suspicious compression inconsistencies detected"

    elif final_score >= 2:

        verdict = "Minor anomalies or smoothing artifacts detected"

    else:

        verdict = "No major signs of tampering detected"

    # =========================
    # Final Response
    # =========================

    return {
        "success": True,

        "filename": file.filename,

        "tampering_scale": final_score,

        "is_suspicious": bool(final_score >= 4),

        "verdict": verdict,

        "suspicious_regions": combined_regions,

        "ela_image_url":
            f"/outputs/{ela_output_path.name}"
    }