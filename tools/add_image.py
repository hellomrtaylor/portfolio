"""Save a supplied PNG as lossless WebP plus a sharpened half-size copy for 1x screens.

usage: python3 tools/add_image.py SRC.png assets/img/<project>/<name>.webp
writes <name>.webp (full) and <name>-<half width>.webp
"""
import sys
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
has_alpha = im.getchannel('A').getextrema()[0] < 255
if not has_alpha:
    im = im.convert('RGB')
im.save(out, 'WEBP', lossless=True, quality=100, method=6)

w, h = im.size
half = (w // 2, round(h / 2))
if has_alpha:
    small = im.convert('RGBa').resize(half, Image.LANCZOS).convert('RGBA')  # premultiplied: no dark fringes
    rgb = small.convert('RGB').filter(ImageFilter.UnsharpMask(radius=0.6, percent=60, threshold=0))
    rgb.putalpha(small.getchannel('A'))
    small = rgb
else:
    small = im.resize(half, Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=0.6, percent=60, threshold=0))
small_out = out[:-5] + f'-{half[0]}.webp'
small.save(small_out, 'WEBP', lossless=True, quality=100, method=6)
print(out, im.size, 'alpha' if has_alpha else 'opaque', '|', small_out, half)
