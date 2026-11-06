"""Renders reel.html frame by frame with Chrome (Playwright).

Usage:
  python3 render.py test <out_dir> t1 t2 ...   -> PNG of specific times
  python3 render.py all <out_dir> [fps]        -> every frame for the full duration
"""
import os
import sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = "file://" + os.path.join(HERE, "reel.html")
DUR = 28.0


def main():
    mode, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--allow-file-access-from-files", "--font-render-hinting=none", "--disable-lcd-text"],
        )
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        page.goto(PAGE)
        page.wait_for_function("window.READY === true", timeout=20000)
        print("fonts:", page.evaluate("window.FONTS"))
        print("fit:", page.evaluate("window.FIT"))
        clip = {"x": 0, "y": 0, "width": 1080, "height": 1920}
        if mode == "test":
            for t in sys.argv[3:]:
                page.evaluate(f"render({float(t)})")
                page.screenshot(path=os.path.join(out, f"t{float(t):05.2f}.png"), clip=clip)
        else:
            fps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
            n = int(round(DUR * fps))
            for i in range(n):
                page.evaluate(f"render({i / fps:.5f})")
                page.screenshot(path=os.path.join(out, f"{i:04d}.png"), clip=clip)
                if i % 150 == 0:
                    print("frame", i, "/", n, flush=True)
        browser.close()


if __name__ == "__main__":
    main()
