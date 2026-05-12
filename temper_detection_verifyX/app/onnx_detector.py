import cv2
import numpy as np
import onnxruntime as ort

class ONNXDetector:
    def __init__(self, model_path="model/best.onnx"):
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.input_shape = self.session.get_inputs()[0].shape[2:] # (640, 640)

    def process_image(self, image_path):
        image = cv2.imread(image_path)
        original_h, original_w = image.shape[:2]
        
        # Resize keeping aspect ratio
        scale = min(self.input_shape[0] / original_h, self.input_shape[1] / original_w)
        new_h, new_w = int(original_h * scale), int(original_w * scale)
        image_resized = cv2.resize(image, (new_w, new_h))
        
        # Pad to input_shape
        pad_h = self.input_shape[0] - new_h
        pad_w = self.input_shape[1] - new_w
        image_padded = cv2.copyMakeBorder(image_resized, 0, pad_h, 0, pad_w, cv2.BORDER_CONSTANT, value=(114, 114, 114))
        
        # HWC to CHW
        image_transposed = image_padded.transpose(2, 0, 1)
        # BGR to RGB
        image_transposed = image_transposed[::-1]
        
        # Normalize to 0-1
        image_normalized = image_transposed.astype(np.float32) / 255.0
        
        # Add batch dimension
        image_batch = np.expand_dims(image_normalized, axis=0)
        
        return image_batch, scale, pad_w, pad_h, original_w, original_h

    def postprocess(self, output, scale, pad_w, pad_h, original_w, original_h, conf_thres=0.25, iou_thres=0.45):
        # output shape: [1, 5, 8400]
        predictions = output[0].T # [8400, 5]
        
        boxes = predictions[:, :4]
        scores = predictions[:, 4]
        
        # Filter by confidence
        mask = scores > conf_thres
        boxes = boxes[mask]
        scores = scores[mask]
        
        if len(boxes) == 0:
            return []
        
        # Convert cx, cy, w, h to x1, y1, x2, y2
        x1 = boxes[:, 0] - boxes[:, 2] / 2
        y1 = boxes[:, 1] - boxes[:, 3] / 2
        x2 = boxes[:, 0] + boxes[:, 2] / 2
        y2 = boxes[:, 1] + boxes[:, 3] / 2
        
        boxes_xyxy = np.stack([x1, y1, x2, y2], axis=1)
        
        # Apply NMS
        indices = cv2.dnn.NMSBoxes(boxes_xyxy.tolist(), scores.tolist(), conf_thres, iou_thres)
        
        results = []
        if len(indices) > 0:
            for i in indices.flatten():
                box = boxes_xyxy[i]
                score = scores[i]
                
                # Remove padding and scale back
                x1_o = (box[0]) / scale
                y1_o = (box[1]) / scale
                x2_o = (box[2]) / scale
                y2_o = (box[3]) / scale
                
                x1_o = max(0, min(x1_o, original_w))
                y1_o = max(0, min(y1_o, original_h))
                x2_o = max(0, min(x2_o, original_w))
                y2_o = max(0, min(y2_o, original_h))
                
                results.append({
                    "x": int(x1_o),
                    "y": int(y1_o),
                    "w": int(x2_o - x1_o),
                    "h": int(y2_o - y1_o),
                    "confidence": float(score)
                })
                
        return results

    def predict(self, image_path):
        input_batch, scale, pad_w, pad_h, orig_w, orig_h = self.process_image(image_path)
        
        outputs = self.session.run(None, {self.input_name: input_batch})
        
        results = self.postprocess(outputs[0], scale, pad_w, pad_h, orig_w, orig_h)
        return results

detector_instance = ONNXDetector()

def analyze_with_model(image_path):
    return detector_instance.predict(image_path)
