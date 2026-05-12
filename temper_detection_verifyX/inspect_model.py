import onnxruntime as ort

model_path = "model/best.onnx"
session = ort.InferenceSession(model_path)

print("Inputs:")
for inp in session.get_inputs():
    print(f"Name: {inp.name}, Shape: {inp.shape}, Type: {inp.type}")

print("\nOutputs:")
for out in session.get_outputs():
    print(f"Name: {out.name}, Shape: {out.shape}, Type: {out.type}")
