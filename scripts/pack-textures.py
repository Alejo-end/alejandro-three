"""Right-sizes the albedo maps for the web.

RealityScan writes 8192px diffuse and normal pairs. Decoded, that pair costs
512 MB of GPU memory per scan, which is what made the viewer crawl. Only the
albedo survives: photogrammetry bakes its lighting in, nothing re-lights these
meshes, so the normal map has no one to talk to.

    python3 scripts/pack-textures.py
"""
import os
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
SIZE = 2048
SCANS = ["Afx", "Erzbrau", "Trash_Can", "Snowman", "Lintulahdenaukio"]

for name in SCANS:
    src = f"assets/{name}/tex_u1_v1_diffuse.jpg"
    dst = f"public/scans/{name}/albedo.jpg"
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    image = Image.open(src).convert("RGB")
    before = image.size[0]
    image.resize((SIZE, SIZE), Image.LANCZOS).save(dst, quality=86, optimize=True, progressive=True)
    print(f"{name:18} {before}px -> {SIZE}px   {os.path.getsize(src)//1024}kb -> {os.path.getsize(dst)//1024}kb")
