"""Esporta un video da una pagina HTML che espone window.render(t) e window.READY.

Uso:
  python3 render.py test <pagina.html> <cartella_out> t1 t2 ...   -> JPG di alcuni istanti
  python3 render.py all  <pagina.html> <cartella_out> <durata_s> [fps]  -> tutti i fotogrammi
Poi: ffmpeg -framerate 30 -i out/%04d.jpg -f lavfi -i anullsrc=r=44100:cl=stereo -shortest \
       -c:v libx264 -pix_fmt yuv420p -crf 17 -c:a aac -movflags +faststart video.mp4
"""
import os
import sys
from playwright.sync_api import sync_playwright


def main():
    mode, page_path, out = sys.argv[1], os.path.abspath(sys.argv[2]), sys.argv[3]
    os.makedirs(out, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--allow-file-access-from-files", "--font-render-hinting=none", "--disable-lcd-text"])
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        page.goto("file://" + page_path)
        page.wait_for_function("window.READY === true", timeout=20000)
        clip = {"x": 0, "y": 0, "width": 1080, "height": 1920}
        if mode == "test":
            for t in sys.argv[4:]:
                page.evaluate(f"render({float(t)})")
                page.screenshot(path=os.path.join(out, f"t{float(t):05.2f}.jpg"), clip=clip, type="jpeg", quality=90)
        else:
            dur = float(sys.argv[4])
            fps = int(sys.argv[5]) if len(sys.argv) > 5 else 30
            n = int(round(dur * fps))
            for i in range(n):
                page.evaluate(f"render({i / fps:.5f})")
                page.screenshot(path=os.path.join(out, f"{i:04d}.jpg"), clip=clip, type="jpeg", quality=97)
            print("frames", n)
        browser.close()


if __name__ == "__main__":
    main()
