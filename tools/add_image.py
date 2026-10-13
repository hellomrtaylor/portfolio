"""Save a supplied image as WebP plus a sharpened smaller copy for 1x screens.

usage: python3 tools/add_image.py SRC assets/img/<project>/<name>.webp [SMALL_WIDTH]
writes <name>.webp (full size) and <name>-<SMALL_WIDTH>.webp
SMALL_WIDTH is the width the image is shown at on desktop (default: half the source).
PNG sources are saved lossless; WebP sources are copied as they are.
"""
import shutil
import sys
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
has_alpha = im.getchannel('A').getextrema()[0] < 255
if not has_alpha:
    im = im.convert('RGB')
if src.lower().endswith('.webp'):
    shutil.copyfile(src, out)  # already encoded; re-encoding can't add detail
else:
    im.save(out, 'WEBP', lossless=True, quality=100, method=6)

w, h = im.size
sw = int(sys.argv[3]) if len(sys.argv) > 3 else w // 2
size = (sw, round(h * sw / w))
sharpen = ImageFilter.UnsharpMask(radius=0.6, percent=60, threshold=0)
if has_alpha:
    small = im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')  # premultiplied: no dark fringes
    rgb = small.convert('RGB').filter(sharpen)
    rgb.putalpha(small.getchannel('A'))
    small = rgb
else:
    small = im.resize(size, Image.LANCZOS).filter(sharpen)
small_out = out[:-5] + f'-{sw}.webp'
small.save(small_out, 'WEBP', lossless=True, quality=100, method=6)
print(out, im.size, 'alpha' if has_alpha else 'opaque', '|', small_out, size)
