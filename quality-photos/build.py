#!/usr/bin/env python3
"""Bundles the split source tree into one self-contained file.

    python3 build.py            -> dist/quality-photos.offline.html
    python3 build.py --no-fonts -> also strips the Google Fonts link,
                                   so the file is 100% offline.

The bundled file is what you open with a double-click, put on a USB
stick, or upload to any static host. The split tree in css/ and js/ is
what you edit.
"""
import re, sys, pathlib

root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")

def inline_css(m):
    return "<style>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "\n</style>"

def inline_js(m):
    return "<script>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "\n</script>"

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
html = re.sub(r'<script src="([^"]+)"></script>', inline_js, html)

if "--no-fonts" in sys.argv:
    html = re.sub(r'<link rel="preconnect"[^>]*>\s*', "", html)
    html = re.sub(r'<link href="https://fonts\.googleapis[^>]*>\s*', "", html)

out = root / "dist" / "quality-photos.offline.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print("Wrote", out, f"({len(html)/1024:.0f} KB)")
