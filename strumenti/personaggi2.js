// Personaggi «io ti consiglio», versione 2: gomiti, collo, orecchie, vestiti più curati, ombre,
// camminata, testa che si inclina, Lumo con le braccia e con schiacciamento/allungamento.
// Richiede base.js. Le pose si passano come prima (armL/armR = bersaglio della mano rispetto alla spalla, in unità di altezza).
const SKIN = '#F4C7A1', SKIN_D = '#E2A984';
const LOOK = {
  salvo: {shirt: '#8EC5FF', shirtD: '#6BAAEB', pants: '#3B4A66', hair: '#3A2A20', wide: 0.38, headR: 0.12},
  lucia: {shirt: '#E2A73A', shirtD: '#C98D22', pants: '#26334D', hair: '#7A4A2A', wide: 0.3, headR: 0.12},
  tommy: {shirt: '#2F5597', shirtD: '#24467E', pants: '#5B6B86', hair: '#4A3222', wide: 0.32, headR: 0.15},
  nino:  {shirt: '#9AAAC4', shirtD: '#7C8CA8', pants: '#3B4A66', hair: '#E8E8E8', wide: 0.36, headR: 0.12}
};
const eio = (p) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };

function spinner(cx, cy, r, t) {
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + t * 6;
    ctx.globalAlpha = 0.25 + 0.75 * (k / 7);
    ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.2, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function dot(x, y, r, fill, lw) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = lw || 5; ctx.stroke(); }
function seg(pts, w, color) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  [[w + 10, NAVY], [w, color]].forEach(([lw, c]) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke(); });
}
// cinematica inversa a due segmenti: il gomito va sempre verso l'esterno (side -1 = sinistra, +1 = destra)
function ik(sx, sy, tx, ty, l1, l2, side) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.5;
  if (d > max) { tx = sx + dx / d * max; ty = sy + dy / d * max; d = max; }
  d = Math.max(d, Math.abs(l1 - l2) + 1);
  const a = Math.atan2(ty - sy, tx - sx), A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const e1 = [sx + Math.cos(a + A) * l1, sy + Math.sin(a + A) * l1], e2 = [sx + Math.cos(a - A) * l1, sy + Math.sin(a - A) * l1];
  const e = side < 0 ? (e1[0] < e2[0] ? e1 : e2) : (e1[0] > e2[0] ? e1 : e2);
  return {e, h: [tx, ty]};
}

function face(cx, cy, r, f, t, kind) {
  const ex = r * 0.36, ey = cy - r * 0.02;
  const lx = (f.look || [0, 0])[0] * r * 0.12, ly = (f.look || [0, 0])[1] * r * 0.12;
  // guance
  ctx.fillStyle = 'rgba(229,72,77,.18)'; ctx.beginPath(); ctx.ellipse(cx - r * 0.55, cy + r * 0.28, r * 0.16, r * 0.1, 0, 0, 7); ctx.ellipse(cx + r * 0.55, cy + r * 0.28, r * 0.16, r * 0.1, 0, 0, 7); ctx.fill();
  [-1, 1].forEach(sd => {
    const x = cx + sd * ex;
    ctx.strokeStyle = NAVY; ctx.fillStyle = NAVY; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const wink = f.wink && sd === 1;
    if (wink || f.eyes === 'closed') { ctx.beginPath(); ctx.arc(x, ey - r * 0.04, r * 0.12, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    else if (f.eyes === 'wide') { ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(x, ey, r * 0.21, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(x + lx, ey + ly, r * 0.085, 0, 7); ctx.fill(); ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(x + lx + r * 0.03, ey + ly - r * 0.03, r * 0.025, 0, 7); ctx.fill(); }
    else if (f.eyes === 'happy') { ctx.beginPath(); ctx.arc(x, ey + r * 0.06, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (f.eyes === 'squint') { ctx.beginPath(); ctx.moveTo(x - r * 0.13, ey - sd * 0); ctx.lineTo(x + r * 0.13, ey); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x + lx * 0.5, ey + r * 0.03, r * 0.06, r * 0.05, 0, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.ellipse(x + lx * 0.6, ey + ly * 0.6, r * 0.075, r * 0.11, 0, 0, 7); ctx.fill(); ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(x + lx * 0.6 + r * 0.025, ey + ly * 0.6 - r * 0.04, r * 0.022, 0, 7); ctx.fill(); }
    const by = ey - r * (f.eyes === 'wide' ? 0.36 : 0.27) + (f.browY || 0) * r;
    if (f.brows && f.brows !== 'none') {
      const up = f.brows === 'up' ? -r * 0.08 : 0;
      const yin = by + up + (f.brows === 'worried' ? -r * 0.08 : f.brows === 'angry' ? r * 0.09 : 0);
      const yout = by + up + (f.brows === 'worried' ? r * 0.04 : f.brows === 'angry' ? -r * 0.04 : 0) + (f.brows === 'raise1' && sd === 1 ? -r * 0.12 : 0);
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + sd * r * 0.15, yout); ctx.quadraticCurveTo(x, Math.min(yin, yout) - r * 0.03, x - sd * r * 0.15, yin); ctx.stroke();
    }
  });
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy + r * 0.2, r * 0.08, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
  const my = cy + r * (kind === 'salvo' || kind === 'nino' ? 0.58 : 0.5);
  let m = f.mouth;
  ctx.strokeStyle = NAVY; ctx.fillStyle = NAVY; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  if (m === 'talk' || m === 'shout') {
    const big = m === 'shout' ? 1.6 : 1;
    const o = (0.05 + 0.14 * Math.abs(Math.sin(t * 13))) * big;
    ctx.ellipse(cx, my + r * 0.02, r * 0.17 * (m === 'shout' ? 1.4 : 1), r * o, 0, 0, 7); ctx.fill();
    if (o > 0.1) { ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.ellipse(cx, my + r * o * 0.55, r * 0.09, r * Math.min(0.06, o * 0.4), 0, 0, 7); ctx.fill(); }
  }
  else if (m === 'smile') { ctx.arc(cx, my - r * 0.12, r * 0.22, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  else if (m === 'smirk') { ctx.moveTo(cx - r * 0.18, my + r * 0.02); ctx.quadraticCurveTo(cx + r * 0.05, my + r * 0.08, cx + r * 0.22, my - r * 0.08); ctx.stroke(); }
  else if (m === 'grin') { ctx.moveTo(cx - r * 0.26, my - r * 0.04); ctx.quadraticCurveTo(cx, my + r * 0.34, cx + r * 0.26, my - r * 0.04); ctx.closePath(); ctx.fill(); ctx.fillStyle = WH; ctx.fillRect(cx - r * 0.16, my - r * 0.02, r * 0.32, r * 0.06); }
  else if (m === 'open') { ctx.ellipse(cx, my + r * 0.04, r * 0.15, r * 0.19, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.ellipse(cx, my + r * 0.13, r * 0.09, r * 0.06, 0, 0, 7); ctx.fill(); }
  else if (m === 'o') { ctx.ellipse(cx, my + r * 0.02, r * 0.08, r * 0.1, 0, 0, 7); ctx.fill(); }
  else if (m === 'grit') { ctx.fillStyle = WH; rr(cx - r * 0.24, my - r * 0.08, r * 0.48, r * 0.18, 6); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - r * 0.24, my + r * 0.01); ctx.lineTo(cx + r * 0.24, my + r * 0.01); ctx.stroke(); }
  else if (m === 'wavy') { ctx.moveTo(cx - r * 0.2, my); for (let k = 1; k <= 12; k++) ctx.lineTo(cx - r * 0.2 + k * r * 0.4 / 12, my + r * 0.04 * Math.sin(k * 1.3)); ctx.stroke(); }
  else { ctx.moveTo(cx - r * 0.16, my); ctx.lineTo(cx + r * 0.16, my); ctx.stroke(); }
  if (kind === 'salvo' || kind === 'nino') {
    const wig = (m === 'talk' || m === 'shout') ? Math.sin(t * 13) * r * 0.02 : 0;
    ctx.fillStyle = kind === 'salvo' ? LOOK.salvo.hair : '#E8E8E8'; ctx.strokeStyle = NAVY; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx - r * 0.16, cy + r * 0.37 + wig, r * 0.21, r * 0.085, -0.25, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + r * 0.16, cy + r * 0.37 + wig, r * 0.21, r * 0.085, 0.25, 0, 7); ctx.fill(); ctx.stroke();
  }
}

function hairBack(kind, cx, cy, r) {
  if (kind === 'lucia') {
    dot(cx + r * 0.15, cy - r * 1.02, r * 0.38, LOOK.lucia.hair);
    ctx.save(); ctx.translate(cx + r * 0.15, cy - r * 1.02); ctx.rotate(-0.7);
    ctx.fillStyle = YEL; ctx.fillRect(-r * 0.6, -r * 0.05, r * 1.2, r * 0.1); ctx.strokeStyle = NAVY; ctx.lineWidth = 4; ctx.strokeRect(-r * 0.6, -r * 0.05, r * 1.2, r * 0.1);
    ctx.restore();
    dot(cx, cy - r * 0.05, r * 1.1, LOOK.lucia.hair);
  }
  if (kind === 'tommy') dot(cx, cy + r * 0.12, r * 1.25, LOOK.tommy.shirt);
}
function hairFront(kind, cx, cy, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, 7); ctx.clip();
  // ombra sotto i capelli
  ctx.fillStyle = 'rgba(14,34,64,.08)'; ctx.beginPath(); ctx.arc(cx + r * 0.25, cy + r * 0.2, r, 0, 7); ctx.fill();
  if (kind === 'salvo') { ctx.fillStyle = LOOK.salvo.hair; ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy + r * 0.0); ctx.lineTo(cx + r * 0.78, cy + r * 0.0); ctx.quadraticCurveTo(cx + r * 0.7, cy - r * 0.55, cx, cy - r * 0.55); ctx.quadraticCurveTo(cx - r * 0.7, cy - r * 0.55, cx - r * 0.78, cy); ctx.lineTo(cx - r, cy); ctx.closePath(); ctx.fill(); }
  if (kind === 'lucia') { ctx.fillStyle = LOOK.lucia.hair; ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy - r * 0.2); ctx.quadraticCurveTo(cx + r * 0.2, cy - r * 0.62, cx - r * 0.3, cy - r * 0.42); ctx.quadraticCurveTo(cx - r * 0.8, cy - r * 0.3, cx - r, cy); ctx.closePath(); ctx.fill(); }
  if (kind === 'tommy') { ctx.fillStyle = LOOK.tommy.hair; ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy - r * 0.45); for (let k = 0; k <= 6; k++) ctx.lineTo(cx + r - k * r / 3, cy - r * (k % 2 ? 0.28 : 0.45)); ctx.closePath(); ctx.fill(); }
  if (kind === 'nino') { ctx.fillStyle = '#E8E8E8'; ctx.fillRect(cx - r, cy - r * 0.4, r * 0.2, r * 0.6); ctx.fillRect(cx + r * 0.8, cy - r * 0.4, r * 0.2, r * 0.6); }
  ctx.restore();
  ctx.strokeStyle = NAVY; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
  if (kind === 'salvo') {
    [-1, 1].forEach(sd => { ctx.fillStyle = 'rgba(190,225,255,.9)'; ctx.beginPath(); ctx.arc(cx + sd * r * 0.3, cy - r * 0.66, r * 0.17, 0, 7); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = 4; ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(cx - r * 0.13, cy - r * 0.66); ctx.lineTo(cx + r * 0.13, cy - r * 0.66); ctx.stroke();
  }
  if (kind === 'nino') {
    ctx.fillStyle = '#7C8AA5'; ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.62, r * 1.02, r * 0.5, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + r * 0.3, cy - r * 0.6, r * 0.8, r * 0.15, 0.05, 0, 7); ctx.fill(); ctx.stroke();
  }
}

// person: x = piedi al centro, y = pavimento, h = altezza. f = posa ed espressione.
// f.lean (rad, busto), f.tilt (rad, testa), f.shrug (0..1), f.walk (fase, oppure undefined), f.jump (px verso l'alto)
function person(x, y, h, f, t, heads) {
  const L = LOOK[f.kind], w = h * L.wide;
  const breathe = Math.sin(t * 2.6 + x * 0.01) * h * 0.004;
  const walking = f.walk !== undefined;
  const wp = walking ? f.walk : 0;
  const lift = walking ? Math.abs(Math.sin(wp)) * h * 0.02 : 0;
  const jy = -(f.jump || 0) - lift;
  // ombra
  ctx.fillStyle = 'rgba(14,34,64,.16)'; ctx.beginPath(); ctx.ellipse(x, y + 4, w * 0.62 * (1 - Math.min(0.4, (f.jump || 0) / 300)), h * 0.025, 0, 0, 7); ctx.fill();
  const hipY = y - h * 0.42 + jy;
  // gambe con passo
  [-1, 1].forEach(sd => {
    const up = walking ? Math.max(0, Math.sin(wp + (sd < 0 ? 0 : Math.PI))) * h * 0.06 : 0;
    const fx = x + sd * h * 0.07 + (walking ? Math.sin(wp + (sd < 0 ? 0 : Math.PI)) * h * 0.03 : 0);
    const knee = [x + sd * h * 0.075, hipY + h * 0.2 - up * 0.5];
    seg([[x + sd * h * 0.06, hipY], knee, [fx, y - h * 0.025 - up + jy * 0.0 - (f.jump || 0)]], h * 0.078, L.pants);
    ctx.fillStyle = NAVY; ctx.beginPath(); ctx.ellipse(fx + sd * h * 0.02, y - h * 0.02 - up - (f.jump || 0), h * 0.06, h * 0.03, 0, 0, 7); ctx.fill();
  });
  // busto (ruotato attorno all'anca)
  ctx.save(); ctx.translate(x, hipY); ctx.rotate(f.lean || 0); ctx.translate(-x, -hipY);
  const shY = y - h * 0.74 + breathe + jy - (f.shrug || 0) * h * 0.03;
  ctx.fillStyle = L.shirt; ctx.strokeStyle = NAVY; ctx.lineWidth = 5;
  if (f.kind === 'salvo') { ctx.beginPath(); ctx.moveTo(x - w * 0.42, shY); ctx.lineTo(x + w * 0.42, shY); ctx.quadraticCurveTo(x + w * 0.64, hipY - h * 0.1, x + w * 0.45, hipY + h * 0.03); ctx.lineTo(x - w * 0.45, hipY + h * 0.03); ctx.quadraticCurveTo(x - w * 0.64, hipY - h * 0.1, x - w * 0.42, shY); ctx.fill(); ctx.stroke(); }
  else { rr(x - w / 2, shY, w, hipY - shY + h * 0.03, h * 0.06); ctx.fill(); ctx.stroke(); }
  // ombra laterale del busto
  ctx.save(); ctx.clip(); ctx.fillStyle = L.shirtD; ctx.globalAlpha = 0.55; ctx.fillRect(x + w * 0.22, shY, w * 0.4, hipY - shY + h * 0.05); ctx.restore();
  // dettagli dei vestiti
  ctx.strokeStyle = NAVY; ctx.lineWidth = 4;
  if (f.kind === 'salvo') { ctx.fillStyle = WH; ctx.beginPath(); ctx.moveTo(x - h * 0.05, shY); ctx.lineTo(x, shY + h * 0.05); ctx.lineTo(x + h * 0.05, shY); ctx.closePath(); ctx.fill(); ctx.stroke(); for (let k = 0; k < 3; k++) dot(x, shY + h * (0.1 + k * 0.08), h * 0.007, NAVY, 2); ctx.beginPath(); ctx.moveTo(x - w * 0.47, hipY - h * 0.005); ctx.lineTo(x + w * 0.47, hipY - h * 0.005); ctx.stroke(); }
  if (f.kind === 'nino') { ctx.beginPath(); ctx.moveTo(x, shY + h * 0.04); ctx.lineTo(x, hipY + h * 0.03); ctx.stroke(); for (let k = 0; k < 4; k++) dot(x + h * 0.02, shY + h * (0.08 + k * 0.065), h * 0.008, '#E8E8E8', 2); ctx.fillStyle = WH; ctx.beginPath(); ctx.moveTo(x - h * 0.045, shY); ctx.lineTo(x, shY + h * 0.06); ctx.lineTo(x + h * 0.045, shY); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (f.kind === 'lucia') { ctx.beginPath(); ctx.moveTo(x - w * 0.5, hipY - h * 0.02); ctx.lineTo(x + w * 0.5, hipY - h * 0.02); ctx.stroke(); ctx.beginPath(); ctx.arc(x, shY, h * 0.045, 0.2, Math.PI - 0.2); ctx.stroke(); }
  if (f.kind === 'tommy') { rr(x - w * 0.3, hipY - h * 0.12, w * 0.6, h * 0.09, h * 0.02); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - h * 0.03, shY + h * 0.02); ctx.lineTo(x - h * 0.035, shY + h * 0.12); ctx.moveTo(x + h * 0.03, shY + h * 0.02); ctx.lineTo(x + h * 0.035, shY + h * 0.12); ctx.stroke(); }
  // collo e testa
  const neckY = shY - h * 0.015;
  const head = {x: x, y: y - h * (f.kind === 'tommy' ? 0.84 : 0.86) + breathe + jy - (f.shrug || 0) * h * 0.015, r: h * L.headR};
  ctx.fillStyle = SKIN; ctx.fillRect(x - h * 0.03, head.y + head.r * 0.6, h * 0.06, neckY - head.y - head.r * 0.6 + h * 0.02);
  ctx.save(); ctx.translate(head.x, head.y + head.r * 0.9); ctx.rotate(f.tilt || 0); ctx.translate(-head.x, -(head.y + head.r * 0.9));
  hairBack(f.kind, head.x, head.y, head.r);
  dot(head.x - head.r * 0.97, head.y + head.r * 0.08, head.r * 0.2, SKIN); dot(head.x + head.r * 0.97, head.y + head.r * 0.08, head.r * 0.2, SKIN);
  dot(head.x, head.y, head.r, SKIN);
  hairFront(f.kind, head.x, head.y, head.r);
  face(head.x, head.y, head.r, f, t, f.kind);
  ctx.restore();
  if (f.kind === 'tommy') { ctx.strokeStyle = '#26334D'; ctx.lineWidth = h * 0.025; ctx.beginPath(); ctx.arc(x, shY - h * 0.01, h * 0.09, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke(); dot(x - h * 0.09, shY + h * 0.01, h * 0.03, YEL); dot(x + h * 0.09, shY + h * 0.01, h * 0.03, YEL); }
  // braccia con gomito
  const sy = shY + h * 0.045, l1 = h * 0.19, l2 = h * 0.19;
  const arms = {};
  [['l', -1, f.armL], ['r', 1, f.armR]].forEach(([k, sd, a]) => {
    const sx = x + sd * w * 0.42;
    const res = ik(sx, sy, sx + a[0] * h, sy + a[1] * h + h * 0.18, l1, l2, sd);
    seg([[sx, sy], res.e, res.h], h * 0.07, L.shirt);
    arms[k] = res.h;
  });
  ctx.restore();
  // mani (fuori dalla rotazione del busto, posizione già ruotata approssimata)
  const rot = (p) => { const a = f.lean || 0, dx = p[0] - x, dy = p[1] - hipY; return [x + dx * Math.cos(a) - dy * Math.sin(a), hipY + dx * Math.sin(a) + dy * Math.cos(a)]; };
  const hL = rot(arms.l), hR = rot(arms.r);
  if (f.holdL) f.holdL(hL[0], hL[1]);
  if (f.holdR) f.holdR(hR[0], hR[1]);
  [hL, hR].forEach((p, k) => { dot(p[0], p[1], h * 0.037, SKIN); dot(p[0] + (k ? -1 : 1) * h * 0.028, p[1] - h * 0.018, h * 0.016, SKIN, 3); });
  const hd = rot([head.x, head.y - head.r]);
  if (heads) { heads[f.kind] = {x: hd[0], y: hd[1], cx: rot([head.x, head.y])[0], cy: rot([head.x, head.y])[1], r: head.r}; heads[f.kind + '_mani'] = {l: hL, r: hR}; }
}

// Lumo: o.arms = {l:[dx,dy], r:[dx,dy]} in unità della lampadina (raggio vetro = 28), o.sq = schiacciamento verticale (1 = normale)
function mascot(cx, cy, s, o) {
  const sq = o.sq || 1;
  ctx.save(); ctx.translate(cx, cy + 50 * s); ctx.scale(1 / Math.sqrt(sq), sq); ctx.translate(-cx, -(cy + 50 * s));
  if (o.arms) {
    [['l', 28, o.arms.l], ['r', 72, o.arms.r]].forEach(([k, ax, a]) => {
      const sx = cx + (ax - 50) * s, sy = cy + 6 * s;
      const hx = sx + a[0] * s, hy = sy + a[1] * s;
      ctx.strokeStyle = NAVY; ctx.lineWidth = 3.6 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + hx) / 2 + (k === 'l' ? -6 : 6) * s, (sy + hy) / 2 + 4 * s, hx, hy); ctx.stroke();
      ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(hx, hy, 3.4 * s, 0, 7); ctx.fill();
      if (a[2] === 'point') { ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + a[3] * s, hy + a[4] * s); ctx.stroke(); }
    });
  }
  bulb(cx, cy, s, o.fill, o.cap, o.stroke);
  ctx.save(); ctx.translate(cx - 50 * s, cy - 42 * s); ctx.scale(s, s);
  const ink = o.ink || NAVY;
  [-10.5, 10.5].forEach((dx, i) => {
    const ex = 50 + dx, ey = 38, r = 6.6;
    const wink = o.wink && i === 1;
    const ry = wink ? 0.5 : Math.max(0.5, r * o.open);
    ctx.fillStyle = WH; ctx.beginPath(); ctx.ellipse(ex, ey, r, ry, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 0.9; ctx.stroke();
    if (wink) { ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(ex, ey + 1, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (o.open > 0.25) { ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(ex + o.px, ey + Math.max(-ry + 2.6, Math.min(ry - 2.6, o.py)), 2.9 * (o.pup || 1), 0, 7); ctx.fill(); ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(ex + o.px + 0.9, ey + o.py - 1, 0.8, 0, 7); ctx.fill(); }
    if (o.brows) { const b = o.brows[i]; ctx.strokeStyle = ink; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 6.5, ey - ry - 3.2 + b.dy + b.tilt); ctx.lineTo(ex + 6.5, ey - ry - 3.2 + b.dy - b.tilt); ctx.stroke(); }
  });
  ctx.fillStyle = 'rgba(229,72,77,.22)'; ctx.beginPath(); ctx.ellipse(33, 48, 4, 2.5, 0, 0, 7); ctx.ellipse(67, 48, 4, 2.5, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const mx = 50, my = 54;
  ctx.beginPath();
  if (o.mouth === 'talk') { const op = 1 + 5 * Math.abs(Math.sin(o.t * 13)); ctx.ellipse(mx, my + 1, 4.6, op, 0, 0, 7); ctx.fill(); }
  else if (o.mouth === 'flat') { ctx.moveTo(mx - 6.5, my); ctx.lineTo(mx + 6.5, my); ctx.stroke(); }
  else if (o.mouth === 'o') { ctx.ellipse(mx, my + 1, 4.4, 6.2, 0, 0, 7); ctx.fill(); }
  else if (o.mouth === 'smile') { ctx.moveTo(mx - 9.5, my - 2.5); ctx.quadraticCurveTo(mx, my + 9, mx + 9.5, my - 2.5); ctx.stroke(); }
  else if (o.mouth === 'grin') { ctx.moveTo(mx - 10, my - 3); ctx.quadraticCurveTo(mx, my + 11, mx + 10, my - 3); ctx.closePath(); ctx.fill(); }
  else if (o.mouth === 'smirk') { ctx.moveTo(mx - 6, my + 1.5); ctx.quadraticCurveTo(mx + 1, my + 2.5, mx + 7, my - 2); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}

// tracce di posa: chiavi {t, ...campi}; i numeri e gli array numerici si interpolano in `dur` secondi con un piccolo rimbalzo
function track(keys, t, dur) {
  if (!keys._filled) { for (let j = 1; j < keys.length; j++) for (const f in keys[j - 1]) if (!(f in keys[j]) && f !== 'd') keys[j][f] = keys[j - 1][f]; keys._filled = true; }
  dur = dur || 0.32;
  let i = 0; while (i + 1 < keys.length && keys[i + 1].t <= t) i++;
  const k = keys[i], p = keys[i - 1];
  if (!p || t < k.t) return Object.assign({}, k);
  const q = ebk((t - k.t) / (k.d || dur));
  const out = Object.assign({}, k);
  for (const f in k) {
    if (f === 't' || f === 'd') continue;
    if (typeof k[f] === 'number' && typeof p[f] === 'number') out[f] = lerp(p[f], k[f], q);
    else if (Array.isArray(k[f]) && Array.isArray(p[f]) && typeof k[f][0] === 'number') out[f] = k[f].map((v, j) => typeof v === 'number' ? lerp(p[f][j], v, q) : v);
  }
  return out;
}
// telecamera: chiavi {t, z, x, y, d}; x,y = punto dello schermo da portare al centro della vignetta
function camAt(keys, t) {
  let i = 0; while (i + 1 < keys.length && keys[i + 1].t <= t) i++;
  const k = keys[i], p = keys[i - 1];
  if (!p) return k;
  const q = eio((t - k.t) / (k.d || 0.45));
  return {z: lerp(p.z, k.z, q), x: lerp(p.x, k.x, q), y: lerp(p.y, k.y, q)};
}
// linee di velocità attorno a un punto, stile manga
function speedLines(cx, cy, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * 0.55; ctx.fillStyle = NAVY;
  for (let k = 0; k < 44; k++) {
    const ang = k / 44 * Math.PI * 2 + Math.sin(k * 7.3) * 0.05, r0 = 260 + 60 * Math.abs(Math.sin(k * 3.1 + Math.floor(t * 12))), r1 = 1100, wd = 0.012 + 0.012 * Math.abs(Math.sin(k * 5.7));
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang - wd) * r1, cy + Math.sin(ang - wd) * r1); ctx.lineTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); ctx.lineTo(cx + Math.cos(ang + wd) * r1, cy + Math.sin(ang + wd) * r1); ctx.fill();
  }
  ctx.restore();
}
