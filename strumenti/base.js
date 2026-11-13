// Base comune per i video «io ti consiglio» disegnati su canvas 1080×1920.
const W = 1080, H = 1920;
const NAVY = '#0E2240', YEL = '#FFC531', WH = '#FFFFFF', SUB = '#D5DDEA';
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const clamp = (x) => Math.max(0, Math.min(1, x));
const eo = (p) => 1 - Math.pow(1 - clamp(p), 3);
const ei = (p) => Math.pow(clamp(p), 3);
const ebk = (p) => { p = clamp(p); const s = 1.70158, q = p - 1; return 1 + (s + 1) * q * q * q + s * q * q; };
const lerp = (a, b, p) => a + (b - a) * p;
function mix(c1, c2, p) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const r = Math.round(lerp(a >> 16, b >> 16, p)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, p)), bl = Math.round(lerp(a & 255, b & 255, p));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}
function font(size, weight) { ctx.font = `${weight} ${size}px PoppinsLocal`; ctx.letterSpacing = (-0.02 * size).toFixed(2) + 'px'; }
function tw(s, size, weight) { font(size, weight); return ctx.measureText(s).width; }
// riduce il corpo finché la riga entra in maxW
function fit(s, size, weight, maxW) { let z = size; while (z > 20 && tw(s, z, weight) > maxW) z -= 2; return z; }
function txt(s, x, y, size, weight, color, align = 'left', alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; font(size, weight); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); ctx.restore();
}
function wrap(s, size, weight, maxW) {
  font(size, weight); const out = []; let line = '';
  s.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
  if (line) out.push(line); return out;
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
// logo: scritta minuscola con i puntini delle i gialli
function logo(x, y, size, color = WH, alpha = 1, suffix = '') {
  if (alpha <= 0) return;
  const s = 'io ti consiglio' + suffix;
  ctx.save(); ctx.globalAlpha *= alpha; font(size, 700); ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const plain = s.replace(/i/g, 'ı'); ctx.fillText(plain, x, y);
  ctx.fillStyle = YEL;
  for (let k = 0; k < s.length; k++) if (s[k] === 'i') {
    const a = ctx.measureText(plain.slice(0, k)).width, b = ctx.measureText(plain.slice(0, k + 1)).width;
    ctx.beginPath(); ctx.arc(x + (a + b) / 2 - 0.01 * size, y - 0.665 * size, 0.1 * size, 0, 7); ctx.fill();
  }
  ctx.restore();
}
const BULB = new Path2D('M35.6 66 A28 28 0 1 1 64.4 66 L62 74 H38 Z');
// lampadina dritta (attacco in basso), centro del vetro in (cx,cy), s = scala (raggio vetro = 28*s)
function bulb(cx, cy, s, fill, capColor = WH, stroke = null) {
  ctx.save(); ctx.translate(cx - 50 * s, cy - 42 * s); ctx.scale(s, s);
  if (fill) { ctx.fillStyle = fill; ctx.fill(BULB); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 4.5; ctx.lineJoin = 'round'; ctx.stroke(BULB); }
  ctx.fillStyle = capColor; rr(39, 78, 22, 5.5, 2.75); ctx.fill(); rr(42.5, 86.5, 15, 5.5, 2.75); ctx.fill();
  ctx.restore();
}
function rays(cx, cy, r1, len, n, a0, a1, width, color, alpha = 1) {
  if (alpha <= 0 || len <= 0.5) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = (a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180; ctx.beginPath(); ctx.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)); ctx.lineTo(cx + (r1 + len) * Math.cos(a), cy + (r1 + len) * Math.sin(a)); ctx.stroke(); }
  ctx.restore();
}
// filo con le lampadine appese in alto; on[i] = quanto è accesa (0..1)
const WIREY = (x) => 245 - 75 * Math.cos((x - 232) / 540 * Math.PI);
function wire(on, t, color = YEL, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.beginPath();
  for (let x = -20; x <= 1100; x += 12) { const y = WIREY(x); x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  [130, 325, 540, 755, 950].forEach((x, i) => {
    const y0 = WIREY(x), f = on[i] || 0, ang = 1.8 * Math.sin(2 * Math.PI * t / 3.4 + i * 1.1) * Math.PI / 180;
    ctx.save(); ctx.translate(x, y0); ctx.rotate(ang); ctx.scale(2.5, -2.5); ctx.translate(-50, -93);
    ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineJoin = 'round';
    if (f > 0) { ctx.globalAlpha *= 1; ctx.fillStyle = mix(NAVY, YEL, f); ctx.fill(BULB); }
    ctx.stroke(BULB); ctx.fillStyle = f > 0.5 ? WH : color; rr(39, 78, 22, 5.5, 2.75); ctx.fill(); rr(42.5, 86.5, 15, 5.5, 2.75); ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}
// fascia gialla finale con il numero WhatsApp
function band(p, y = 1130) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 70);
  ctx.fillStyle = YEL; ctx.fillRect(0, y, W, 276);
  txt('Foto della bolletta su WhatsApp:', 84, y + 98, fit('Foto della bolletta su WhatsApp:', 54, 700, 856), 700, NAVY);
  txt('375 504 9079', 84, y + 218, 104, 700, NAVY);
  ctx.restore();
}
function ready(cb) {
  Promise.all([document.fonts.load('700 100px PoppinsLocal'), document.fonts.load('500 100px PoppinsLocal')]).then(() => document.fonts.ready).then(() => { if (cb) cb(); window.render(0); window.READY = true; });
}
