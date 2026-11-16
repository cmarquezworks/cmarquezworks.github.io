// glass.js: the hero. A poster is drawn on a 2D canvas, uploaded as a texture, and refracted by a
// melting glass blob in one WebGL fragment shader. No three.js. Falls back to the flat poster.
import { clamp, prefersReducedMotion } from './motion.js';

const PAPER = '#EEF0F3';
const INK = '#121317';
const BLUE = '#2B3CFF';
const ORANGE = '#FF5A1F';
const RULE = '#C2C7D1';

// Font size that fits text measured at 100px into maxW, never above max.
export const fitFontSize = (widthAt100, maxW, max) => Math.min(max, (100 * maxW) / widthAt100);

// Poster geometry for a w × h hero. `bar` is the height of the HTML action bar at the bottom.
export function posterLayout(w, h, bar = w / h < 0.9 ? 132 : 76) {
  const portrait = w / h < 0.9;
  const pad = Math.round(Math.max(16, Math.min(56, w * 0.035)));
  const U = h - bar;
  if (!portrait) {
    const sx = Math.round(w * 0.58);
    const r = Math.round(Math.min(U * 0.2, (w - sx) * 0.42));
    return { portrait, pad, bar, sx, sy: Math.round(U * 0.62), circle: { x: Math.round(w * 0.8), y: Math.round(U * 0.5), r }, nameMaxW: w - pad * 2, nameTop: Math.round(U * 0.18) };
  }
  const r = Math.round(Math.min(w * 0.2, U * 0.12));
  return { portrait, pad, bar, sx: 0, sy: Math.round(U * 0.66), circle: { x: Math.round(w - pad - r), y: Math.round(U * 0.78), r }, nameMaxW: w - pad * 2, nameTop: Math.round(U * 0.16) };
}

function drawPoster(g, w, h, L) {
  const U = h - L.bar;
  g.fillStyle = PAPER;
  g.fillRect(0, 0, w, h);
  g.fillStyle = RULE;
  if (!L.portrait) {
    for (let y = 0; y < L.sy; y += 9) g.fillRect(L.sx, y, w - L.sx, 4);
    for (let j = 0; L.sy + j * 14 < U; j++) for (let i = 0; L.sx + i * 14 < w; i++) if ((i + j) % 2 === 0) g.fillRect(L.sx + i * 14, L.sy + j * 14, 14, 14);
  } else {
    for (let y = L.sy; y < U; y += 9) g.fillRect(0, y, w, 4);
  }
  g.fillStyle = ORANGE;
  g.beginPath();
  g.arc(L.circle.x, L.circle.y, L.circle.r, 0, Math.PI * 2);
  g.fill();
  const display = (s) => { g.font = `900 ${s}px Archivo, sans-serif`; if ('fontStretch' in g) g.fontStretch = 'expanded'; };
  display(100);
  const s1 = fitFontSize(g.measureText('CHRISTIAN').width, L.nameMaxW, L.portrait ? 130 : 160);
  display(s1);
  g.fillStyle = INK;
  const b1 = L.nameTop + s1 * 0.78;
  g.fillText('CHRISTIAN', L.pad, b1);
  display(100);
  const s2 = fitFontSize(g.measureText('MARQUEZ').width, L.portrait ? L.nameMaxW : w * 0.7, s1 * 1.15);
  display(s2);
  g.fillStyle = BLUE;
  const b2 = b1 + s2 * 0.98;
  g.fillText('MARQUEZ', L.pad, b2);
  if ('fontStretch' in g) g.fontStretch = 'normal';
  g.font = `500 ${L.portrait ? 11 : 12}px "JetBrains Mono", monospace`;
  g.fillStyle = INK;
  const rowW = L.portrait ? w - L.pad * 2 : L.sx - L.pad * 2;
  ['(01) DESIGN', '(02) SPEC', '(03) BUILD', '(04) SHIP'].forEach((t, i) => g.fillText(t, L.pad + (i * rowW) / 4, b2 + 44));
  g.fillRect(L.pad, b2 + 56, rowW, 2);
  // the intro sentence, set in the poster so the glass bends it too
  const size = L.portrait ? 17 : 24;
  g.font = `500 ${size}px Archivo, sans-serif`;
  const words = 'I design the interface, then I build it. 9+ years of UI/UX and frontend work for clients in the Philippines, Canada and Japan.'.split(' ');
  const maxW = Math.min(rowW, size * 22);
  let line = '';
  let y = b2 + 56 + size * 2.4;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, L.pad, y); line = word; y += size * 1.35; } else line = test;
  }
  if (line && y < h - L.bar - 8) g.fillText(line, L.pad, y);
  g.font = `500 ${L.portrait ? 11 : 12}px "JetBrains Mono", monospace`;
  g.fillText('PORTFOLIO / 2014—2026', L.pad, L.pad + 14);
  if (!L.portrait) {
    g.textAlign = 'right';
    g.fillText('SANTA ROSA, PH · GMT+8', L.sx - 16, L.pad + 14);
    g.textAlign = 'left';
  }
}

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;uniform vec2 uRes;uniform vec2 uM;uniform float uT;uniform float uS;uniform vec3 uDrops[4];
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float sdf(vec2 p){vec2 d0=p-uM;float a0=atan(d0.y,d0.x+1e-4);
 float d=length(d0)-(92.+7.*sin(a0*3.+uT*1.7)+4.*sin(a0*5.-uT*2.3))*uS;
 vec2 c1=uM+vec2(cos(uT*.9),sin(uT*1.1))*128.*uS;d=smin(d,length(p-c1)-44.*uS,64.*uS);
 vec2 c2=uM+vec2(cos(uT*.6+2.),sin(uT*.8+1.))*165.*uS;d=smin(d,length(p-c2)-28.*uS,64.*uS);
 for(int i=0;i<4;i++){vec3 q=uDrops[i];if(q.z>0.)d=smin(d,length(p-q.xy)-q.z,56.*uS);}
 return d;}
void main(){vec2 p=gl_FragCoord.xy;vec2 uv=p/uRes;float d=sdf(p);
 vec3 bg=texture2D(uTex,uv).rgb;
 bg*=1.-(1.-smoothstep(0.,36.*uS,sdf(p+vec2(0.,20.*uS))))*.16;
 if(d>2.*uS){gl_FragColor=vec4(bg,1.);return;}
 vec2 e=vec2(1.5*uS,0.);
 vec2 n=normalize(vec2(sdf(p+e.xy)-sdf(p-e.xy),sdf(p+e.yx)-sdf(p-e.yx))+1e-6);
 float h=clamp(-d/(46.*uS),0.,1.);float bend=pow(1.-h,2.2);
 vec2 base=uv-n*bend*(40.*uS)/uRes+(uv-uM/uRes)*(-.14*h);
 float ca=.012*bend+.002;
 vec3 gc=vec3(texture2D(uTex,base+n*ca).r,texture2D(uTex,base).g,texture2D(uTex,base-n*ca).b);
 gc+=pow(1.-h,9.)*.6+pow(max(dot(n,normalize(vec2(-.55,.85))),0.),5.)*bend*.5;
 gc=mix(gc,vec3(1.),.05);
 gl_FragColor=vec4(mix(bg,gc,1.-smoothstep(-1.5*uS,1.5*uS,d)),1.);}`;

function makeGL(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  try {
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const u = (n) => gl.getUniformLocation(prog, n);
    gl.uniform1i(u('uTex'), 0);
    return { gl, tex, loc: { res: u('uRes'), m: u('uM'), t: u('uT'), s: u('uS'), drops: u('uDrops') } };
  } catch (err) {
    console.warn('glass: falling back to the flat poster', err);
    return null;
  }
}

export function initGlass(section) {
  const canvas = section.querySelector('.hero-canvas');
  if (!canvas) return;
  const reduce = prefersReducedMotion();
  const coarse = matchMedia('(pointer: coarse)').matches;
  const bar = section.querySelector('.hero-bar');
  const pauseB = section.querySelector('.hero-pause');
  const poster = document.createElement('canvas');
  const pg = poster.getContext('2d');
  const G = makeGL(canvas);
  const flat = G ? null : canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let dpr = 1;
  let L = null;
  let tx = 0;
  let ty = 0;
  let mx = 0;
  let my = 0;
  let last = -1e9;
  let vis = true;
  let paused = reduce;
  let raf = 0;
  const drops = [];
  const dropBuf = new Float32Array(12);
  const t0 = performance.now();

  function rest() { tx = W * 0.72; ty = (H - L.bar) * 0.42; }

  function paint() {
    const r = section.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    L = posterLayout(W, H, bar ? bar.offsetHeight : undefined);
    poster.width = Math.round(W * dpr);
    poster.height = Math.round(H * dpr);
    pg.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawPoster(pg, W, H, L);
    canvas.width = poster.width;
    canvas.height = poster.height;
    if (G) {
      const { gl, tex } = G;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poster);
    } else if (flat) {
      flat.drawImage(poster, 0, 0);
    }
    if (!mx && !my) { rest(); mx = tx; my = ty; }
    section.classList.add('is-painted');
    draw(performance.now());
  }

  function draw(now) {
    if (!G) return;
    const { gl, loc } = G;
    const t = (now - t0) / 1000;
    const s = dpr * clamp(W / 1100, 0.62, 1);
    gl.uniform2f(loc.res, canvas.width, canvas.height);
    gl.uniform2f(loc.m, mx * dpr, (H - my) * dpr);
    gl.uniform1f(loc.t, paused ? 0 : t);
    gl.uniform1f(loc.s, s);
    while (drops.length && now - drops[0].t > 3800) drops.shift();
    for (let i = 0; i < 4; i++) {
      const d = drops[i];
      let r = 0;
      if (d) {
        const a = now - d.t;
        const grow = 1 - Math.pow(1 - Math.min(a / 380, 1), 3);
        const fade = a < 2400 ? 1 : Math.max(0, 1 - (a - 2400) / 1400);
        r = 58 * grow * fade;
      }
      dropBuf[i * 3] = d ? d.x * dpr : 0;
      dropBuf[i * 3 + 1] = d ? (H - d.y) * dpr : 0;
      dropBuf[i * 3 + 2] = r > 0.5 ? r * s : 0;
    }
    gl.uniform3fv(loc.drops, dropBuf);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    raf = 0;
    if (!vis || document.hidden || paused) return;
    const t = (now - t0) / 1000;
    if (now - last > 2200) {
      const U = H - L.bar;
      tx = W * 0.5 + Math.cos(t * 0.5) * W * 0.3;
      ty = U * 0.45 + Math.sin(t * 0.8) * U * 0.22;
    }
    mx += (tx - mx) * 0.1;
    my += (ty - my) * 0.1;
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  // L is set by the first paint(); the observers below can fire before that, so wait for it.
  const start = () => { if (!raf && G && L && !paused && vis && !document.hidden) raf = requestAnimationFrame(frame); };

  section.addEventListener('pointermove', (e) => {
    const r = section.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    last = performance.now();
    if (paused && G) { mx = tx; my = ty; draw(last); } // paused: the glass follows without drifting
  });
  section.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button') || !G) return;
    const r = section.getBoundingClientRect();
    drops.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    if (drops.length > 4) drops.shift();
    if (paused) { const tick = (n) => { draw(n); if (drops.length && n - drops[drops.length - 1].t < 3900) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
  });

  if (pauseB) {
    if (!G) pauseB.hidden = true;
    const sync = () => { pauseB.setAttribute('aria-pressed', String(paused)); pauseB.querySelector('.hp-l').textContent = paused ? 'Play glass' : 'Pause glass'; };
    sync();
    pauseB.addEventListener('click', () => { paused = !paused; sync(); if (paused) { rest(); mx = tx; my = ty; draw(performance.now()); } else start(); });
  }

  new IntersectionObserver((es) => { vis = es[0].isIntersecting; start(); }).observe(section);
  document.addEventListener('visibilitychange', start);
  let rt = 0;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(paint, 120); }).observe(section);

  const fonts = document.fonts ? Promise.all([document.fonts.load('900 100px Archivo'), document.fonts.load('500 12px "JetBrains Mono"')]) : Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => { paint(); start(); });
  fonts.then(() => paint()).catch(() => {});
}
