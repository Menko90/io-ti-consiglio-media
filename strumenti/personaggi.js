// Personaggi fissi dei cartoni «io ti consiglio»: Salvo, Lucia, Tommy (e Nino), più Lumo la lampadina.
// Richiede base.js. Tutti disegnati in stile piatto con contorno blu notte.
const SKIN = '#F4C7A1';
const LOOK = {
  salvo: {shirt: '#8EC5FF', pants: '#3B4A66', hair: '#3A2A20', wide: 0.38, headR: 0.12},
  lucia: {shirt: '#E2A73A', pants: '#26334D', hair: '#7A4A2A', wide: 0.3, headR: 0.12},
  tommy: {shirt: '#2F5597', pants: '#5B6B86', hair: '#4A3222', wide: 0.32, headR: 0.15},
  nino:  {shirt: '#FFFFFF', pants: '#3B4A66', hair: '#E8E8E8', wide: 0.36, headR: 0.12}
};

function spinner(cx, cy, r, t) {
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + t * 6;
    ctx.globalAlpha = 0.25 + 0.75 * (k / 7);
    ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.2, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function limb(x1, y1, x2, y2, w, color, bend) {
  const mx = (x1 + x2) / 2 + (bend || 0), my = (y1 + y2) / 2;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = NAVY; ctx.lineWidth = w + 10; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
}
function dot(x, y, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = 5; ctx.stroke(); }

function face(cx, cy, r, f, t, kind) {
  const ex = r * 0.36, ey = cy - r * 0.02;
  const lx = (f.look || [0, 0])[0] * r * 0.12, ly = (f.look || [0, 0])[1] * r * 0.12;
  [-1, 1].forEach(sd => {
    const x = cx + sd * ex;
    ctx.strokeStyle = NAVY; ctx.fillStyle = NAVY; ctx.lineWidth = 5; ctx.lineCap = 'round';
    if (f.eyes === 'wide') { ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(x, ey, r * 0.21, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(x + lx, ey + ly, r * 0.08, 0, 7); ctx.fill(); }
    else if (f.eyes === 'happy') { ctx.beginPath(); ctx.arc(x, ey + r * 0.06, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (f.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(x - r * 0.12, ey); ctx.lineTo(x + r * 0.12, ey); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(x + lx * 0.6, ey + ly * 0.6, r * 0.075, r * 0.11, 0, 0, 7); ctx.fill(); }
    // sopracciglia
    const by = ey - r * (f.eyes === 'wide' ? 0.36 : 0.26);
    if (f.brows && f.brows !== 'none') {
      const up = f.brows === 'up' ? -r * 0.08 : 0;
      const yin = by + up + (f.brows === 'worried' ? -r * 0.08 : f.brows === 'angry' ? r * 0.09 : 0);
      const yout = by + up + (f.brows === 'worried' ? r * 0.04 : f.brows === 'angry' ? -r * 0.04 : 0);
      const xin = x - sd * r * 0.14, xout = x + sd * r * 0.14;
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xout, yout); ctx.lineTo(xin, yin); ctx.stroke();
    }
  });
  // naso
  ctx.strokeStyle = '#C98E6A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy + r * 0.2, r * 0.07, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
  // bocca
  const my = cy + r * (kind === 'salvo' ? 0.56 : 0.48);
  let m = f.mouth;
  if (m === 'talk') m = Math.floor(t * 8) % 2 ? 'open' : 'grin';
  ctx.strokeStyle = NAVY; ctx.fillStyle = NAVY; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  if (m === 'smile') { ctx.arc(cx, my - r * 0.12, r * 0.22, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  else if (m === 'grin') { ctx.moveTo(cx - r * 0.26, my - r * 0.04); ctx.quadraticCurveTo(cx, my + r * 0.34, cx + r * 0.26, my - r * 0.04); ctx.closePath(); ctx.fill(); ctx.fillStyle = WH; ctx.fillRect(cx - r * 0.16, my - r * 0.02, r * 0.32, r * 0.06); }
  else if (m === 'open') { ctx.ellipse(cx, my + r * 0.04, r * 0.15, r * 0.19, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.ellipse(cx, my + r * 0.13, r * 0.09, r * 0.06, 0, 0, 7); ctx.fill(); }
  else if (m === 'o') { ctx.ellipse(cx, my + r * 0.02, r * 0.08, r * 0.1, 0, 0, 7); ctx.fill(); }
  else if (m === 'blow') { ctx.ellipse(cx + r * 0.18, my, r * 0.07, r * 0.07, 0, 0, 7); ctx.fill(); ctx.strokeStyle = NAVY; ctx.beginPath(); ctx.arc(cx + r * 0.05, my, r * 0.12, -0.6, 0.6, true); }
  else if (m === 'grit') { ctx.fillStyle = WH; rr(cx - r * 0.24, my - r * 0.08, r * 0.48, r * 0.18, 6); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - r * 0.24, my + r * 0.01); ctx.lineTo(cx + r * 0.24, my + r * 0.01); ctx.stroke(); }
  else { ctx.moveTo(cx - r * 0.16, my); ctx.lineTo(cx + r * 0.16, my); ctx.stroke(); }
  // baffi di Salvo e di Nino
  if (kind === 'salvo' || kind === 'nino') {
    ctx.fillStyle = kind === 'salvo' ? LOOK.salvo.hair : '#E8E8E8';
    ctx.beginPath(); ctx.ellipse(cx - r * 0.15, cy + r * 0.36, r * 0.2, r * 0.08, -0.2, 0, 7); ctx.ellipse(cx + r * 0.15, cy + r * 0.36, r * 0.2, r * 0.08, 0.2, 0, 7); ctx.fill();
  }
}

function hairBack(kind, cx, cy, r) {
  if (kind === 'lucia') {
    dot(cx + r * 0.15, cy - r * 1.02, r * 0.38, LOOK.lucia.hair);
    ctx.save(); ctx.translate(cx + r * 0.15, cy - r * 1.02); ctx.rotate(-0.7);
    ctx.fillStyle = YEL; ctx.fillRect(-r * 0.6, -r * 0.05, r * 1.2, r * 0.1); ctx.strokeStyle = NAVY; ctx.lineWidth = 4; ctx.strokeRect(-r * 0.6, -r * 0.05, r * 1.2, r * 0.1);
    ctx.fillStyle = '#F4C7A1'; ctx.beginPath(); ctx.moveTo(r * 0.6, -r * 0.05); ctx.lineTo(r * 0.75, 0); ctx.lineTo(r * 0.6, r * 0.05); ctx.fill();
    ctx.restore();
    dot(cx, cy - r * 0.05, r * 1.1, LOOK.lucia.hair);
  }
  if (kind === 'tommy') {
    dot(cx, cy + r * 0.12, r * 1.25, LOOK.tommy.shirt);
  }
}
function hairFront(kind, cx, cy, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, 7); ctx.clip();
  if (kind === 'salvo') { ctx.fillStyle = LOOK.salvo.hair; ctx.fillRect(cx - r, cy - r, r * 2, r * 0.48); ctx.fillRect(cx - r, cy - r, r * 0.22, r * 0.95); ctx.fillRect(cx + r * 0.78, cy - r, r * 0.22, r * 0.95); }
  if (kind === 'lucia') { ctx.fillStyle = LOOK.lucia.hair; ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy - r * 0.2); ctx.quadraticCurveTo(cx + r * 0.2, cy - r * 0.62, cx - r * 0.3, cy - r * 0.42); ctx.quadraticCurveTo(cx - r * 0.8, cy - r * 0.3, cx - r, cy); ctx.closePath(); ctx.fill(); }
  if (kind === 'tommy') { ctx.fillStyle = LOOK.tommy.hair; ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy - r * 0.45); for (let k = 0; k <= 6; k++) ctx.lineTo(cx + r - k * r / 3, cy - r * (k % 2 ? 0.28 : 0.45)); ctx.closePath(); ctx.fill(); }
  if (kind === 'nino') { ctx.fillStyle = '#7C8AA5'; ctx.fillRect(cx - r, cy - r, r * 2, r * 0.42); }
  ctx.restore();
  ctx.strokeStyle = NAVY; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
  if (kind === 'salvo') { // occhiali sulla fronte
    [-1, 1].forEach(sd => { ctx.fillStyle = 'rgba(190,225,255,.85)'; ctx.beginPath(); ctx.arc(cx + sd * r * 0.3, cy - r * 0.6, r * 0.17, 0, 7); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = 4; ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(cx - r * 0.13, cy - r * 0.6); ctx.lineTo(cx + r * 0.13, cy - r * 0.6); ctx.stroke();
  }
  if (kind === 'nino') { // coppola
    ctx.fillStyle = '#7C8AA5'; ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.72, r * 1.0, r * 0.38, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + r * 0.35, cy - r * 0.68, r * 0.75, r * 0.14, 0.05, 0, 7); ctx.fill(); ctx.stroke();
  }
}

// person: x = piedi al centro, y = pavimento, h = altezza totale. f = espressione e posa.
function person(x, y, h, f, t, legs, heads, holdBroken) {
  const L = LOOK[f.kind], bob = Math.sin(t * 3.2 + x * 0.01) * h * 0.006;
  const hipY = y - h * 0.42, shY = y - h * 0.74 + bob, w = h * L.wide;
  const runA = legs === 'run' ? Math.sin(t * 18) * h * 0.09 : 0;
  // gambe
  limb(x - h * 0.06, hipY, x - h * 0.07 + runA, y - h * 0.02, h * 0.075, L.pants);
  limb(x + h * 0.06, hipY, x + h * 0.07 - runA, y - h * 0.02, h * 0.075, L.pants);
  ctx.fillStyle = NAVY; rr(x - h * 0.13 + runA, y - h * 0.035, h * 0.1, h * 0.04, h * 0.02); ctx.fill(); rr(x + h * 0.03 - runA, y - h * 0.035, h * 0.1, h * 0.04, h * 0.02); ctx.fill();
  // busto
  ctx.fillStyle = L.shirt; ctx.strokeStyle = NAVY; ctx.lineWidth = 5;
  if (f.kind === 'salvo') { ctx.beginPath(); ctx.moveTo(x - w * 0.42, shY); ctx.lineTo(x + w * 0.42, shY); ctx.quadraticCurveTo(x + w * 0.62, hipY - h * 0.1, x + w * 0.45, hipY + h * 0.02); ctx.lineTo(x - w * 0.45, hipY + h * 0.02); ctx.quadraticCurveTo(x - w * 0.62, hipY - h * 0.1, x - w * 0.42, shY); ctx.fill(); ctx.stroke(); }
  else { rr(x - w / 2, shY, w, hipY - shY + h * 0.02, h * 0.06); ctx.fill(); ctx.stroke(); }
  if (f.kind === 'nino') { ctx.fillStyle = '#F2F4F8'; rr(x - w * 0.36, shY + h * 0.06, w * 0.72, hipY - shY + h * 0.1, h * 0.03); ctx.fill(); ctx.stroke(); }
  if (f.kind === 'tommy') { // cuffie al collo
    ctx.strokeStyle = '#26334D'; ctx.lineWidth = h * 0.025; ctx.beginPath(); ctx.arc(x, shY - h * 0.01, h * 0.09, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke();
    dot(x - h * 0.09, shY + h * 0.01, h * 0.03, YEL); dot(x + h * 0.09, shY + h * 0.01, h * 0.03, YEL);
  }
  // braccia
  const sxL = x - w * 0.42, sxR = x + w * 0.42, sy = shY + h * 0.04;
  const hL = [sxL + f.armL[0] * h, sy + f.armL[1] * h + h * 0.18], hR = [sxR + f.armR[0] * h, sy + f.armR[1] * h + h * 0.18];
  const head = {x: x, y: y - h * 0.86 + bob, r: h * L.headR};
  if (f.kind === 'tommy') head.y = y - h * 0.84 + bob;
  // testa (prima delle braccia, così le mani alzate passano davanti)
  ctx.lineWidth = 5;
  hairBack(f.kind, head.x, head.y, head.r);
  dot(head.x, head.y, head.r, SKIN);
  hairFront(f.kind, head.x, head.y, head.r);
  face(head.x, head.y, head.r, f, t, f.kind);
  limb(sxL, sy, hL[0], hL[1], h * 0.07, L.shirt, -h * 0.03);
  limb(sxR, sy, hR[0], hR[1], h * 0.07, L.shirt, h * 0.03);
  // oggetti in mano
  if (f.prop === 'remote') { ctx.save(); ctx.translate(hL[0], hL[1]); ctx.rotate(-0.5); ctx.fillStyle = '#26334D'; rr(-h * 0.08, -h * 0.02, h * 0.1, h * 0.04, 6); ctx.fill(); ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.arc(-h * 0.06, 0, h * 0.008, 0, 7); ctx.fill(); ctx.restore(); }
  if (f.prop === 'tablet') { const tw2 = h * 0.34, th = h * 0.22, tx = x - tw2 / 2, ty = (hL[1] + hR[1]) / 2 - th * 0.75; ctx.fillStyle = '#26334D'; rr(tx - 8, ty - 8, tw2 + 16, th + 16, 12); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = 5; ctx.stroke(); screenContent(tx, ty, tw2, th, t, holdBroken, 'tablet'); }
  dot(hL[0], hL[1], h * 0.036, SKIN); dot(hR[0], hR[1], h * 0.036, SKIN);
  if (heads) heads[f.kind] = {x: head.x, y: head.y - head.r};
}

// Lumo, la lampadina con la faccia
function mascot(cx, cy, s, o) {
  bulb(cx, cy, s, o.fill, o.cap, o.stroke);
  ctx.save(); ctx.translate(cx - 50 * s, cy - 42 * s); ctx.scale(s, s);
  const ink = o.ink || NAVY;
  [-10.5, 10.5].forEach((dx, i) => {
    const ex = 50 + dx, ey = 38, r = 6.6;
    const ry = Math.max(0.5, r * o.open);
    ctx.fillStyle = WH; ctx.beginPath(); ctx.ellipse(ex, ey, r, ry, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 0.9; ctx.stroke();
    if (o.open > 0.25) { ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(ex + o.px, ey + Math.max(-ry + 2.6, Math.min(ry - 2.6, o.py)), 2.9 * (o.pup || 1), 0, 7); ctx.fill(); }
    if (o.brows) { const b = o.brows[i]; ctx.strokeStyle = ink; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 6.5, ey - ry - 3.2 + b.dy + b.tilt); ctx.lineTo(ex + 6.5, ey - ry - 3.2 + b.dy - b.tilt); ctx.stroke(); }
  });
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const mx = 50, my = 54;
  ctx.beginPath();
  if (o.mouth === 'flat') { ctx.moveTo(mx - 6.5, my); ctx.lineTo(mx + 6.5, my); ctx.stroke(); }
  else if (o.mouth === 'o') { ctx.ellipse(mx, my + 1, 4.4, 6.2, 0, 0, 7); ctx.fill(); }
  else if (o.mouth === 'smile') { ctx.moveTo(mx - 9.5, my - 2.5); ctx.quadraticCurveTo(mx, my + 9, mx + 9.5, my - 2.5); ctx.stroke(); }
  else if (o.mouth === 'smirk') { ctx.moveTo(mx - 6, my + 1.5); ctx.quadraticCurveTo(mx + 1, my + 2.5, mx + 7, my - 2); ctx.stroke(); }
  else if (o.mouth === 'wavy') { ctx.moveTo(mx - 8, my); for (let k = 1; k <= 16; k++) ctx.lineTo(mx - 8 + k, my + 1.5 * Math.sin(k * 1.2)); ctx.stroke(); }
  ctx.restore();
}
