# Fake Document Detection API

AI-powered document tampering detection API utilizing a hybrid detection pipeline combining:

- Error Level Analysis (ELA)
- Custom YOLO-based ONNX Deep Learning Model

The system analyzes uploaded document images for suspicious modifications, compression inconsistencies, copy-paste tampering, and manipulated regions.

---

# Base URL

```bash
https://ocr-service-mv6q.onrender.com
```

---

# API Documentation

## Health Check

### GET /

Check API availability and server status.

### Request

```http
GET /
```

### Response

```json
{
  "message": "Fake Document Detection API Running"
}
```

---

# Detect Tampered Document

## POST /detect

Upload a document image for hybrid tampering analysis using:

- Error Level Analysis (ELA)
- Deep Learning Object Detection Model (YOLO + ONNX Runtime)

---

# Request

## Content-Type

```http
multipart/form-data
```

## Form Data

| Field | Type | Required |
|---|---|---|
| file | Image File | Yes |

---

# Example cURL

```bash
curl -X POST \
  "https://ocr-service-mv6q.onrender.com/detect" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.jpg"
```

---

# Example JavaScript

```javascript
const formData = new FormData();

formData.append("file", file);

const response = await fetch(
  "https://ocr-service-mv6q.onrender.com/detect",
  {
    method: "POST",
    body: formData
  }
);

const data = await response.json();

console.log(data);
```

---

# Example Response

```json
{
  "success": true,
  "filename": "document.jpg",
  "tampering_scale": 7.4,
  "is_suspicious": true,
  "verdict": "Potentially tampered document detected",
  "suspicious_regions": [
    {
      "x": 102,
      "y": 54,
      "w": 80,
      "h": 43
    }
  ],
  "ela_image_url": "/outputs/12345_ela.jpg"
}
```

---

# Response Fields

| Field | Description |
|---|---|
| success | API execution status |
| filename | Uploaded file name |
| tampering_scale | Final blended tampering confidence score (1–10) |
| is_suspicious | Indicates whether the document appears suspicious |
| verdict | Human-readable detection result |
| suspicious_regions | Bounding boxes of suspicious/tampered regions |
| ela_image_url | Generated ELA image URL for visual inspection |

---

# Hybrid Detection Pipeline

The API uses a weighted hybrid fraud detection mechanism:

| Component | Weight |
|---|---|
| YOLO-based ONNX ML Model | 60% |
| Error Level Analysis (ELA) | 40% |

The machine learning model performs localized tampered region detection while ELA analyzes compression inconsistencies and image manipulation artifacts.

This hybrid approach improves robustness and reduces false positives compared to standalone ELA systems.

---

# Tampering Scale

| Score | Meaning |
|---|---|
| 0.0 – 1.9 | No major tampering detected |
| 2.0 – 3.9 | Minor anomalies or compression artifacts detected |
| 4.0 – 6.9 | Suspicious inconsistencies detected |
| 7.0 – 10.0 | Potentially tampered document detected |

---

# Swagger Documentation

## Swagger UI

```bash
https://ocr-service-mv6q.onrender.com/docs
```

## ReDoc

```bash
https://ocr-service-mv6q.onrender.com/redoc
```

---

# Output Images

Generated ELA output images are accessible via:

```bash
https://ocr-service-mv6q.onrender.com/outputs/{filename}
```

---

# Tech Stack

## Backend

- FastAPI
- Uvicorn

## Machine Learning

- Custom YOLO Model
- ONNX Runtime

## Image Processing

- OpenCV
- Pillow (PIL)

## Numerical Processing

- NumPy

---

# Features

- Hybrid tampering detection pipeline
- Lightweight ONNX inference
- Real-time API responses
- Bounding box suspicious region detection
- ELA visualization generation
- FastAPI Swagger documentation
- Dockerized deployment
- Render cloud deployment ready

---

# Deployment

The API is containerized using Docker and deployed on Render.

---

# Local Development

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Server

```bash
uvicorn app.main:app --reload
```

---

# Project Structure

```bash
fake-doc-api/
│
├── app/
│   ├── main.py
│   ├── detector.py
│   ├── onnx_detector.py
│   └── ela.py
│
├── model/
│   ├── best.onnx
│   ├── best.pt
│   └── best.torchscript
│
├── outputs/
├── uploads/
│
├── Dockerfile
├── requirements.txt
└── README.md
```
