"""Save a supplied image as WebP plus a sharpened smaller copy for 1x screens.

usage: python3 tools/add_image.py SRC assets/img/<project>/<name>.webp [SMALL_WIDTH] [--photo]
writes <name>.webp (full size) and <name>-<SMALL_WIDTH>.webp
SMALL_WIDTH is the width the image is shown at on desktop (default: half the source).
PNG sources are saved lossless; WebP sources are copied as they are.
--photo saves both files as high-quality lossy WebP instead (much smaller for photographic content).
"""
import shutil
import sys
from PIL import Image, ImageFilter

photo = '--photo' in sys.argv
args = [a for a in sys.argv[1:] if a != '--photo']
src, out = args[0], args[1]
enc = dict(quality=92, method=6) if photo else dict(lossless=True, quality=100, method=6)
im = Image.open(src).convert('RGBA')
has_alpha = im.getchannel('A').getextrema()[0] < 255
if not has_alpha:
    im = im.convert('RGB')
if src.lower().endswith('.webp') and not photo:
    shutil.copyfile(src, out)  # already encoded; re-encoding can't add detail
else:
    im.save(out, 'WEBP', **enc)

w, h = im.size
sw = int(args[2]) if len(args) > 2 else w // 2
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
small.save(small_out, 'WEBP', **enc)
print(out, im.size, 'alpha' if has_alpha else 'opaque', '|', small_out, size)
