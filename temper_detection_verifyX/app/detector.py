import cv2
import numpy as np


def analyze_ela_image(ela_path):

    image = cv2.imread(ela_path)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # =========================
    # BRIGHTNESS ANALYSIS
    # =========================

    mean_brightness = np.mean(gray)

    # =========================
    # EDGE ANALYSIS
    # =========================

    edges = cv2.Canny(gray, 100, 200)

    edge_density = np.sum(edges > 0) / edges.size

    # =========================
    # NOISE ANALYSIS
    # =========================

    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    noise = cv2.absdiff(gray, blur)

    noise_score = np.mean(noise)

    # =========================
    # THRESHOLD SUSPICIOUS AREAS
    # =========================

    _, thresh = cv2.threshold(
        gray,
        50,
        255,
        cv2.THRESH_BINARY
    )

    contours, _ = cv2.findContours(
        thresh,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    suspicious_regions = []

    suspicious_area = 0

    # =========================
    # CONTOUR ANALYSIS
    # =========================

    for cnt in contours:

        area = cv2.contourArea(cnt)

        # Ignore tiny noise
        if area < 80:
            continue

        x, y, w, h = cv2.boundingRect(cnt)

        suspicious_regions.append({
            "x": int(x),
            "y": int(y),
            "w": int(w),
            "h": int(h)
        })

        # Region intensity weighting
        region = gray[y:y+h, x:x+w]

        intensity = np.mean(region)

        weighted_score = area * (intensity / 255)

        suspicious_area += weighted_score

    # =========================
    # REGION COUNT
    # =========================

    region_count = len(suspicious_regions)

    # =========================
    # AREA ANALYSIS
    # =========================

    total_area = image.shape[0] * image.shape[1]

    contour_score = suspicious_area / total_area

    # =========================
    # NORMALIZED SCORES
    # =========================

    region_score = min(region_count / 20, 1.0)

    brightness_score = mean_brightness / 255

    edge_score = min(edge_density * 5, 1.0)

    noise_normalized = noise_score / 255

    coverage_score = min(contour_score * 10, 1.0)

    # =========================
    # FINAL SCORE
    # =========================

    fraud_score = (
        region_score * 0.30 +
        brightness_score * 0.20 +
        edge_score * 0.20 +
        noise_normalized * 0.10 +
        coverage_score * 0.20
    )

    fraud_score = min(fraud_score, 1.0)

    # =========================
    # 1-10 SCALE
    # =========================

    tampering_scale = round(fraud_score * 10, 1)

    return {
        "tampering_scale": tampering_scale,
        "regions": suspicious_regions
    }