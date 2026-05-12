from PIL import Image, ImageChops, ImageEnhance
import io
import os

def generate_ela_image(input_path, output_path, quality=90):

    original = Image.open(input_path).convert('RGB')

    temp_io = io.BytesIO()

    original.save(temp_io, 'JPEG', quality=quality)

    temp_io.seek(0)

    compressed = Image.open(temp_io)

    diff = ImageChops.difference(original, compressed)

    extrema = diff.getextrema()

    max_diff = max([ex[1] for ex in extrema])

    if max_diff == 0:
        max_diff = 1

    scale = 255.0 / max_diff

    ela_image = ImageEnhance.Brightness(diff).enhance(scale)

    ela_image.save(output_path)

    return output_path