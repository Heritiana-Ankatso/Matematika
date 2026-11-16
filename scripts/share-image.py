"""Draw the share image (site/share.png, 1280 x 640): the picture GitHub and social sites show for a link to the site.

Design v7 "Pavage" (docs/DESIGN_V7.md): bone page, the mark and the name, the line "One rule. Infinite worlds.", and at
the right a 5 x 5 pavement of one Truchet tile, two tiles in ochre, behind a 4 px graphite rule. Fonts are the TeX
copies of the site's fonts (content/tex/core/fonts, made by scripts/tex-fonts.py). Run: python3 scripts/share-image.py
The same image must also be uploaded by hand as the repository's social preview (GitHub, Settings, General).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'content/tex/core/fonts'
K = 2                                   # drawn at twice the size, then reduced: smooth edges
W, H = 1280 * K, 640 * K
BONE, GRAPHITE, INK2, INDIGO, OCHRE = '#EEEAE1', '#18181B', '#3A3D47', '#2C3D8F', '#C98B1E'


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size * K)


def tile(size, turned, bg, ink, width):
    """One Truchet tile: two quarter circles joining the midpoints of opposite corners' sides."""
    t = Image.new('RGB', (size, size), bg)
    d = ImageDraw.Draw(t)
    r = size // 2
    d.arc([-r, -r, r, r], 0, 90, fill=ink, width=width)                     # around the top-left corner
    d.arc([size - r, size - r, size + r, size + r], 180, 270, fill=ink, width=width)   # around the bottom-right corner
    return t.rotate(90) if turned else t


def mark(size):
    """The mark: four tiles turned so that their arcs close a circle in the middle."""
    m = Image.new('RGB', (size, size), INDIGO)
    d = ImageDraw.Draw(m)
    u = size / 120
    w = round(12 * u)
    d.ellipse([30 * u, 30 * u, 90 * u, 90 * u], outline=BONE, width=w)
    for cx, cy in ((0, 0), (120, 0), (0, 120), (120, 120)):
        d.ellipse([(cx - 30) * u, (cy - 30) * u, (cx + 30) * u, (cy + 30) * u], outline=BONE, width=w)
    return m


def main():
    img = Image.new('RGB', (W, H), BONE)
    d = ImageDraw.Draw(img)
    s = lambda v: v * K
    # the pavement at the right: same placement rule as the brand guide, two accent tiles
    x0, n = s(760), 5
    size = (W - x0) // n
    rows = -(-H // size)
    for i in range(rows):
        for j in range(n):
            turned = (i * 7 + j * 3 + (i * j) % 5) % 2 == 1
            hot = (i, j) in ((1, 2), (3, 3))
            img.paste(tile(size, turned, OCHRE if hot else BONE, GRAPHITE if hot else INDIGO, s(13)), (x0 + j * size, i * size))
    d.rectangle([x0 - s(4), 0, x0, H], fill=GRAPHITE)
    # the mark and the name
    img.paste(mark(s(70)), (s(72), s(66)))
    d.text((s(164), s(80)), 'MATEMATIKA', font=font('ArchivoExpanded-ExtraBold.ttf', 40), fill=GRAPHITE)
    # the line and the subtitle
    head = font('ArchivoExpanded-ExtraBold.ttf', 64)
    for i, line in enumerate(('One rule.', 'Infinite worlds.')):
        d.text((s(70), s(262) + i * s(78)), line, font=head, fill=GRAPHITE)
    sub = font('AtkinsonHyperlegible-Regular.ttf', 30)
    for i, line in enumerate(('Malagasy, French, international, university', 'and Olympiad mathematics')):
        d.text((s(74), s(486) + i * s(40)), line, font=sub, fill=INK2)
    out = ROOT / 'site/share.png'
    img.resize((1280, 640), Image.LANCZOS).save(out, optimize=True)
    print('wrote', out.relative_to(ROOT), out.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
