"""Genera le slide statiche (carosello e post singolo) e le esporta in JPG 95.

Uso: python3 build.py <carosello|post> <cartella_output>
"""
import math
import os
import sys
from playwright.sync_api import sync_playwright

W, H = 1080, 1350
WIRE = ("M-20 106.3 L-8 101.1 L4 96.0 L16 91.0 L28 86.1 L40 81.3 L52 76.7 L64 72.3 L76 68.1 L88 64.2 L100 60.4 L112 57.0 L124 53.8 L136 50.9 L148 48.4 L160 46.1 L172 44.2 L184 42.7 L196 41.5 L208 40.6 L220 40.1 L232 40.0 L244 40.2 L256 40.9 L268 41.8 L280 43.2 L292 44.8 L304 46.8 L316 49.2 L328 51.9 L340 54.8 L352 58.1 L364 61.7 L376 65.5 L388 69.5 L400 73.8 L412 78.3 L424 82.9 L436 87.7 L448 92.7 L460 97.7 L472 102.8 L484 108.0 L496 113.3 L508 118.5 L520 123.7 L532 128.9 L544 134.0 L556 139.0 L568 143.9 L580 148.7 L592 153.3 L604 157.7 L616 161.9 L628 165.8 L640 169.6 L652 173.0 L664 176.2 L676 179.1 L688 181.6 L700 183.9 L712 185.8 L724 187.3 L736 188.5 L748 189.4 L760 189.9 L772 190.0 L784 189.8 L796 189.1 L808 188.2 L820 186.8 L832 185.2 L844 183.2 L856 180.8 L868 178.1 L880 175.2 L892 171.9 L904 168.3 L916 164.5 L928 160.5 L940 156.2 L952 151.7 L964 147.1 L976 142.3 L988 137.3 L1000 132.3 L1012 127.2 L1024 122.0 L1036 116.7 L1048 111.5 L1060 106.3 L1072 101.1 L1084 96.0 L1096 91.0")
BULBS = [(5.0, 280.3), (200.0, 279.2), (415.0, 360.3), (630.0, 417.7), (825.0, 380.5)]
BULB_D = "M35.6 66 A28 28 0 1 1 64.4 66 L62 74 H38 Z"
DOT = ('<span style="position:relative;display:inline-block">ı<span style="position:absolute;left:50%;top:0.04em;'
       'width:0.2em;height:0.2em;margin-left:-0.1em;border-radius:50%;background:#FFC531"></span></span>')


def logo(text="io ti consiglio"):
    return text.replace("i", DOT)


def bulb(tx, ty, on, s=2.5):
    if on:
        g = (f'<g transform="translate({tx} {ty}) scale({s} -{s})"><path d="{BULB_D}" fill="#FFC531"/>'
             '<rect x="39" y="78" width="22" height="5.5" rx="2.75" fill="#FFFFFF"/>'
             '<rect x="42.5" y="86.5" width="15" height="5.5" rx="2.75" fill="#FFFFFF"/></g>')
        cx, cy = tx + 50 * s, ty - 42 * s
        r1, r2 = 33 * s, 41 * s
        for a in (30, 60, 90, 120, 150):
            r = math.radians(a)
            g += (f'<line x1="{cx + r1 * math.cos(r):.1f}" y1="{cy + r1 * math.sin(r):.1f}" '
                  f'x2="{cx + r2 * math.cos(r):.1f}" y2="{cy + r2 * math.sin(r):.1f}" stroke="#FFC531" '
                  f'stroke-width="{3.6 * s:.1f}" stroke-linecap="round"/>')
        return g
    return (f'<g transform="translate({tx} {ty}) scale({s} -{s})"><path d="{BULB_D}" fill="none" stroke="#FFC531" '
            'stroke-width="4.5" stroke-linejoin="round"/><rect x="39" y="79" width="22" height="5.5" rx="2.75" fill="#FFC531"/>'
            '<rect x="42.5" y="87.5" width="15" height="5.5" rx="2.75" fill="#FFC531"/></g>')


def wire(lit=(), extra=""):
    b = "".join(bulb(x, y, i in lit) for i, (x, y) in enumerate(BULBS))
    return (f'<svg aria-hidden="true" width="{W}" height="{H}" viewBox="0 0 {W} {H}" style="position:absolute;left:0;top:0">'
            f'<path d="{WIRE}" fill="none" stroke="#FFC531" stroke-width="5"/>{b}{extra}</svg>')


ARROW = ('<svg aria-hidden="true" width="64" height="64" viewBox="0 0 64 64"><path d="M8 32 H54 M36 14 L54 32 L36 50" '
         'fill="none" stroke="#FFC531" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>')


def footer(arrow=True):
    return ('<div style="position:absolute;left:84px;right:84px;bottom:76px;display:flex;align-items:center;justify-content:space-between">'
            f'<div style="line-height:1;white-space:nowrap;font-size:38px;font-weight:700">{logo()}</div>{ARROW if arrow else ""}</div>')


def slide(body):
    return (f'<div class="slide" style="position:relative;width:{W}px;height:{H}px;overflow:hidden;background:#0E2240;'
            f'font-family:PoppinsLocal,sans-serif;color:#FFFFFF">{body}</div>')


def big_number_bulb(n):
    """Lampadina grande accesa con il numero del passo, come nel modello."""
    s = 4.9
    tx, ty = 525.0, 638.8
    g = bulb(tx, ty, True, s)
    num = (f'<div style="position:absolute;left:620px;top:283px;width:300px;height:300px;display:flex;align-items:center;'
           f'justify-content:center;font-size:190px;font-weight:700;line-height:1;color:#0E2240">{n}</div>')
    return wire(extra=g), num


def step(n, title, sub, title_size=104):
    svg, num = big_number_bulb(n)
    return slide(svg + num +
                 '<div style="position:absolute;left:84px;right:84px;top:700px;display:flex;flex-direction:column;gap:34px">'
                 f'<div style="font-size:{title_size}px;line-height:1.08;font-weight:700;letter-spacing:-2px;text-wrap:balance">{title}</div>'
                 f'<div style="font-size:48px;line-height:1.34;font-weight:500;color:#D5DDEA;text-wrap:balance">{sub}</div></div>'
                 + footer())


def wa_band(l1, l2):
    return ('<div style="position:absolute;left:0;right:0;bottom:0;height:300px;box-sizing:border-box;padding:0 84px;'
            'background:#FFC531;display:flex;align-items:center;justify-content:space-between;gap:40px">'
            f'<div style="color:#0E2240;font-weight:700"><div style="font-size:48px;line-height:1.2;letter-spacing:-0.5px">{l1}</div>'
            f'<div style="font-size:92px;line-height:1.1;letter-spacing:-1px;white-space:nowrap">{l2}</div></div></div>')


def carosello():
    s = []
    s.append(slide(wire() +
        '<div style="position:absolute;left:84px;right:84px;top:450px;display:flex;flex-direction:column;gap:36px">'
        '<div style="font-size:118px;line-height:1.08;font-weight:700;letter-spacing:-2.5px">'
        '<div>La bolletta</div><div>ti sembra</div><div style="color:#FFC531">arabo?</div></div>'
        '<div style="font-size:46px;line-height:1.3;font-weight:500;color:#D5DDEA">5 cose da guardare per capirla in un minuto</div></div>'
        + footer()))
    s.append(step(1, "La prima pagina",
                  "Importo da pagare, scadenza e i dati del tuo contratto. Dal 2025 ha lo stesso formato con tutti i fornitori."))
    s.append(step(2, "La quota consumi",
                  "Quello che hai consumato per il suo prezzo. Più consumi, più paghi."))
    s.append(step(3, "Quota fissa e potenza",
                  "Costi che paghi anche se consumi poco. Nella luce c’è anche la quota potenza."))
    s.append(step(4, "Letture e consumi",
                  "Guarda se le letture sono reali o stimate: le stime poi si conguagliano."))
    s.append(step(5, "Il box dell’offerta",
                  "Trovi il codice offerta: ti serve per confrontare la tua offerta con le altre."))
    s.append(slide(wire(lit=range(5)) +
        '<div style="position:absolute;left:84px;right:84px;top:462px;display:flex;flex-direction:column;gap:44px">'
        '<div style="display:flex;flex-direction:column;gap:12px">'
        f'<div style="line-height:1;white-space:nowrap;font-size:124px;font-weight:700;letter-spacing:-2.5px">{logo("io ti consiglio:")}</div>'
        '<div style="font-size:124px;line-height:1.08;font-weight:700;letter-spacing:-2.5px;color:#FFC531">te la leggo io.</div></div>'
        '<div style="font-size:52px;line-height:1.3;font-weight:500;text-wrap:balance">Analisi gratuita. E se paghi già il giusto, te lo dico.</div></div>'
        + wa_band("Mandami la foto della bolletta su WhatsApp:", "375 504 9079")))
    return s


def post():
    rows = [
        ("F1", "Ore di punta", "Lun–ven 8–19"),
        ("F2", "Ore intermedie", "Lun–ven 7–8 e 19–23 · sab 7–23"),
        ("F3", "Notte e festivi", "Ogni notte 23–7 · domenica e festivi"),
    ]
    cards = ""
    for code, name, hours in rows:
        cards += ('<div style="display:flex;align-items:center;gap:36px;padding:18px 0;border-top:3px solid rgba(213,221,234,0.22)">'
                  f'<div style="width:124px;height:124px;flex-shrink:0;border-radius:50%;background:#FFC531;color:#0E2240;display:flex;'
                  f'align-items:center;justify-content:center;font-size:54px;font-weight:700;line-height:1"><span style="transform:translateY(3px)">{code}</span></div>'
                  f'<div><div style="font-size:50px;font-weight:700;line-height:1.15">{name}</div>'
                  f'<div style="font-size:37px;font-weight:500;line-height:1.3;color:#D5DDEA;white-space:nowrap">{hours}</div></div></div>')
    body = (wire(lit=(0, 2, 4)) +
            '<div style="position:absolute;left:84px;right:84px;top:428px">'
            '<div style="font-size:30px;font-weight:700;letter-spacing:3px;color:#FFC531;margin-bottom:14px">PER LA TUA ATTIVITÀ</div>'
            '<div style="font-size:80px;line-height:1.06;font-weight:700;letter-spacing:-2px">Quando consuma<br>la tua <span style="color:#FFC531">attività?</span></div>'
            f'<div style="margin-top:30px">{cards}</div>'
            '</div>'
            + '<div style="position:absolute;left:0;right:0;bottom:0;height:170px;box-sizing:border-box;padding:0 84px;background:#FFC531;'
              'display:flex;align-items:center;justify-content:space-between;color:#0E2240;font-weight:700">'
              '<div style="font-size:36px;line-height:1.2">Foto della bolletta<br>su WhatsApp</div>'
              '<div style="font-size:72px;letter-spacing:-1px;white-space:nowrap">375 504 9079</div></div>')
    return [slide(body)]


def main():
    kind, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    slides = carosello() if kind == "carosello" else post()
    html = ('<!doctype html><html lang="it"><head><meta charset="utf-8"><style>'
            "@font-face{font-family:PoppinsLocal;font-weight:500;src:url('file:///usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf')}"
            "@font-face{font-family:PoppinsLocal;font-weight:700;src:url('file:///usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf')}"
            'body{margin:0;background:#0E2240}</style></head><body>' + "".join(slides) + '</body></html>')
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"{kind}.html")
    with open(src, "w") as f:
        f.write(html)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome",
                              args=["--no-sandbox", "--allow-file-access-from-files", "--font-render-hinting=none"])
        pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        pg.goto("file://" + src)
        pg.evaluate("Promise.all([document.fonts.load('700 50px PoppinsLocal'),document.fonts.load('500 50px PoppinsLocal')])")
        pg.wait_for_timeout(300)
        for i, el in enumerate(pg.query_selector_all(".slide"), 1):
            el.screenshot(path=os.path.join(out, f"{i}.jpg"), type="jpeg", quality=95)
        b.close()


if __name__ == "__main__":
    main()
