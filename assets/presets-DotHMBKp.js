const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./detect-_T5TTqDK.js","./index-BkqjTJAE.js","./index-Da6XihgR.css","./masks-ChSKZ8sp.js"])))=>i.map(i=>d[i]);
import{_ as xt}from"./index-BkqjTJAE.js";import{bodyFlags as Wt}from"./detect-_T5TTqDK.js";const Yt=`
uniform float uFxOn;
uniform float uFxE[12];
uniform float uFxV[12];
uniform float uHsl[24];
uniform float uGrd[10];
uniform vec2 uGlowR;     // glow radius in texture uv
uniform float uGlowLod;
uniform float uFxSeed;
uniform float uFxSeg;   // 1 when the scene map is ready
uniform sampler2D uFxD; // scene map: r skin, g depth (1 = near), b person

vec3 joHsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x);
}
vec3 joRgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}
vec3 joScreen(vec3 a, vec3 b) { return 1.0 - (1.0 - a) * (1.0 - clamp(b, 0.0, 1.0)); }
float joH(vec2 p) { return hash(p + vec2(uFxSeed * 17.0, uFxSeed * 31.0)); }
float joCirc(float a, float b) { float d = a - b; return d - 360.0 * floor((d + 180.0) / 360.0); }

const float JC[8] = float[8](0.0, 30.0, 60.0, 120.0, 180.0, 225.0, 275.0, 320.0);

vec3 joMix(vec3 c) {
  vec3 hsv = joHsv(c);
  float h = hsv.x * 360.0;
  float dh = 0.0, ds = 0.0, dl = 0.0;
  for (int i = 0; i < 8; i++) {
    float cc = JC[i], pv = JC[(i + 7) % 8], nx = JC[(i + 1) % 8];
    float d = joCirc(h, cc);
    float span = d < 0.0 ? mod(cc - pv + 360.0, 360.0) : mod(nx - cc + 360.0, 360.0);
    float w = max(0.0, 1.0 - abs(d) / span);
    dh += uHsl[i * 3] * w; ds += uHsl[i * 3 + 1] * w; dl += uHsl[i * 3 + 2] * w;
  }
  float sw = smoothstep(0.03, 0.2, hsv.y);
  float y0 = luma(c);
  hsv.x = fract(hsv.x + dh * sw * 30.0 / 360.0 + 1.0);
  hsv.y = clamp(hsv.y * (1.0 + ds * sw), 0.0, 1.0);
  vec3 o = joRgb(hsv);
  // keep the pixel's brightness through hue/sat moves, then apply the band's light change
  o *= (y0 + 0.002) / (luma(o) + 0.002);
  float lw = dl * sw * min(1.0, hsv.y * 1.6);
  o = lw > 0.0 ? mix(o, o + (1.0 - o) * 0.6, lw * 0.6) : o * (1.0 + lw * 0.6);
  return clamp(o, 0.0, 1.0);
}

vec3 joGrade(vec3 c) {
  float l = clamp(luma(c) + uGrd[6] * 0.25, 0.0, 1.0);
  float wS = pow(1.0 - smoothstep(0.0, 0.55, l), 1.5), wH = smoothstep(0.45, 1.0, l), wM = max(0.0, 1.0 - wS - wH);
  vec3 tS = joRgb(vec3(uGrd[0], 1.0, 1.0)), tM = joRgb(vec3(uGrd[2], 1.0, 1.0)), tH = joRgb(vec3(uGrd[4], 1.0, 1.0));
  c += (tS - luma(tS)) * uGrd[1] * wS * 0.22 + (tM - luma(tM)) * uGrd[3] * wM * 0.16 + (tH - luma(tH)) * uGrd[5] * wH * 0.2;
  if (uGrd[8] > 0.0) {
    // keep one colour, the rest goes black & white
    vec3 hsv = joHsv(clamp(c, 0.0, 1.0));
    float d = abs(joCirc(hsv.x * 360.0, uGrd[7] * 360.0));
    float wdt = mix(14.0, 60.0, uGrd[9]);
    float keep = (1.0 - smoothstep(wdt * 0.5, wdt, d)) * smoothstep(0.08, 0.25, hsv.y);
    c = mix(c, vec3(luma(c)), uGrd[8] * (1.0 - keep));
  }
  return clamp(c, 0.0, 1.0);
}

vec3 joOrbCol(float v, float r) {
  if (v < 0.5) return mix(vec3(1.0, 0.72, 0.38), vec3(1.0, 0.86, 0.6), r);
  if (v < 1.5) return r < 0.33 ? vec3(1.0, 0.6, 0.3) : r < 0.66 ? vec3(0.45, 0.75, 1.0) : vec3(1.0, 0.4, 0.55);
  if (v < 2.5) return mix(vec3(1.0, 0.45, 0.7), vec3(1.0, 0.7, 0.8), r);
  return mix(vec3(0.35, 0.6, 1.0), vec3(0.55, 0.85, 1.0), r);
}

vec3 joOrbs(vec2 P, float v, float amt) {
  vec3 acc = vec3(0.0);
  for (int L = 0; L < 3; L++) {
    float sc = L == 0 ? 0.15 : L == 1 ? 0.09 : 0.05;
    vec2 g = P / sc, id = floor(g);
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 cid = id + vec2(float(i), float(j)) + float(L) * 57.0;
      if (joH(cid) > 0.07 + amt * 0.2) continue;
      vec2 ctr = cid - float(L) * 57.0 + vec2(0.15) + 0.7 * vec2(joH(cid + 1.7), joH(cid + 5.3));
      float rad = 0.18 + 0.32 * joH(cid + 9.1);
      float d = length(g - ctr) / rad;
      float edge = L == 2 ? 0.45 : L == 1 ? 0.22 : 0.14;
      float disk = 1.0 - smoothstep(1.0 - edge, 1.0, d);
      disk *= 0.82 + 0.18 * smoothstep(0.5, 0.97, d);       // a lens bokeh is a touch brighter at its rim
      float b = joH(cid + 7.7); b = 0.12 + 0.88 * b * b * b;  // a few bright lights, many faint ones
      acc += joOrbCol(v, joH(cid + 3.3)) * disk * b * (L == 0 ? 0.9 : L == 1 ? 0.75 : 0.6);
    }
  }
  return acc;
}

float joRain(vec2 P, float heavy) {
  vec2 q = vec2(P.x + P.y * 0.16, P.y);
  float acc = 0.0;
  for (int L = 0; L < 3; L++) {
    float sp = L == 0 ? 0.045 : L == 1 ? 0.028 : 0.018;
    float col = floor(q.x / sp);
    float r1 = joH(vec2(col, float(L) * 13.0)), r2 = joH(vec2(col + 3.1, float(L) * 7.0));
    if (r2 > 0.45 + heavy * 0.4) continue;
    float x = (fract(q.x / sp) - 0.5 - (r1 - 0.5) * 0.6) * sp;
    float th = (L == 0 ? 0.0019 : L == 1 ? 0.0013 : 0.0009) * (1.0 + heavy * 0.4);
    float len = (L == 0 ? 0.3 : L == 1 ? 0.2 : 0.12) * (0.7 + 0.6 * r1);
    float y = fract(q.y / len + r1 * 9.0 + r2 * 3.0);
    float on = smoothstep(0.0, 0.15, y) * (1.0 - smoothstep(0.35, 0.55, y));
    acc += (1.0 - smoothstep(th * 0.3, th, abs(x))) * on * (L == 0 ? 1.0 : L == 1 ? 0.7 : 0.45) * (0.6 + 0.4 * r2);
  }
  return acc;
}

float joDust(vec2 P) {
  float acc = 0.0;
  for (int L = 0; L < 2; L++) {
    float sc = L == 0 ? 0.022 : 0.06;
    vec2 g = P / sc, id = floor(g) + float(L) * 91.0;
    if (joH(id) > (L == 0 ? 0.2 : 0.24)) continue;
    vec2 ctr = floor(g) + vec2(0.2) + 0.6 * vec2(joH(id + 2.2), joH(id + 4.4));
    float rad = L == 0 ? (0.05 + 0.1 * joH(id + 6.6)) : (0.12 + 0.18 * joH(id + 6.6));
    float d = length(g - ctr) / rad;
    float soft = L == 0 ? 0.6 : 0.95;
    acc += (1.0 - smoothstep(1.0 - soft, 1.0, d)) * (0.3 + 0.7 * joH(id + 8.8)) * (L == 0 ? 1.0 : 0.45);
  }
  return acc;
}

float joNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(joH(i), joH(i + vec2(1.0, 0.0)), f.x), mix(joH(i + vec2(0.0, 1.0)), joH(i + vec2(1.0, 1.0)), f.x), f.y);
}
float joFbm(vec2 p) { float a = 0.0, w = 0.5; for (int i = 0; i < 4; i++) { a += w * joNoise(p); p = p * 2.03 + 1.7; w *= 0.5; } return a; }

float joVor(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 b = vec2(float(x), float(y));
    vec2 o = vec2(joH(i + b), joH(i + b + 19.7));
    float d = length(b + o - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
  }
  return d2 - d1; // 0 on the cell borders
}
float joCaustic(vec2 P) {
  vec2 p = P * 7.0 + uFxSeed * 10.0;
  p += vec2(joFbm(p * 0.35), joFbm(p * 0.35 + 4.1)) * 1.6;   // water ripple
  float a = 1.0 - smoothstep(0.0, 0.08, joVor(p * 1.3));
  float b = 1.0 - smoothstep(0.0, 0.14, joVor(p * 0.8 + 3.3));
  float spots = smoothstep(0.35, 0.7, joFbm(P * 2.2 + 7.0));   // light falls in patches, never a full net
  return (a * 0.7 + b * 0.35) * spots;
}

vec3 joFx(vec3 c, vec2 gp, vec2 tuv, vec3 src, vec2 mp) {
  if (uFxOn < 0.5) return c;
  vec2 asp = uOutSize / min(uOutSize.x, uOutSize.y);
  vec2 P = gp * asp;
  float yC = luma(c);
  // colour tools
  if (uHsl[0] != 0.0 || uHsl[1] != 0.0 || uHsl[2] != 0.0 || uHsl[3] != 0.0 || uHsl[4] != 0.0 || uHsl[5] != 0.0 || uHsl[6] != 0.0 || uHsl[7] != 0.0
    || uHsl[8] != 0.0 || uHsl[9] != 0.0 || uHsl[10] != 0.0 || uHsl[11] != 0.0 || uHsl[12] != 0.0 || uHsl[13] != 0.0 || uHsl[14] != 0.0 || uHsl[15] != 0.0
    || uHsl[16] != 0.0 || uHsl[17] != 0.0 || uHsl[18] != 0.0 || uHsl[19] != 0.0 || uHsl[20] != 0.0 || uHsl[21] != 0.0 || uHsl[22] != 0.0 || uHsl[23] != 0.0) c = joMix(c);
  if (uGrd[1] + uGrd[3] + uGrd[5] + uGrd[8] > 0.0) c = joGrade(c);

  // lens light: glow, halation, haze, prism all read a blurred copy of the photo
  float eGlow = uFxE[0], eHal = uFxE[1], eHaze = uFxE[2], ePri = uFxE[10];
  if (eGlow + eHal + eHaze + ePri > 0.0) {
    vec3 bl = vec3(0.0), br = vec3(0.0), hal = vec3(0.0);
    for (int i = 0; i < 16; i++) {
      float fi = float(i) + 0.5, r = sqrt(fi / 16.0), a = fi * 2.39996;
      vec2 o = vec2(cos(a), sin(a)) * uGlowR * r;
      vec3 s = textureLod(uTex, tuv + o, uGlowLod).rgb;
      bl += s;
      br += s * smoothstep(0.5, 0.95, luma(s));
      vec3 s2 = textureLod(uTex, tuv + o * 0.3, max(0.0, uGlowLod - 1.7)).rgb;
      hal += s2 * smoothstep(0.55, 0.92, luma(s2));
    }
    bl /= 16.0; br /= 16.0; hal /= 16.0;
    if (eGlow > 0.0) {
      vec3 tint = uFxV[0] < 0.5 ? vec3(1.0, 0.97, 0.93) : vec3(1.0, 0.78, 0.52);
      c = joScreen(c, br * tint * eGlow * 1.6);
    }
    if (eHal > 0.0) {
      float self = smoothstep(0.55, 0.92, luma(src));
      vec3 h = max(hal - src * self, 0.0);
      c += luma(h) * vec3(1.0, 0.3, 0.1) * eHal * 1.8 * (1.0 - yC * 0.4);
    }
    if (eHaze > 0.0) {
      vec3 tint = uFxV[2] < 0.5 ? vec3(1.0) : uFxV[2] < 1.5 ? vec3(1.0, 0.9, 0.78) : vec3(0.85, 0.93, 1.0);
      vec3 soft = joScreen(c, bl * 0.55 * tint);
      c = mix(c, soft, eHaze * 0.7);
      c = mix(c, c * 0.88 + 0.1 * tint, eHaze * 0.5);
    }
    if (ePri > 0.0) {
      vec2 dir = (gp - 0.5) * uGlowR * 0.6 * ePri * length(gp - 0.5) * 2.0;
      float dr = texture(uTex, tuv + dir).r - src.r, db = texture(uTex, tuv - dir).b - src.b;
      c.r += dr; c.b += db;
    }
  }
  yC = luma(c);
  // scene: depth (sky and far things catch no window light), where the person is, how the body curves, skin
  float person = 0.0, skin = 0.0, rnd = 0.0, D = 1.0, catchL = 1.0;
  vec2 bend = vec2(0.0);
  if (uFxSeg > 0.5 && uFxE[7] + uFxE[8] > 0.0) {
    vec4 m = texture(uFxD, mp);
    person = m.b; skin = m.r; D = m.g;
    vec2 grad = vec2(0.0); float inner = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.7854;
      vec2 d = vec2(cos(a), sin(a));
      float s1 = texture(uFxD, mp + d * 0.025 / asp).b;
      float s2 = texture(uFxD, mp + d * 0.06 / asp).b;
      inner += s1 * 0.5 + s2 * 0.5;
      grad += d * (s1 + s2);
    }
    inner /= 8.0;
    rnd = sqrt(clamp(inner, 0.0, 1.0)) * person;   // ~ height of a rounded body
    bend = -grad / 16.0 * person;                  // toward the nearer edge
    catchL = smoothstep(0.04, 0.2, D);              // the far sky catches nothing
  }
  // window shadow (gobo): soft sun stripes, the lit part warm. The pattern shifts with depth (nearer things
  // sit closer to the window), so it breaks at a person's outline and wraps around the body; the shadow
  // edge on skin glows a little red.
  float eBl = uFxE[7] * catchL;
  if (eBl > 0.0) {
    float v = uFxV[7], m;
    vec2 q = mat2(0.9, 0.44, -0.44, 0.9) * (P - asp * 0.5);
    q = q * mix(1.0, 0.86, D * uFxSeg) + vec2(0.0, D * uFxSeg * 0.045) + bend * 0.06 - vec2(0.0, rnd * 0.025);
    vec2 PP = P * mix(1.0, 0.86, D * uFxSeg) + bend * 0.08 + D * uFxSeg * 0.3;
    if (v < 0.5) m = smoothstep(-0.55, 0.65, sin(q.y * 6.2832 / 0.1 + joFbm(q * 3.0) * 0.8));
    else if (v < 1.5) m = smoothstep(0.42, 0.56, joFbm(PP * 4.5 + 3.0));
    else {
      vec2 w = abs(fract(q * vec2(2.2, 1.6) + 0.5) - 0.5);
      m = smoothstep(0.03, 0.06, w.x) * smoothstep(0.03, 0.06, w.y);
    }
    float shaft = smoothstep(-0.45, 0.1, q.x) * (1.0 - smoothstep(0.25, 0.75, q.x));
    m = mix(0.0, m, shaft * 0.85 + 0.15);
    vec3 lit = c * vec3(1.16, 1.04, 0.86) + vec3(0.03, 0.015, 0.0);
    vec3 dark = mix(c * vec3(0.62, 0.64, 0.7), c * vec3(0.7, 0.6, 0.58), skin);
    vec3 g = mix(dark, lit, m);
    g += skin * m * (1.0 - m) * 4.0 * vec3(0.07, 0.02, 0.0) * yC;   // light through skin at the shadow edge
    c = mix(c, g, eBl);
  }
  float eCa = uFxE[8] * catchL;
  if (eCa > 0.0) {
    // water light: wide and calm far away, smaller and bent around the body up close
    vec2 Pp = P * (1.0 + 0.4 * D * uFxSeg) + bend * 0.25 + vec2(rnd * 0.12, D * uFxSeg * 0.5);
    float k = joCaustic(Pp);
    k *= 1.0 - 0.35 * person * (1.0 - rnd);   // the sides of the body turn away from the light
    c = mix(c, c * vec3(0.88, 1.0, 1.04), eCa * 0.35);
    c += k * mix(vec3(0.72, 0.95, 1.0), vec3(0.85, 0.97, 1.0), skin) * eCa * (0.05 + yC) * 0.55;
  }
  if (uFxE[6] > 0.0) {
    float v = uFxV[6];
    vec3 col = v < 0.5 ? vec3(1.0, 0.5, 0.15) : v < 1.5 ? vec3(1.0, 0.18, 0.1) : v < 2.5 ? vec3(1.0, 0.32, 0.62) : joRgb(vec3(fract(gp.y * 0.8 + 0.05), 0.45, 1.0));
    float side = v < 0.5 || v > 2.5 ? (asp.x - P.x) : P.x;
    float m = exp(-pow(side / 0.42, 2.0)) * (0.75 + 0.25 * sin(P.y * 3.1 + uFxSeed * 20.0));
    m += exp(-pow(length(P - vec2(v < 0.5 || v > 2.5 ? asp.x : 0.0, asp.y * 0.18)) / 0.5, 2.0)) * 0.6;
    c = joScreen(c, col * m * uFxE[6] * (v > 2.5 ? 0.55 : 0.9));
  }
  if (uFxE[9] > 0.0) {
    vec2 sun = vec2(uFxV[9] < 0.5 ? asp.x * 0.86 : asp.x * 0.14, asp.y * 0.12);
    vec2 d = P - sun; float r = length(d), a = atan(d.y, d.x);
    float core = exp(-r * r / 0.012) + 0.55 * exp(-r / 0.16);
    float rays = pow(0.5 + 0.5 * sin(a * 11.0 + uFxSeed * 40.0) * sin(a * 7.0 + 1.3), 3.0) * exp(-r * 2.2) * 0.5;
    vec2 ax = asp * 0.5 - sun;
    float gh = 0.0;
    for (int i = 1; i <= 3; i++) { vec2 gpnt = sun + ax * (0.6 + 0.45 * float(i)); gh += (1.0 - smoothstep(0.02, 0.035 + 0.01 * float(i), length(P - gpnt))) * 0.12; }
    c = joScreen(c, vec3(1.0, 0.76, 0.45) * (core + rays) * uFxE[9] + vec3(0.6, 0.8, 1.0) * gh * uFxE[9]);
  }
  float away = smoothstep(0.12, 0.6, length((gp - 0.5) * asp));
  if (uFxE[4] > 0.0) c = joScreen(c, joOrbs(P, uFxV[4], uFxE[4]) * min(1.0, uFxE[4] * 1.4) * (0.15 + 0.85 * away) * (1.0 - smoothstep(0.25, 0.85, yC) * 0.8));
  if (uFxE[3] > 0.0) c = joScreen(c, vec3(1.0, 0.93, 0.8) * min(1.0, joDust(P) * 2.2) * uFxE[3] * (1.0 - yC * 0.45));
  if (uFxE[5] > 0.0) {
    float heavy = uFxV[5];
    c = mix(c, c * vec3(0.86, 0.9, 0.95) + vec3(0.01, 0.015, 0.025), uFxE[5] * 0.45);
    c = joScreen(c, vec3(0.85, 0.9, 0.96) * min(1.0, joRain(P, heavy)) * uFxE[5] * 1.1);
  }
  return clamp(c, 0.0, 1.0);
}
`,Jt=`
uniform sampler2D uEdLoc;  // r local light, g haze map, b person (full-image uv)
uniform float uEdLocOn;    // 1 local light + haze ready, 2 person too (3 = both)
uniform vec3 uEdA;         // haze colour
uniform vec2 uNR;          // one full-size pixel in texture uv (never under 0.75 texel)
uniform float uNRLod;      // mip level of one full-size pixel
uniform vec2 uNC;          // colour-noise reach in texture uv
uniform float uNCLod;
uniform vec2 uTexR;        // texture (fine detail) reach in texture uv
uniform vec4 uMb;          // background motion: streak in full-image uv (xy), amount, mip level
uniform sampler2D uDx;     // second photo
uniform vec4 uDxP;         // strength, zoom, shift x, shift y
uniform vec4 uDxQ;         // outside mode, second photo w/h, -, on

float edP(int i) { return uU[i] + uF[i] * uFAmt; }
bool edLoc() { return mod(uEdLocOn, 2.0) > 0.5; }
bool edPerson() { return uEdLocOn > 1.5; }

// ---- night noise: brightness and colour cleaned apart ----
// brightness: an edge-preserving average over three rings; it trusts neighbours more in the dark, where
// night noise lives, and leaves a little grain so skin and walls never turn to plastic.
// colour: blotchy colour noise is wide, so it is averaged much wider (from the mip chain), only over
// neighbours of similar brightness so colours never bleed across an edge.
vec3 edDenoise(vec3 s, vec2 tuv) {
  float nl = clamp(edP(20), 0.0, 1.0), nc = clamp(edP(21), 0.0, 1.0);
  if (nl <= 0.0 && nc <= 0.0) return s;
  float l = luma(s);
  float ld = l;
  if (nl > 0.0) {
    float sig = (0.018 + 0.085 * nl) * (1.0 + 1.3 * (1.0 - smoothstep(0.03, 0.45, l)));
    float acc = l, ws = 1.0;
    for (int i = 0; i < 32; i++) {
      float ring = float(i / 8);
      float a = float(i) * 0.7854 + ring * 0.3927;
      // rings at 1, 2 and 3.5 pixels, the outer two read the next mip level (already 2x2 averaged)
      float rr = ring < 0.5 ? 1.0 : ring < 1.5 ? 2.0 : ring < 2.5 ? 3.5 : 5.5;
      vec2 o = vec2(cos(a), sin(a)) * uNR * rr;
      float t = luma(textureLod(uTex, tuv + o, ring < 0.5 ? 0.0 : uNRLod + (ring < 1.5 ? 0.5 : 1.0)).rgb);
      float d = (t - l) / sig;
      float w = exp(-d * d) * (1.0 - ring * 0.18);
      acc += t * w; ws += w;
    }
    ld = mix(l, acc / ws, 0.25 + 0.7 * nl);
  }
  vec3 ch = s - l;
  if (nc > 0.0) {
    vec3 cacc = ch; float cw = 1.0;
    float sg = 0.06 + 0.06 * nc;
    for (int i = 0; i < 12; i++) {
      float fi = float(i) + 0.5, rr = sqrt(fi / 12.0), a = fi * 2.39996;
      vec3 t = textureLod(uTex, tuv + vec2(cos(a), sin(a)) * uNC * rr, uNCLod).rgb;
      float tl = luma(t), d = (tl - l) / sg;
      float w = exp(-d * d);
      cacc += (t - tl) * w; cw += w;
    }
    ch = mix(ch, cacc / cw, 0.35 + 0.6 * nc);
    // in deep shadows colour noise is all there is: let it fade toward the average colour
    ch *= 1.0 - 0.35 * nc * (1.0 - smoothstep(0.02, 0.18, l));
  }
  return clamp(ld + ch, 0.0, 1.0);
}

// ---- smart sharpen, texture, clarity ----
vec3 edDetail(vec3 c, vec3 src, vec2 tuv, float sharp, float clar, float tex) {
  float lo = luma(src);
  float nf = 0.01 + 0.1 * clamp(edP(20), 0.0, 1.0);   // what counts as noise
  float dl = 0.0;
  if (sharp > 0.0) {
    // unsharp mask on brightness only, only where there is a real edge, and never past the darkest or
    // brightest neighbour: crisp edges, no white or dark halo, no colour fringe, flat noise left alone
    float mn = lo, mx = lo, sum = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.7854;
      vec2 o = vec2(cos(a), sin(a)) * uSharpR * (i % 2 == 1 ? 1.41 : 1.0);
      float t = luma(texture(uTex, tuv + o).rgb);
      sum += t * (i % 2 == 1 ? 0.5 : 1.0);
      mn = min(mn, t); mx = max(mx, t);
    }
    float bl = (lo * 2.0 + sum) / 8.0;
    float g = smoothstep(nf, nf * 3.5, mx - mn);
    float ls = clamp(lo + (lo - bl) * sharp * 2.6 * g, mn - 0.012, mx + 0.012);
    dl += ls - lo;
  }
  if (tex != 0.0) {
    // fine detail (pores, fabric, leaves): small swings are lifted, strong edges are left to sharpen
    float b = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.7854 + 0.39;
      b += luma(texture(uTex, tuv + vec2(cos(a), sin(a)) * uTexR).rgb);
    }
    b /= 8.0;
    float d = lo - b;
    float small = 1.0 - smoothstep(0.035, 0.14, abs(d));
    float k = tex > 0.0 ? tex * 1.8 * small * smoothstep(nf * 0.6, nf * 2.0, abs(d)) : tex * 0.6 * small;
    dl += d * k;
  }
  if (clar != 0.0) {
    // mid-size contrast: the local average only counts neighbours of similar brightness, so a hard
    // edge (sky against a roof, a face against a wall) gets no glow or dark ring
    float b = 0.0, ws = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785398 + 0.39;
      for (int j = 0; j < 2; j++) {
        float rr = j == 0 ? 1.0 : 0.5;
        float aa = a + float(j) * 0.39;
        float t = luma(texture(uTex, tuv + vec2(cos(aa), sin(aa)) * uClarR * rr).rgb);
        float dd = (t - lo) / 0.16;
        float w = exp(-dd * dd);
        b += t * w; ws += w;
      }
    }
    b = (b + lo) / (ws + 1.0);
    float mid = 1.0 - pow(abs(lo - 0.5) * 2.0, 2.0);
    dl += (lo - b) * clar * 2.0 * (0.35 + 0.65 * mid);
  }
  if (dl == 0.0) return c;
  // brightness change applied as a ratio in the mid-tones (keeps colour), as an offset near black
  float lc = max(luma(c), 1e-3);
  vec3 o = mix(c + dl, c * ((lc + dl) / lc), smoothstep(0.04, 0.2, lc));
  return clamp(o, 0.0, 1.0);
}

// ---- background motion: a streak along one direction, only the background, the person stays sharp ----
vec3 edMotion(vec3 c, vec2 p, vec2 tuv) {
  if (uMb.z <= 0.0 || !edPerson()) return c;
  float pm = texture(uEdLoc, p).b;
  float bk = 1.0 - smoothstep(0.3, 0.7, pm);
  if (bk < 0.002) return c;
  vec3 acc = vec3(0.0); float ws = 0.0;
  for (int i = 0; i < 28; i++) {
    float f = (float(i) + 0.5) / 28.0 - 0.5;
    vec2 o = uMb.xy * f;
    float w = 1.0 - smoothstep(0.25, 0.6, texture(uEdLoc, p + o).b);   // the person is never smeared into the background
    w *= 1.0 - abs(f) * 0.6;                                            // a soft-ended streak
    vec3 s = textureLod(uTex, tuv + o / uTexFull.zw, uMb.w).rgb;
    acc += s * w; ws += w;
  }
  if (ws < 0.3) return c;
  return mix(c, acc / ws, bk * min(1.0, uMb.z * 3.0));
}

// ---- dehaze (dark channel), then the second photo inside the person ----
vec3 edAfter(vec3 c, vec2 p) {
  float dh = edP(19);
  if (dh != 0.0 && edLoc()) {
    float t = texture(uEdLoc, p).g;
    vec3 A = uEdA;
    if (dh > 0.0) {
      float te = max(mix(1.0, t, dh * 0.92), 0.32);
      vec3 J = (c - A) / te + A;
      // the haze is lifted, but the deepest shadows are kept from crushing to black
      float lj = luma(J), lc = luma(c);
      J = mix(J, J + (lc - lj) * 0.35, 1.0 - smoothstep(0.0, 0.25, lj));
      c = clamp(J, 0.0, 1.0);
    } else {
      float far = 1.0 - t * 0.7;
      c = mix(c, A * 0.94 + 0.04, -dh * 0.6 * far);
    }
  }
  if (uDxQ.w > 0.5) {
    float pm = edPerson() ? smoothstep(0.25, 0.75, texture(uEdLoc, p).b) : 1.0;
    // the second photo covers the frame (cropped to fit), then zoom and shift
    vec2 k = uDxQ.y > uAspect ? vec2(uAspect / uDxQ.y, 1.0) : vec2(1.0, uDxQ.y / uAspect);
    vec2 d0 = (p - 0.5) * k / uDxP.y + 0.5 + uDxP.zw * 0.5 * (1.0 - k / uDxP.y);
    vec3 d = texture(uDx, clamp(d0, 0.0, 1.0)).rgb;
    float a = uDxP.x;
    // screen: the face keeps its light, the darker hair and clothes fill with the second photo
    vec3 scr = 1.0 - (1.0 - c) * (1.0 - d);
    float lc = luma(c);
    vec3 inside = mix(c, mix(scr, d, 0.35 * (1.0 - smoothstep(0.15, 0.6, lc))), a);
    vec3 outside = c;
    if (uDxQ.x > 1.5) outside = mix(c, d, a);
    else if (uDxQ.x > 0.5) outside = mix(c, vec3(0.95, 0.94, 0.92), a * 0.92);
    c = mix(outside, inside, pm);
  }
  return c;
}
`,Kt=`#version 300 es
in vec2 aPos;
out vec2 vUv;
uniform float uFlipY;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos.x, aPos.y * uFlipY, 0.0, 1.0);
}`,Qt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTex;
uniform sampler2D uCurveU;
uniform sampler2D uCurveF;
uniform vec4 uSrc;        // source rect in texture uv (x, y, w, h)
uniform vec2 uTileOrigin; // tile position in output pixels
uniform vec2 uTileSize;   // tile size in output pixels
uniform vec2 uOutSize;    // full output size in pixels
uniform vec2 uSharpR;     // sharpen radius in uv
uniform vec2 uClarR;      // clarity radius in uv
uniform float uSplit;     // before/after divider in output x (0..1), <0 = off
uniform float uFAmt;
uniform sampler2D uLut3; // filter 3D LUT atlas: n slices of n×n (x = r + b·n, y = g)
uniform float uLutN;     // 0 = none
uniform float uU[22];
uniform float uF[22];
uniform vec3 uFShadow;
uniform vec3 uFHigh;

const vec3 LW = vec3(0.2126, 0.7152, 0.0722);
float luma(vec3 c) { return dot(c, LW); }

vec3 curve(sampler2D lut, vec3 c) {
  return vec3(texture(lut, vec2(c.r, 0.5)).r, texture(lut, vec2(c.g, 0.5)).g, texture(lut, vec2(c.b, 0.5)).b);
}

float gBaseL = -1.0;      // local light under this pixel (edit maps), < 0 = not known

vec3 develop(vec3 c, float P[22], sampler2D lut, vec3 sh, vec3 hi, float loc) {
  // exposure in linear light
  vec3 lin = pow(max(c, 0.0), vec3(2.2)) * exp2(P[0] * 1.6);
  c = pow(lin, vec3(1.0 / 2.2));
  // white balance
  c *= vec3(1.0 + P[9] * 0.16, 1.0 - P[10] * 0.12, 1.0 - P[9] * 0.16);
  c *= vec3(1.0 + P[10] * 0.05, 1.0, 1.0 + P[10] * 0.05);
  // white / black points
  float bp = -P[6] * 0.07;
  float wp = 1.0 - P[5] * 0.16;
  c = (c - bp) / max(wp - bp, 0.05);
  // brightness (midtone gamma)
  c = pow(max(c, 0.0), vec3(exp2(-P[1] * 0.75)));
  // highlights & shadows on luminance (bounded so dark saturated colours don't explode)
  float l = luma(c);
  if (loc > 0.5 && gBaseL >= 0.0 && (P[3] != 0.0 || P[4] != 0.0)) {
    // local: the edge-aware light map decides how much a region moves, so a shadowed face or a bright sky
    // moves as a whole with its own detail riding along (no flat look, no halo at a hard edge)
    float b = gBaseL * exp2(P[0] * 1.6 / 2.2);
    b = clamp((b - bp) / max(wp - bp, 0.05), 0.0, 1.0);
    b = pow(b, exp2(-P[1] * 0.75));
    float lw = mix(l, b, 0.8);
    float ws = 1.0 - smoothstep(0.0, 0.6, lw); ws *= ws;
    float wh = smoothstep(0.35, 0.85, lw);
    // clipped lights stay white when highlights are pulled down: nothing to recover there, and a grey lamp looks wrong
    if (P[3] < 0.0) wh *= 1.0 - 0.85 * smoothstep(0.88, 1.0, max(lw, l));
    float st = P[4] * (P[4] > 0.0 ? 1.45 : 1.1) * ws + P[3] * (P[3] < 0.0 ? 1.25 : 0.65) * wh;
    vec3 g = c * exp2(st);
    // a little lift near black so opened shadows are not only multiplied noise; highlights roll off, never clip
    g += max(P[4], 0.0) * 0.035 * ws * (1.0 - smoothstep(0.0, 0.12, l));
    float gm = max(g.r, max(g.g, g.b));
    if (gm > 0.85 && st > 0.0) g *= (0.85 + 0.15 * (1.0 - exp(-(gm - 0.85) / 0.15))) / gm;
    c = g;
  } else {
    float ws = 1.0 - smoothstep(0.0, 0.55, l); ws *= ws;
    float wh = smoothstep(0.45, 1.0, l);
    float dl = P[4] * 0.26 * ws + P[3] * 0.24 * wh;
    c = mix(c + dl, c * ((l + dl) / max(l, 0.06)), 0.45);
  }
  // contrast
  c = clamp(c, 0.0, 1.2);
  if (P[2] > 0.0) {
    vec3 s = clamp(c, 0.0, 1.0);
    c = mix(c, s * s * (3.0 - 2.0 * s), P[2] * 0.85);
  } else {
    c = mix(c, vec3(0.5) + (c - 0.5) * 0.45, -P[2] * 0.8);
  }
  // saturation & vibrance
  l = luma(c);
  c = mix(vec3(l), c, 1.0 + P[7]);
  float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
  float sat = mx - mn;
  c = mix(vec3(l), c, 1.0 + P[8] * (1.0 - sat) * 1.3);
  // split toning
  if (P[16] > 0.0) {
    l = clamp(luma(c), 0.0, 1.0);
    c += (sh - 0.5) * (1.0 - l) * (1.0 - l) * P[16] * 0.6 + (hi - 0.5) * l * l * P[16] * 0.6;
  }
  // black & white
  c = mix(c, vec3(luma(c)), P[17]);
  // fade
  if (P[11] > 0.0) c = mix(c, vec3(0.1) + c * 0.84, P[11]);
  else c = mix(c, c * c * (3.0 - 2.0 * c), -P[11] * 0.4);
  c = clamp(c, 0.0, 1.0);
  return curve(lut, c);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// ---- beauty (v2) ----
uniform vec4 uSrcFull;   // drawn quad in full-image uv (stretched space)
uniform vec4 uTexFull;   // texture coverage in full-image uv (unstretched space)
uniform vec2 uStr;       // leg stretch: start y (unstretched uv), extra factor (0 = off)
uniform float uAspect;   // full image w / h (unstretched)
uniform int uNOps;
uniform vec4 uOpA[64];   // cx, cy, radius (in height units), type (0 scale, 1 move)
uniform vec4 uOpB[64];   // vx, vy, strength, lockable (1 = respects background lock)
uniform float uLock;
uniform float uChecker;
uniform float uBeauty;   // 0 = no beauty work at all
uniform float uB[29];    // smooth, even, brighten, warmth, undereye, teeth, eyes, lip, blush, shadow, brows, beard, hair, hairShine, bgBlur, bgMode, contour, highlight, liner, lens
uniform vec3 uLipC;
uniform vec3 uBlushC;
uniform vec3 uShadowC;
uniform vec3 uHairC;
uniform vec4 uBgC;       // rgb + alpha (0 = transparent cut-out)
uniform vec2 uSkinR;     // skin blur radius in texture uv
uniform float uBgLod;
uniform vec2 uBgR;      // background blur radius in texture uv
uniform sampler2D uM0;   // skin, hair, person, lips
uniform sampler2D uM1;   // eyeshadow, blush, under-eye, mouth
uniform sampler2D uM2;   // brows, beard, eyes, face
uniform sampler2D uM4;   // scalp zone, hair around
uniform sampler2D uM5;   // edge guide: r person slope, g hair slope (guided-filter A, (A+8)/16); M4.b = mask-size luma
uniform float uM5On;
uniform sampler2D uM3;   // contour, highlight, liner+lashes, iris
uniform sampler2D uM6;   // surface normal x, y (0.5 + 0.5n), fine-lines zone, freckle zone (half mask size)
uniform float uM6On;
uniform vec4 uB2[3];     // eyeWhite, redEye, catchlight, lines | freckles, tan, greyCover, hairline | studio, sideLight, sculpt, face-up angle
uniform vec4 uEye[2];    // iris centre (full-image uv), radius (height units), visibility
uniform vec3 uLensC;
uniform vec3 uBgT;       // background tint colour
uniform float uBgOff[8]; // background colours switched off: red, orange, yellow, green, cyan, blue, purple, pink
uniform sampler2D uDisp; // body reshaping field: source offset in full-image uv
uniform float uDispOn;
uniform sampler2D uPlate; // background with the person filled in (full-image uv, unstretched)
uniform float uPlateOn;

// ---- blend modes (makeup that keeps the skin's own texture) ----
vec3 bMultiply(vec3 b, vec3 s) { return b * s; }
vec3 bScreen(vec3 b, vec3 s) { return 1.0 - (1.0 - b) * (1.0 - s); }
vec3 bOverlay(vec3 b, vec3 s) { return mix(2.0 * b * s, 1.0 - 2.0 * (1.0 - b) * (1.0 - s), step(0.5, b)); }
vec3 bSoftLight(vec3 b, vec3 s) {
  vec3 d = mix(((16.0 * b - 12.0) * b + 4.0) * b, sqrt(b), step(0.25, b));
  return mix(b - (1.0 - 2.0 * s) * b * (1.0 - b), b + (2.0 * s - 1.0) * (d - b), step(0.5, s));
}
float bLum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
vec3 bClipColor(vec3 c) { float l = bLum(c), n = min(min(c.r, c.g), c.b), x = max(max(c.r, c.g), c.b);
  if (n < 0.0) c = l + (c - l) * l / max(l - n, 1e-4); if (x > 1.0) c = l + (c - l) * (1.0 - l) / max(x - l, 1e-4); return c; }
vec3 bSetLum(vec3 c, float l) { return bClipColor(c + (l - bLum(c))); }
// colour of the makeup, brightness and texture of the skin underneath
vec3 bColor(vec3 b, vec3 s) { return bSetLum(s, bLum(b)); }

vec2 unstretch(vec2 q) {
  if (uStr.y <= 0.0) return q;
  float k = 1.0 + uStr.y;
  float hs = 1.0 + (1.0 - uStr.x) * (k - 1.0);
  float Y = q.y * hs;
  return vec2(q.x, Y <= uStr.x ? Y : uStr.x + (Y - uStr.x) / k);
}

// Person and hair masks are made at analysis size (<=1280 px). Read at the preview or a 12 MP export they
// would be a soft bilinear blur. Guided upsampling: the guided filter's local slope A (mask per unit of
// brightness, made at analysis size) times how much the full-size pixel differs from the analysis-size
// brightness gives the detail the low-res mask could not hold, so the edge follows the real hair/shoulder edge.
vec4 maskM0(vec2 p) {
  vec4 m = texture(uM0, p);
  if (uM5On < 0.5) return m;
  vec4 g = texture(uM5, p);
  float d = luma(texture(uTex, (p - uTexFull.xy) / uTexFull.zw).rgb) - texture(uM4, p).b;
  vec2 A = g.rg * 16.0 - 8.0;
  vec2 gate = clamp(vec2(m.b * (1.0 - m.b), m.g * (1.0 - m.g)) * 6.0, 0.0, 1.0); // only where the edge is
  m.b = clamp(m.b + A.x * d * gate.x, 0.0, 1.0);
  m.g = clamp(m.g + A.y * d * gate.y, 0.0, 1.0);
  return m;
}

// uSkinR is in texture uv; the masks live in full-image uv. On an export tile the texture covers only part
// of the image, so radii and offsets must be scaled into mask space (else masks are read from the wrong place)
vec2 skinRF() { return uSkinR * uTexFull.zw; }
vec2 texToFull(vec2 t) { return uTexFull.xy + t * uTexFull.zw; }
// distance from iris i, in image-height units
float eyeD(vec2 p, int i) { return length((p - uEye[i].xy) * vec2(uAspect, 1.0)); }
// hair colour around a pixel: the darker hair pixels within reach, weighted; hw = how much hair was found
vec3 hairAround(vec2 tuv, float reach, out float hw) {
  vec3 hc = vec3(0.0); hw = 0.0;
  for (int i = 0; i < 10; i++) {
    float a = float(i) * 2.39996; vec2 rr = uSkinR * reach * (0.5 + 0.12 * float(i));
    vec2 q = tuv + vec2(cos(a), sin(a)) * rr;
    vec3 s = texture(uTex, q).rgb;
    float w = texture(uM0, texToFull(q)).g * (1.0 - smoothstep(0.1, 0.45, luma(s)));
    hc += s * w; hw += w;
  }
  return hw > 0.01 ? hc / hw : vec3(0.06, 0.05, 0.045);
}

vec2 warp(vec2 q) {
  vec2 p = q;
  float lockW = 1.0;
  vec4 mq = texture(uM0, q);
  if (uLock > 0.0) lockW = mix(1.0, mq.b, uLock);
  // face edits only move the face itself (skin, hair, features), never the hood or collar beside it
  // face zone: the oval averaged over a wide disc, so the warp fades out smoothly past the jaw (no seam) and stops before a hood or collar
  float ov = texture(uM2, q).a;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.7854;
    vec2 d = vec2(cos(a), sin(a)) * skinRF();
    ov += texture(uM2, q + d * 7.0).a + texture(uM2, q + d * 14.0).a + texture(uM2, q + d * 21.0).a;
  }
  ov /= 25.0;
  float faceW = smoothstep(0.0, 0.35, ov + mq.g * 0.3);
  for (int i = 0; i < 64; i++) {
    if (i >= uNOps) break;
    vec4 A = uOpA[i]; vec4 B = uOpB[i];
    vec2 d = (q - A.xy) * vec2(uAspect, 1.0);
    float r = length(d) / A.z;
    if (r >= 1.0) continue;
    float w = 1.0 - r * r; w *= w;
    if (B.w > 1.5) w *= faceW;
    else if (B.w > 0.5) w *= lockW;
    if (A.w < 0.5) p -= (q - A.xy) * B.z * w;           // scale around centre (s>0 enlarges)
    else p -= B.xy * w;                                    // move
  }
  return p;
}

${Yt}
${Jt}

void main() {
  vec2 gp = (uTileOrigin + vUv * uTileSize) / uOutSize; // global output position 0..1
  vec2 q = unstretch(uSrcFull.xy + vUv * uSrcFull.zw);
  vec2 p = uBeauty > 0.0 ? warp(q) : q;
  if (uBeauty > 0.0 && uDispOn > 0.5) p += texture(uDisp, q).rg;
  vec2 tuv = (p - uTexFull.xy) / uTexFull.zw;
  vec3 orig = texture(uTex, (q - uTexFull.xy) / uTexFull.zw).rgb;
  if (uSplit >= 0.0 && gp.x < uSplit) { outColor = vec4(orig, 1.0); return; }
  vec3 src = edDenoise(texture(uTex, tuv).rgb, tuv);
  // background lock: where the body field moved things, only the person is taken from the warp;
  // what lies behind comes from the filled-in plate at this very spot, so walls and tiles stay straight
  if (uBeauty > 0.0 && uPlateOn > 0.5 && uDispOn > 0.5) {
    vec2 dd = texture(uDisp, q).rg * vec2(uAspect, 1.0);
    float moved = smoothstep(0.0004, 0.0025, length(dd));
    float pers = smoothstep(0.25, 0.75, texture(uM0, p).b);
    src = mix(src, mix(texture(uPlate, q).rgb, src, pers), moved);
  }
  if (edLoc()) gBaseL = texture(uEdLoc, p).r;
  vec3 c = edMotion(src, p, tuv);
  float alpha = 1.0;

  if (uBeauty > 0.0) {
    vec4 m0 = maskM0(p), m1 = texture(uM1, p), m2 = texture(uM2, p);
    float l0 = luma(c);
    // skin: edge-aware smoothing that keeps a little real texture
    if (uB[0] > 0.0 || uB[1] > 0.0) {
      vec3 fineB = src;
      for (int i = 0; i < 6; i++) { float a = float(i) * 1.0472 + 0.5; fineB += texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 0.3).rgb; }
      fineB /= 7.0;
      vec3 fine = src - fineB;
      // coarse grain or noise (big fine-band swings) is calmed more than real pores, and the edge test looks past it
      float noisy = smoothstep(0.04, 0.12, length(fine));
      float edgeK = mix(30.0, 5.0, noisy);
      vec3 acc = vec3(0.0); float wsum = 0.0; vec3 wide = vec3(0.0);
      for (int i = 0; i < 12; i++) {
        float a = float(i) * 0.5236;
        vec2 o = vec2(cos(a), sin(a)) * uSkinR * (i < 6 ? 0.5 : 1.0);
        vec3 s2 = texture(uTex, tuv + o).rgb;
        float w = exp(-dot(s2 - fineB, s2 - fineB) * edgeK);
        acc += s2 * w; wsum += w;
        wide += texture(uTex, tuv + o * 2.5).rgb;
      }
      vec3 smooth2 = (acc + fineB) / (wsum + 1.0);
      wide /= 12.0;
      float sk = m0.r;
      // three bands like a retoucher: pores (fine) stay, blotches and small lines (mid) fade, light and shape (low) stay
      vec3 mid = fineB - smooth2;
      float k0 = uB[0];
      vec3 retouched = smooth2 + mid * (1.0 - 0.9 * smoothstep(0.0, 0.7, k0)) + fine * (0.95 - 0.25 * k0) * (1.0 - 0.6 * noisy * k0);
      c = mix(c, retouched, min(1.0, k0 * 1.6) * sk);
      // even tone: keep luminance, borrow colour from the wide average
      vec3 evenC = wide * (luma(c) / max(luma(wide), 0.02));
      c = mix(c, evenC, uB[1] * sk * 0.7);
    }
    // spots and shine: only a local dip or peak counts, never a shading gradient (that is the face's shape)
    if ((uB[21] > 0.0 || uB[22] > 0.0) && m0.r > 0.02) {
      float lc = luma(c);
      if (uB[21] > 0.0) {
        // a spot is darker than every neighbour all around, near and further out (a difference of Gaussians
        // with a strict ring): never a nostril, a crease or a brow edge. (A larger ring was tried: it reads thin
        // forehead lines as spots and dots them; the fine-lines zone is protected for the same reason.)
        float spot = 0.0; vec3 ringB = c;
        for (int k = 0; k < 1; k++) {
          float R = 1.6;
          vec3 ring = vec3(0.0); float mn = 9.0, mn2 = 9.0;
          for (int i = 0; i < 8; i++) {
            float a = float(i) * 0.7854 + 0.2;
            vec3 s2 = texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * R).rgb;
            ring += s2; mn = min(mn, luma(s2));
            mn2 = min(mn2, luma(texture(uTex, tuv + vec2(cos(a + 0.39), sin(a + 0.39)) * uSkinR * R * 2.0).rgb));
          }
          ring /= 8.0;
          float dark = smoothstep(0.008, 0.045, mn - lc) * smoothstep(0.0, 0.03, mn2 - lc);
          float red = smoothstep(-0.01, 0.04, (c.r - c.g) - (ring.r - ring.g));
          float sp = dark * mix(0.6, 1.0, red);
          if (sp > spot) { spot = sp; ringB = ring; }
        }
        spot *= m0.r * (1.0 - smoothstep(0.2, 0.6, m2.g)) * (1.0 - 0.6 * (uM6On > 0.5 ? texture(uM6, p).b : 0.0));
        vec3 healed = ringB + (src - texture(uTex, tuv + vec2(uSkinR.x, 0.0) * 0.35).rgb) * 0.25; // keep a little grain
        c = mix(c, healed, min(1.0, uB[21] * spot * 1.3));
      }
      if (uB[22] > 0.0) {
        vec3 ring = vec3(0.0); float mx = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec3 s2 = texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 5.0).rgb;
          ring += s2; mx = max(mx, luma(s2));
        }
        ring /= 8.0;
        // brighter and paler than everything around it: oily shine, not the lit side of the face
        float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
        float tz = smoothstep(0.03, 0.35, texture(uM3, p).g);          // T-zone and cheekbone tops shine first
        float shine = smoothstep(0.0, 0.08, lc - mx) * (1.0 - smoothstep(0.15, 0.32, sat)) * m0.r * mix(0.6, 1.0, tz);
        vec3 matte = c * ((mx + 0.3 * (lc - mx)) / max(lc, 0.02));
        matte = mix(matte, ring * (luma(matte) / max(luma(ring), 0.02)), 0.5);
        c = mix(c, matte, uB[22] * shine);
      }
    }
    vec4 m6 = uM6On > 0.5 ? texture(uM6, p) : vec4(0.5, 0.5, 0.0, 0.0);
    // fine lines (laugh lines, crow's feet, under-eye, forehead, frown): a line is a narrow valley, darker than
    // the skin a little way around it. Measured on a pore-free average, and only the valley is lifted (with the
    // surrounding skin's colour), so the face's shading and the skin's grain stay.
    if (uB2[0].w > 0.0 && m6.b > 0.01) {
      // the crease band (valleys and the ridges between them) is flattened toward the wider skin average,
      // on brightness only; the pore band above it and the colour stay
      float lc = luma(c), ls = lc;
      for (int i = 0; i < 6; i++) { float a = float(i) * 1.0472; ls += luma(texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 0.45).rgb); }
      ls /= 7.0;
      float lw = 0.0; vec3 ringC = vec3(0.0);
      for (int k = 0; k < 2; k++) {
        float R = k == 0 ? 1.3 : 2.6;
        for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854 + 0.2 + float(k) * 0.39; vec3 s2 = texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * R).rgb; ringC += s2; lw += luma(s2); }
      }
      lw /= 16.0; ringC /= 16.0;
      float dl = clamp(lw - ls, -0.06, 0.14);                          // lift a crease more than calm a ridge
      float zk = uB2[0].w * m6.b * smoothstep(0.1, 0.5, max(m0.r, m2.a * 0.5));
      vec3 lifted = c * ((lc + dl * 0.9) / max(lc, 0.02));
      lifted = mix(lifted, bSetLum(ringC, luma(lifted)), 0.3 * smoothstep(0.0, 0.05, abs(dl)));  // the crease's own cast goes too
      c = mix(c, lifted, zk);
    }
    // freckles: small, uneven warm-brown dots across the nose and cheek tops, fixed to the photo (same on
    // every tile and zoom), each with its own size and strength; they darken the skin, never paint over it
    if (uB2[1].x > 0.0 && m6.a > 0.01) {
      float zf = smoothstep(0.0, 0.6, m6.a) * smoothstep(0.2, 0.7, m0.r);
      float cell = skinRF().y * 1.1;
      vec2 fp = p * vec2(uAspect, 1.0) / max(cell, 1e-5);
      vec2 cid = floor(fp);
      float dots = 0.0;
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 id = cid + vec2(float(i), float(j));
        float h1 = hash(id), h2 = hash(id + 17.31), h3 = hash(id + 41.7), h4 = hash(id + 3.9);
        if (h1 > zf * 0.7 + 0.04) continue;
        vec2 ctr = id + vec2(h2, h3);
        float rad = mix(0.14, 0.36, h4 * h4);
        float d = length((fp - ctr) * vec2(1.0, mix(0.8, 1.2, h2)));
        dots = max(dots, (1.0 - smoothstep(rad * 0.35, rad, d)) * mix(0.45, 1.0, h3));
      }
      vec3 fc = c * mix(vec3(1.0), vec3(0.8, 0.66, 0.56), dots * 0.75);
      c = mix(c, fc, uB2[1].x * zf);
    }
    // light tan: warmer, a little deeper and richer skin (body skin too), highlights kept
    if (uB2[1].y > 0.0) {
      // the whole face (nostrils and lip line included, so no pale islands) and the body skin
      float tk = uB2[1].y * smoothstep(0.15, 0.6, max(m0.r, m2.a * (1.0 - m0.g) * (1.0 - m2.b) * (1.0 - m0.a)));
      vec3 tn = c * vec3(0.93, 0.87, 0.8);
      tn = mix(vec3(luma(tn)), tn, 1.06) * (1.0 + 0.05 * smoothstep(0.55, 0.9, luma(c)));
      c = mix(c, clamp(tn, 0.0, 1.0), tk * 0.7);
    }
    float sk = m0.r;
    // radiance lights the whole face evenly, lips and brows included, so nothing looks painted on
    float skB = max(sk, m2.a * 0.9 * m0.b * (1.0 - m0.g));
    if (uB[2] > 0.0) {
      // lift the skin's own colour (same hue and saturation), never more than a third: dark skin stays its tone
      float lc = luma(c), lt = min(lc + (1.0 - lc) * lc * 0.55 + lc * 0.04, lc * 1.3 + 0.01);
      c = mix(c, c * (lt / max(lc, 0.02)), uB[2] * skB);
    }
    else if (uB[2] < 0.0) c = mix(c, c * 0.86, -uB[2] * skB);
    if (uB[3] != 0.0) c *= mix(vec3(1.0), vec3(1.0 + uB[3] * 0.08, 1.0 + uB[3] * 0.01, 1.0 - uB[3] * 0.08), sk);
    if (uB[4] > 0.0 && m1.b > 0.01) {
      // dark circles: lift only what is darker than the cheek next to it, and take away the blue-purple cast
      float lu = luma(c), ref = 0.0; vec3 refC = vec3(0.0); float rw = 0.0;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.7854;
        vec3 s2 = texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 3.0).rgb;
        float w = smoothstep(lu - 0.02, lu + 0.12, luma(s2));   // only brighter skin counts as the reference
        refC += s2 * w; rw += w; ref = max(ref, luma(s2));
      }
      refC = rw > 0.01 ? refC / rw : c;
      // judge darkness on the local average so a fine crease is lifted with its area, not into a bright streak
      float lb = lu;
      for (int i = 0; i < 4; i++) { float a = float(i) * 1.5708 + 0.785; lb += luma(texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 1.2).rgb); }
      lb /= 5.0;
      float lift = min(0.1, max(0.0, luma(refC) - lb) * 0.75);
      vec3 under = c * ((lu + lift) / max(lu, 0.02));
      under = mix(under, bSetLum(refC, luma(under)), 0.35);       // cheek colour, own light
      c = mix(c, under, uB[4] * m1.b);
    }
    if (uB[5] > 0.0) {
      // teeth are the light, low-red part of the mouth opening (tongue and gums are redder, the gap darker)
      // judged against the lips around them, so warm light (where even teeth look orange) still works
      float red = c.r - 0.5 * (c.g + c.b), redRef = -1.0, lRef = 0.0;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.7854;
        vec3 s2 = texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 3.0).rgb;
        redRef = max(redRef, s2.r - 0.5 * (s2.g + s2.b)); lRef += luma(s2);
      }
      lRef /= 8.0;
      // a tooth sits among teeth: its close neighbours are just as un-red. A shine on the lip sits among red lip.
      float redNear = 0.0;
      for (int i = 0; i < 6; i++) { float a = float(i) * 1.0472 + 0.3; vec3 s2 = texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 0.9).rgb; redNear += s2.r - 0.5 * (s2.g + s2.b); }
      redNear /= 6.0;
      float t = m1.a * smoothstep(0.1, 0.25, l0) * smoothstep(0.0, 0.06, redRef - red) * smoothstep(0.03, 0.1, l0 - lRef) * (1.0 - smoothstep(0.45, 0.85, m0.r))   // the skin around the lips is never a tooth
              * (1.0 - smoothstep(0.03, 0.08, redNear - red));
      // whitening the way a retoucher does it: the yellow out first (or it turns grey), then a modest lift
      vec3 w = c; w.b = mix(w.b, min(w.g, 0.5 * (w.r + w.g)), 0.6);
      w = mix(w, vec3(luma(w)), 0.3);
      w = min(w * 1.12 + 0.03, vec3(max(l0 + 0.12, 0.6)));
      c = mix(c, w, min(1.0, uB[5] * t));
    }
    if (uB[6] > 0.0) {
      // whites: a little cleaner and less red, never paper white; iris: crisper with its own colour
      float wl = luma(c), isW = smoothstep(0.32, 0.55, wl) * (1.0 - smoothstep(0.12, 0.3, max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b))));
      vec3 white = min(mix(c, vec3(wl), 0.4) * 1.1, vec3(0.93));
      vec3 iris = c + clamp(c - texture(uTex, tuv + uSkinR * 0.3).rgb, -0.02, 0.12) * 0.9 + c * 0.08; // crisper, never a dark ring
      c = mix(c, mix(iris, white, isW), uB[6] * m2.b * 0.85);
    }
    if ((uB2[0].x > 0.0 || uB2[0].y > 0.0 || uB2[0].z > 0.0) && m2.b > 0.01) {
      float inIris = 0.0, pup = 0.0, glint = 0.0, eyeVis = 0.0, dBest = 9.0;
      for (int i = 0; i < 2; i++) {
        if (uEye[i].z <= 0.0) continue;
        float d = eyeD(p, i), r = uEye[i].z;
        if (d < dBest) { dBest = d; eyeVis = uEye[i].w; }   // the eye this pixel belongs to: a hidden far eye gets nothing
        inIris = max(inIris, 1.0 - smoothstep(r * 0.9, r * 1.12, d));
        pup = max(pup, 1.0 - smoothstep(r * 0.7, r * 1.05, d));
        // catch-light: a soft window reflection up and to one side of the pupil, the same side in both eyes
        vec2 o = (p - uEye[i].xy) * vec2(uAspect, 1.0) - vec2(-0.32, -0.38) * r;
        float gd = length(o) / (r * 0.17);
        glint = max(glint, (exp(-gd * gd) * 0.8 + 0.2 * (1.0 - smoothstep(0.6, 1.0, gd))) * uEye[i].w);
      }
      // whites: brighter and cleaner (red veins out), never brighter than a soft white, never the iris
      if (uB2[0].x > 0.0) {
        float wl = luma(c), mx = max(c.r, max(c.g, c.b)), sat = mx - min(c.r, min(c.g, c.b)), rd = max(0.0, c.r - 0.5 * (c.g + c.b));
        float scl = smoothstep(0.22, 0.42, wl) * (1.0 - smoothstep(0.16, 0.32, sat - rd * 1.3)) * (1.0 - inIris);
        vec3 clean = mix(c, vec3(wl) * vec3(1.0, 0.995, 0.985), 0.75);
        clean *= min(wl * 1.2 + 0.04, 0.86) / max(luma(clean), 0.02);
        c = mix(c, clean, uB2[0].x * scl * m2.b * smoothstep(0.1, 0.5, eyeVis));
      }
      // red-eye: flash-red pupils become a deep neutral, the flash's own catch-light stays
      if (uB2[0].y > 0.0) {
        float rr = c.r / max(0.002, max(c.g, c.b));
        float redK = smoothstep(1.45, 2.1, rr) * smoothstep(0.1, 0.22, c.r) * pup;
        vec3 fixd = vec3(0.5 * (c.g + c.b)) * vec3(0.92, 0.94, 0.96);
        c = mix(c, fixd, uB2[0].y * redK);
      }
      if (uB2[0].z > 0.0) c = mix(c, bScreen(c, vec3(0.92, 0.94, 0.97)), min(1.0, uB2[0].z * glint * smoothstep(0.45, 0.9, m2.b) * (1.0 - smoothstep(0.42, 0.68, luma(c))) * 0.95));
    }
    // makeup: colour that follows the skin's own light
    float l1 = luma(c);
    if (uB[7] > 0.0) {
      // colour blend keeps the lip's own lines and shine; a little soft light gives depth
      vec3 lip = mix(bColor(c, uLipC), bMultiply(c, mix(vec3(1.0), uLipC, 0.85) * 1.25), 0.45);
      c = mix(c, clamp(lip, 0.0, 1.0), uB[7] * m0.a * 0.8);
    }
    if (uB[8] > 0.0) c = mix(c, mix(bSoftLight(c, uBlushC), bColor(c, mix(c, uBlushC, 0.6)), 0.4), uB[8] * m1.g * 0.5);
    if (uB[9] > 0.0) c = mix(c, mix(bMultiply(c, mix(vec3(1.0), uShadowC * 1.5, 0.8)), bColor(c, uShadowC), 0.3), uB[9] * m1.r);
    vec4 m3 = texture(uM3, p);
    float skM = smoothstep(0.15, 0.6, max(m0.r, m2.a * 0.8));
    // contour: a soft warm shade in the hollows; highlight: a soft glow on the high points
    if (uB[16] > 0.0) c = mix(c, bMultiply(c, vec3(0.84, 0.74, 0.68)), uB[16] * m3.r * skM * 0.85);
    if (uB[17] > 0.0) c = mix(c, bScreen(c, vec3(0.2, 0.18, 0.15)), uB[17] * m3.g * skM * 0.8);
    // dodge & burn: light only (no colour), on the same high points and hollows, the way a retoucher sculpts
    if (uB2[2].z > 0.0) c *= 1.0 + (m3.g * 0.075 - m3.r * 0.09) * uB2[2].z * skM;
    // liner and lashes: deep brown-black along the lash line
    if (uB[18] > 0.0) c = mix(c, bMultiply(c, vec3(0.24, 0.2, 0.2)) + (c - texture(uTex, tuv + uSkinR * 0.3).rgb) * 0.3, uB[18] * m3.b * 0.8);
    // coloured lenses: lens colour with the iris's own pattern; the pupil and the catch-light stay
    if (uB[19] > 0.0) {
      float il = bLum(c);
      // dark irises get lifted enough for the colour to show; the pupil is left out by the mask's hollow centre
      // the iris's own fibres carry through: lens luminance follows the iris, contrast lifted a little
      // a lens shifts the iris toward its own lightness too (a brown lens darkens a light blue eye), fibres kept
      float fib = il - luma(texture(uTex, tuv + uSkinR * 0.25).rgb);
      vec3 lens = bSetLum(uLensC, clamp(mix(il * 1.1 + 0.06, bLum(uLensC) * 0.95 + 0.04, 0.45) + fib * 0.8, 0.0, 1.0));
      lens = mix(lens, vec3(bLum(lens)), 0.35);                   // real lenses are never fully saturated
      lens *= mix(0.72, 1.0, smoothstep(0.75, 0.95, m3.a));       // darker ring at the iris edge (the mask fades there)
      float keepL = 1.0 - smoothstep(0.6, 0.78, il) * smoothstep(0.0, 0.12, 0.2 - (max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b)))); // a light iris takes the lens; the pale white and the catch-light stay
      c = mix(c, lens, uB[19] * smoothstep(0.0, 0.6, m3.a) * keepL * 0.6);
    }
    // brows and beard: darken the hairs that are already there, never paint the skin between them
    float lm = 0.0, mnL = 9.0;
    if (uB[10] > 0.0 || uB[11] > 0.0 || uB[13] > 0.0) {
      for (int i = 0; i < 6; i++) { float a = float(i) * 1.0472; float t = luma(texture(uTex, tuv + vec2(cos(a), sin(a)) * uSkinR * 1.6).rgb); lm += t; mnL = min(mnL, t); }
      lm /= 6.0;
    }
    // a soft strand measure (no per-pixel speckle), and a floor: nothing ever gets darker than the darkest hair next to it
    float strand = smoothstep(-0.01, 0.12, lm - l1);
    float hairFloor = clamp((min(mnL, l1) * 0.75 + 0.005) / max(l1, 0.01), 0.0, 1.0);
    if (uB[10] > 0.0) c = mix(c, c * max(vec3(0.5, 0.46, 0.44), vec3(hairFloor)), uB[10] * m2.r * (0.15 + 0.85 * strand));
    // beard density (the mask only covers areas where beard already grows): the hairs get deeper,
    // and the skin showing between them is pulled toward the hair around it, so the beard reads fuller
    if (uB[11] > 0.0) {
      float bm = uB[11] * m2.g;
      c *= max(1.0 - bm * 0.4 * strand, hairFloor);
      float gapB = smoothstep(0.02, 0.18, l1 - mnL);
      float tgt = clamp((mix(mnL, lm, 0.35) + 0.01) / max(l1, 0.01), 0.4, 1.0);
      c *= mix(1.0, tgt, bm * gapB * 0.7);
    }
    // hair density: where scalp shows through hair, fill it with the hair's own colour and a strand grain
    if (uB[20] > 0.0) {
      vec4 m4 = texture(uM4, p);
      // inside the hair, or a thin patch surrounded by hair (the model often calls a bare crown skin); never the face itself
      float zone = m4.r * smoothstep(0.15, 0.75, min(m4.g, 0.4 + m0.g)) * (1.0 - smoothstep(0.2, 0.6, m2.a));
      if (zone > 0.003) {
        vec3 hc = vec3(0.0); float hw = 0.0;
        for (int i = 0; i < 10; i++) {
          float a = float(i) * 2.39996; vec2 rr = uSkinR * (2.5 + 1.2 * float(i));
          vec2 q = tuv + vec2(cos(a), sin(a)) * rr;
          vec3 s = texture(uTex, q).rgb;
          float w = texture(uM0, texToFull(q)).g * (1.0 - smoothstep(0.08, 0.4, luma(s)));
          hc += s * w; hw += w;
        }
        hc = hw > 0.2 ? hc / hw : vec3(0.075, 0.06, 0.055);
        hc = mix(hc, vec3(0.05, 0.042, 0.04), 0.35);      // fuller hair reads darker than thin hair
        float hl = luma(hc);
        float gap = smoothstep(hl - 0.02, hl + 0.12, l1);  // only pixels lighter than the hair: the scalp between strands
        // strand grain: fine noise stretched along the head's vertical, so the fill looks like hair, not paint
        // darken the scalp toward the hair's tone but keep the pixel's own texture, so strands stay strands
        float ratio = clamp((hl + 0.06) / (l1 + 0.06), 0.45, 1.0);
        vec3 fill = mix(c * ratio, hc * (0.85 + 0.3 * clamp(l1 / max(hl + 0.2, 0.05), 0.0, 1.5)), 0.35);
        c = mix(c, fill, uB[20] * zone * gap * 0.6 * mix(1.0, 0.3, smoothstep(0.8, 0.97, m0.g)));   // lit strands of full hair are not gaps   // never a solid cap: some scalp light always stays
      }
    }
    // grey cover: grey and white strands take the colour of the dark hair around them (hair and beard),
    // at their own relative brightness so the strands stay strands. Light (blond, grey) heads have no dark
    // hair around to borrow from, so nothing happens there.
    if (uB2[1].z > 0.0 && max(m0.g, m2.g) > 0.04) {
      float hw; vec3 hc = hairAround(tuv, 4.0, hw);
      if (hw > 1.2) {
        float l = luma(c), hl = luma(hc), sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
        float grey = (1.0 - smoothstep(0.05, 0.14, sat)) * smoothstep(hl + 0.05, hl + 0.2, l) * (1.0 - smoothstep(0.3, 0.7, m0.r) * (1.0 - m2.g));
        float tl = clamp(hl * 1.25 + (l - hl) * 0.22, 0.0, 1.0);
        c = mix(c, hc * (tl / max(hl, 0.01)), uB2[1].z * grey * max(m0.g, m2.g * 0.95) * smoothstep(1.2, 3.0, hw));
      }
    }
    // hairline fill: the hair that is there grows a little further down at the hairline and temples, as a soft
    // density in the hair's own (average) colour with a fine streaky grain along the head, never drawn lines
    if (uB2[1].w > 0.0) {
      vec4 m4h = texture(uM4, p);
      float band = m4h.a * smoothstep(0.15, 0.55, m4h.g) * (1.0 - smoothstep(0.3, 0.7, m2.b + m2.r));
      if (band > 0.01) {
        vec3 hm = vec3(0.0); float hw = 0.0;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 2.39996; vec2 q = tuv + vec2(cos(a), sin(a)) * uSkinR * (3.0 + 0.7 * float(i));
          float w = texture(uM0, texToFull(q)).g; w *= w;
          hm += texture(uTex, q).rgb * w; hw += w;
        }
        if (hw > 0.6) {
          hm /= hw;
          float ang = uB2[2].w; vec2 up = vec2(cos(ang), sin(ang)), ac = vec2(-up.y, up.x);
          vec2 hp = p * vec2(uAspect, 1.0) / max(skinRF().y, 1e-5);
          float u = dot(hp, ac) / 0.14, v = dot(hp, up) / 1.6;
          float cu = floor(u), fu = smoothstep(0.0, 1.0, fract(u));
          float n = mix(hash(vec2(cu, floor(v))), hash(vec2(cu + 1.0, floor(v))), fu);
          n = mix(n, mix(hash(vec2(cu, floor(v) + 1.0)), hash(vec2(cu + 1.0, floor(v) + 1.0)), fu), smoothstep(0.0, 1.0, fract(v)));
          float d = band * uB2[1].w * mix(0.55, 1.0, n);                    // streaky, thinning toward the face
          float l1h = luma(c), hl = luma(hm);
          vec3 tgt = hm * (0.9 + 0.25 * n) * clamp((l1h * 0.35 + hl * 0.65) / max(hl, 0.02), 0.6, 1.3);
          c = mix(c, tgt, d * 0.7 * smoothstep(hl - 0.03, hl + 0.08, l1h));   // only where it is lighter than the hair
        }
      }
    }
    // hair colour & shine
    if (uB[12] > 0.0) {
      float hl = luma(c);
      vec3 tint = uHairC * (hl / max(luma(uHairC), 0.05));
      vec3 soft = mix(2.0 * c * uHairC + c * c * (1.0 - 2.0 * uHairC), sqrt(c) * (2.0 * uHairC - 1.0) + 2.0 * c * (1.0 - uHairC), step(0.5, uHairC));
      c = mix(c, mix(soft, clamp(tint, 0.0, 1.0), 0.45), uB[12] * m0.g);
    }
    if (uB[13] > 0.0) {
      // shine follows the hair's own highlights (works on dark hair too)
      float hl = luma(c);
      float keep = (1.0 - smoothstep(0.3, 0.5, hl)) * (1.0 - smoothstep(0.04, 0.14, c.b - c.r)) * (1.0 - smoothstep(0.1, 0.22, c.r - c.b) * smoothstep(0.2, 0.35, hl)); // scalp skin showing through stays // sky and wall at the hair edge stay as they are
      // smooth sheen from the local mean, capped near it, so single bright strands never sparkle
      // the hair's own colour, only brighter (never a grey or blue cast), and never far above the local mean
      // light lands on the strands that already catch it (brighter than their neighbours) as a warm-neutral
      // sheen, and the gaps between them deepen a touch: glossy hair, never a lifted grey or lilac veil
      float up = max(hl - lm, 0.0), dn = max(lm - hl, 0.0);
      float lift = min(up * 2.2 + 0.035 * smoothstep(0.06, 0.3, hl), 0.22);
      vec3 g = c * (1.0 - 0.35 * dn) + vec3(1.0, 0.96, 0.9) * lift * (0.45 + hl);
      c = mix(c, g, uB[13] * smoothstep(0.75, 0.98, m0.g) * keep * (1.0 - smoothstep(0.1, 0.4, m0.r)));
    }
    // portrait light from the surface normals (face mesh depth + the person's outline):
    // studio = a big soft light from the front and a little above; side = a key from one side that sculpts
    if ((uB2[2].x > 0.0 || uB2[2].y != 0.0) && uM6On > 0.5) {
      vec2 nn = m6.rg * 2.0 - 1.0;
      vec3 N = vec3(nn, sqrt(max(0.0, 1.0 - dot(nn, nn))));
      float pm = smoothstep(0.35, 0.8, m0.b);
      if (uB2[2].x > 0.0) {
        float lam = max(dot(N, normalize(vec3(0.0, -0.4, 1.0))), 0.0);
        float g = uB2[2].x * (0.08 + 0.42 * lam * lam) * pm;
        c = c * (1.0 + g) / (1.0 + g * c);                              // soft roll-off: no clipped highlights
        c = mix(c, c * vec3(1.015, 1.0, 0.98), g);
      }
      if (uB2[2].y != 0.0) {
        float k = abs(uB2[2].y);
        float lam = dot(N, normalize(vec3(sign(uB2[2].y) * 0.85, -0.3, 0.45)));
        float s = clamp((lam + 0.35) / 1.35, 0.0, 1.0);
        float g = k * (0.62 * s - 0.27) * pm;                           // lit side up to +35%, the far side down to -27%
        if (g > 0.0) { c = c * (1.0 + g) / (1.0 + g * c); c = mix(c, c * vec3(1.03, 1.0, 0.96), g); }
        else c *= 1.0 + g;
      }
    }
    // background
    float person = m0.b;
    if (uB[14] > 0.0) {
      // lens-like background: a disc of samples (golden angle) where bright spots weigh more, so lights turn
      // into round bokeh. Only background pixels go in, so the person leaves no ghost behind.
      float lod = uBgLod * (1.0 - person) * 0.6;
      vec3 bl = vec3(0.0); float bw = 0.0;
      for (int i = 0; i < 28; i++) {
        float fi = float(i) + 0.5;
        float rr = sqrt(fi / 28.0) * uB[14], a = fi * 2.39996;
        vec2 o = vec2(cos(a), sin(a)) * uBgR * rr;
        float bgw = 1.0 - maskM0(p + o * uTexFull.zw).b;
        vec3 s = textureLod(uTex, tuv + o, lod).rgb;
        float hl = max(0.0, luma(s) - 0.62) / 0.38;
        float w = bgw * (1.0 + 7.0 * hl * hl);
        bl += s * w; bw += w;
      }
      vec3 blc = bw > 0.05 ? bl / bw : c;
      c = mix(c, blc, (1.0 - person) * clamp(uB[14] * 1.5, 0.0, 1.0));
    }
    if (uB[15] > 0.0) {
      // a firmer edge, and the old background's colour taken out of the soft edge so no light fringe is left
      // the slider sets how soft the cut-out edge is (100 = crisp); the new background always fully replaces the old one
      float ew = mix(0.48, 0.3, uB[15]);
      float a = smoothstep(0.5 - ew, 0.5 + ew, person);
      if (a > 0.01 && a < 0.99) {
        vec3 B = vec3(0.0); float bw = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854;
          vec2 o = vec2(cos(an), sin(an)) * uSkinR * 4.0;
          float w = 1.0 - smoothstep(0.02, 0.15, maskM0(p + o * uTexFull.zw).b);
          B += texture(uTex, tuv + o).rgb * w; bw += w;
        }
        if (bw > 0.3) c = clamp((c - (1.0 - a) * (B / bw)) / max(a, 0.25), 0.0, 1.0);
      }
      if (uBgC.a > 0.5) c = mix(uBgC.rgb, c, a);
      else alpha = a;
    }
    // background and person graded apart: the person mask (soft edge) decides who gets what
    if (uB[23] > 0.0 || uB[24] != 0.0 || uB[25] != 0.0 || uB[26] > 0.0 || uB[27] != 0.0 || uB[28] > 0.0) {
      float pm = smoothstep(0.3, 0.7, person);
      float bk = 1.0 - pm;
      vec3 bc = c;
      if (uB[28] > 0.0) {
        // switch chosen colours off in the background only: each pixel's hue is matched to the chosen bands
        float mx = max(bc.r, max(bc.g, bc.b)), mn = min(bc.r, min(bc.g, bc.b)), d = mx - mn;
        if (d > 0.02) {
          float h = mx == bc.r ? mod((bc.g - bc.b) / d, 6.0) : mx == bc.g ? (bc.b - bc.r) / d + 2.0 : (bc.r - bc.g) / d + 4.0;
          h *= 60.0;
          float k = 0.0;
          for (int i = 0; i < 8; i++) {
            if (uBgOff[i] < 0.5) continue;
            float hc = i == 0 ? 0.0 : i == 1 ? 30.0 : i == 2 ? 60.0 : i == 3 ? 120.0 : i == 4 ? 180.0 : i == 5 ? 225.0 : i == 6 ? 275.0 : 320.0;
            float wd = (i <= 2) ? 22.0 : 38.0;
            float dh = abs(mod(h - hc + 180.0, 360.0) - 180.0);
            k = max(k, 1.0 - smoothstep(wd * 0.5, wd, dh));
          }
          k *= smoothstep(0.02, 0.12, d / max(mx, 0.01));
          bc = mix(bc, vec3(luma(bc)), k * uB[28]);
        }
      }
      if (uB[25] != 0.0) { float l = luma(bc); bc = clamp(mix(vec3(l), bc, 1.0 + uB[25] * (uB[25] > 0.0 ? 0.9 : 1.0)), 0.0, 1.0); }
      if (uB[26] > 0.0) bc = mix(bc, mix(bColor(bc, uBgT), bSoftLight(bc, uBgT), 0.35), uB[26] * 0.9);
      if (uB[24] > 0.0) bc = bc + (1.0 - bc) * bc * uB[24] * 0.9 + (1.0 - bc) * uB[24] * 0.12;
      else if (uB[24] < 0.0) bc = bc * (1.0 + uB[24] * 0.72);
      // isolate the person: the world goes black and white (and a touch darker) around them
      if (uB[23] > 0.0) { float l = luma(bc); bc = mix(bc, vec3(l * (1.0 - 0.12 * uB[23])), uB[23]); }
      c = mix(c, bc, bk);
      if (uB[27] > 0.0) {
        // light on the person keeps their colours: brightness goes up, hue and depth stay (no grey or lilac veil)
        float l = max(luma(c), 0.004);
        float nl = l + (1.0 - l) * l * uB[27] * 0.9 + (1.0 - l) * uB[27] * 0.025;
        vec3 lit = c * (nl / l);
        float over = max(lit.r, max(lit.g, lit.b));
        if (over > 1.0) lit = mix(lit / over, vec3(1.0), clamp((over - 1.0) * 0.5, 0.0, 1.0));
        c = mix(c, clamp(lit, 0.0, 1.0), pm * smoothstep(0.55, 0.85, person));
      }
      else if (uB[27] < 0.0) c = mix(c, c * (1.0 + uB[27] * 0.6), pm);
    }
  }

  c = edAfter(c, p);
  c = edDetail(c, src, tuv, uU[13] + uF[13] * uFAmt, uU[12] + uF[12] * uFAmt, uU[18] + uF[18] * uFAmt);
  c = clamp(c, 0.0, 1.0);

  if (uFAmt > 0.0) c = mix(c, develop(c, uF, uCurveF, uFShadow, uFHigh, 0.0), uFAmt);
  if (uLutN > 0.5 && uFAmt > 0.0) {
    vec3 q = clamp(c, 0.0, 1.0) * (uLutN - 1.0);
    float b0 = floor(q.b), b1 = min(b0 + 1.0, uLutN - 1.0), t = q.b - b0;
    vec2 s = vec2((q.r + 0.5) / (uLutN * uLutN), (q.g + 0.5) / uLutN);
    vec3 l0 = texture(uLut3, s + vec2(b0 / uLutN, 0.0)).rgb, l1 = texture(uLut3, s + vec2(b1 / uLutN, 0.0)).rgb;
    c = mix(c, mix(l0, l1, t), uFAmt);
  }
  c = develop(c, uU, uCurveU, vec3(0.5), vec3(0.5), 1.0);
  c = joFx(c, gp, tuv, src, p);

  float vig = uU[14] + uF[14] * uFAmt;
  if (vig != 0.0) {
    vec2 d = (gp - 0.5) * vec2(uOutSize.x / max(uOutSize.x, uOutSize.y), uOutSize.y / max(uOutSize.x, uOutSize.y)) * 2.0;
    float v = smoothstep(0.35, 1.25, length(d));
    c = vig > 0.0 ? c * (1.0 - v * vig * 0.75) : mix(c, vec3(1.0), v * -vig * 0.6);
  }
  float gr = uU[15] + uF[15] * uFAmt;
  if (gr > 0.0) {
    float cell = max(1.0, max(uOutSize.x, uOutSize.y) / 1400.0);
    vec2 px = floor((uTileOrigin + vUv * uTileSize) / cell);
    float n = hash(px) + hash(px + 17.3) - 1.0;
    c += n * gr * 0.13 * (1.0 - luma(c) * 0.6);
  }
  if (uChecker > 0.5 && alpha < 1.0) {
    vec2 cc = floor(gl_FragCoord.xy / 14.0);
    c = mix(vec3(mod(cc.x + cc.y, 2.0) > 0.5 ? 0.3 : 0.22), c, alpha);
    alpha = 1.0;
  }
  outColor = vec4(clamp(c, 0.0, 1.0), alpha);
}`;function tt(a,t=256){const i=[...a].sort((c,h)=>c[0]-h[0]),e=new Float32Array(t),o=i.length;if(o<2){for(let c=0;c<t;c++)e[c]=c/(t-1);return e}const n=[],r=[],s=new Array(o);for(let c=0;c<o-1;c++)n[c]=Math.max(1e-6,i[c+1][0]-i[c][0]),r[c]=(i[c+1][1]-i[c][1])/n[c];s[0]=r[0],s[o-1]=r[o-2];for(let c=1;c<o-1;c++)s[c]=r[c-1]*r[c]<=0?0:(r[c-1]+r[c])/2;for(let c=0;c<o-1;c++){if(r[c]===0){s[c]=0,s[c+1]=0;continue}const h=s[c]/r[c],b=s[c+1]/r[c],F=h*h+b*b;if(F>9){const E=3/Math.sqrt(F);s[c]=E*h*r[c],s[c+1]=E*b*r[c]}}let l=0;for(let c=0;c<t;c++){const h=c/(t-1);let b;if(h<=i[0][0])b=i[0][1];else if(h>=i[o-1][0])b=i[o-1][1];else{for(;l<o-2&&h>i[l+1][0];)l++;const F=n[l],E=(h-i[l][0])/F,M=E*E,A=M*E;b=(2*A-3*M+1)*i[l][1]+(A-2*M+E)*F*s[l]+(-2*A+3*M)*i[l+1][1]+(A-M)*F*s[l+1]}e[c]=Math.min(1,Math.max(0,b))}return e}function $t(a){const t=tt(a.rgb),i=tt(a.r),e=tt(a.g),o=tt(a.b),n=new Uint8Array(256*4),r=(s,l)=>s[Math.round(l*255)];for(let s=0;s<256;s++){const l=t[s];n[s*4]=Math.round(r(i,l)*255),n[s*4+1]=Math.round(r(e,l)*255),n[s*4+2]=Math.round(r(o,l)*255),n[s*4+3]=255}return n}const vt={slimmer:.18,wider:.15},Ke=(a,t,i)=>Math.max(t,Math.min(i,a)),rt=(a,t,i)=>Math.exp(-((a-t)*(a-t))/(2*i*i));function Zt(a,t,i,e){if(!a.seg||![e.slim,e.waist,e.hips,e.shoulders,e.arms,e.legs].some(u=>Math.abs(u)>.004))return null;const n=Math.min(1,640/Math.max(a.w,a.h)),r=Math.max(2,Math.round(a.w*n)),s=Math.max(2,Math.round(a.h*n)),l=a.seg[0],c=a.segW,h=a.segH,b=new Float32Array(r*s);for(let u=0;u<s;u++){const f=Math.min(h-1,Math.floor((u+.5)/s*h))*c;for(let R=0;R<r;R++)b[u*r+R]=1-l[f+Math.min(c-1,Math.floor((R+.5)/r*c))]}const F=(u,f)=>{const R=Math.round(u),T=Math.round(f);return R<0||T<0||R>=r||T>=s?0:b[T*r+R]},E=u=>[t[u][0]*r,t[u][1]*s],M=(u,f)=>[(u[0]+f[0])/2,(u[1]+f[1])/2],A=(u,f)=>Math.hypot(u[0]-f[0],u[1]-f[1]),L=u=>i[u]>.5,g=E(11),x=E(12);let d=E(23),v=E(24);const y=A(g,x)||r*.1,P=[],N=L(23)&&L(24),I=!N&&L(11)&&L(12)&&Math.abs(e.shoulders)>.004;if(I){const u=[x[0]-g[0],x[1]-g[1]];let f=[-u[1],u[0]];f[1]<0&&(f=[-f[0],-f[1]]);const R=Math.hypot(f[0],f[1])||1,T=y*1.4/R;d=[g[0]+f[0]*T,g[1]+f[1]*T],v=[x[0]+f[0]*T,x[1]+f[1]*T],e={...e,slim:0,waist:0,hips:0}}if(L(11)&&L(12)&&(N||I)){const u=M(g,x),f=M(d,v),R=y*.15,T=g[0]<x[0],U=Y=>{const ee=Y===-1===T?[11,13,15]:[12,14,16];return ee.every(L)?ee.map(E):null},H={[-1]:U(-1),1:U(1)},_=[(f[0]-u[0])/(A(u,f)||1),(f[1]-u[1])/(A(u,f)||1)],q=[_[1],-_[0]],X=q[0]>=0?q:[-q[0],-q[1]],re=A(u,f)||1;P.push({A:u,B:f,t0:-.12,t1:1.3,maxH:y*.75,rigid:!0,k:Y=>{const ee=Y<0?Ke(1+Y/.12,0,1):1;let V=1;return V*=1-.08*e.slim*Ke((Y-.05)/.2,0,1)*(Y>1.1?Ke((1.3-Y)/.2,0,1):1),V*=1-.13*e.waist*rt(Y,.7,.17),V*=1+.08*e.hips*rt(Y,1.06,.13),V*=1+.07*e.shoulders*rt(Y,.06,.13),V=Ke(V,1-vt.slimmer,1+vt.wider),1+(V-1)*ee},limit:(Y,ee)=>{const V=H[ee];if(!V)return 1/0;const fe=[u[0]+_[0]*Y*re,u[1]+_[1]*Y*re];let ye=1/0;for(let me=0;me<2;me++){const oe=V[me],W=V[me+1],Q=[W[0]-oe[0],W[1]-oe[1]],de=Q[0]*X[1]-Q[1]*X[0];if(Math.abs(de)<1e-6)continue;const te=((fe[0]-oe[0])*X[1]-(fe[1]-oe[1])*X[0])/de;if(te<-.05||te>1.05)continue;const se=[oe[0]+Q[0]*te,oe[1]+Q[1]*te],ae=(se[0]-fe[0])*X[0]+(se[1]-fe[1])*X[1];Math.sign(ae)===ee&&(ye=Math.min(ye,Math.abs(ae)-R))}return ye}})}const D=(u,f,R,T,U)=>{if(Math.abs(R)<.004||!L(u)||!L(f))return;const H=E(u),_=E(f);P.push({A:H,B:_,t0:-.1,t1:1.1,maxH:T,rigid:!1,k:q=>1-U*R*Ke(Math.min(q+.1,1.1-q)/.25,0,1)})};for(const[u,f]of[[11,13],[13,15],[12,14],[14,16]])D(u,f,e.arms,y*.2,.13);for(const[u,f]of[[23,25],[25,27],[24,26],[26,28]])D(u,f,e.legs,y*.36,.1);if(!P.length)return null;const C=new Float32Array(r*s),S=new Float32Array(r*s),m=56;for(const u of P){const f=A(u.A,u.B)||1,R=[(u.B[0]-u.A[0])/f,(u.B[1]-u.A[1])/f],T=[R[1],-R[0]],U=T[0]>=0?T:[-T[0],-T[1]],H=Array.from({length:m},(W,Q)=>u.t0+(u.t1-u.t0)*Q/(m-1)),_={[-1]:{h:new Float32Array(m),o:new Float32Array(m)},1:{h:new Float32Array(m),o:new Float32Array(m)}},q=Math.max(u.maxH*2.2,y*1.2);for(let W=0;W<m;W++){const Q=[u.A[0]+R[0]*H[W]*f,u.A[1]+R[1]*H[W]*f];for(const de of[-1,1]){let te=0;if(F(Q[0],Q[1])>.5)for(;te<q&&F(Q[0]+U[0]*de*(te+1),Q[1]+U[1]*de*(te+1))>.5;)te++;const se=te;let ae=Math.min(se,u.maxH,u.limit?u.limit(H[W],de):1/0);ae=Math.max(ae,0),_[de].h[W]=ae,_[de].o[W]=u.rigid?Math.max(se,ae):ae}}for(const W of[-1,1])for(const Q of[_[W].h,_[W].o]){const de=Float32Array.from(Q,(te,se)=>[Q[Math.max(0,se-1)],Q[se],Q[Math.min(m-1,se+1)]].sort((ge,xe)=>ge-xe)[1]);for(let te=0;te<m;te++){let se=0,ae=0;for(let ge=-3;ge<=3;ge++){const xe=te+ge;xe>=0&&xe<m&&(se+=de[xe],ae++)}Q[te]=se/ae}}const X=Float32Array.from(H,W=>u.k(W)),re=Math.max(...Array.from(_[-1].o),...Array.from(_[1].o))*2+4,Y=[u.A[0],u.B[0]],ee=[u.A[1],u.B[1]],V=Math.max(Math.abs(u.t0),Math.abs(u.t1-1))*f,fe=Math.max(0,Math.floor(Math.min(...Y)-re-V)),ye=Math.min(r-1,Math.ceil(Math.max(...Y)+re+V)),me=Math.max(0,Math.floor(Math.min(...ee)-re-V)),oe=Math.min(s-1,Math.ceil(Math.max(...ee)+re+V));for(let W=me;W<=oe;W++)for(let Q=fe;Q<=ye;Q++){const de=Q+.5-u.A[0],te=W+.5-u.A[1],se=(de*R[0]+te*R[1])/f;if(se<=u.t0||se>=u.t1)continue;const ae=de*U[0]+te*U[1],ge=ae>=0?1:-1,xe=(se-u.t0)/(u.t1-u.t0)*(m-1),Ae=Math.floor(xe),ve=Math.min(m-1,Ae+1),ke=xe-Ae,Be=_[ge].h[Ae]*(1-ke)+_[ge].h[ve]*ke;if(Be<1)continue;const Ne=_[ge].o[Ae]*(1-ke)+_[ge].o[ve]*ke,ze=X[Ae]*(1-ke)+X[ve]*ke;if(Math.abs(ze-1)<.001)continue;const Fe=Math.abs(ae),et=Be*ze,Ie=et-Be,Oe=Math.max(Math.abs(Ie)*3,(e.tight?.35:.7)*Be);let _e;if(Fe<=et)_e=Fe/ze;else if(Fe<=Ne+Ie)_e=Fe-Ie;else if(Fe<=Ne+Oe)_e=Ne+(Fe-(Ne+Ie))*Oe/(Oe-Ie);else continue;const Le=(_e-Fe)*ge;C[W*r+Q]+=Le*U[0],S[W*r+Q]+=Le*U[1]}}const w=u=>{const f=new Float32Array(u.length);for(let R=0;R<s;R++)for(let T=0;T<r;T++){let U=0,H=0;for(let _=-2;_<=2;_++){const q=T+_;q>=0&&q<r&&(U+=u[R*r+q],H++)}f[R*r+T]=U/H}for(let R=0;R<s;R++)for(let T=0;T<r;T++){let U=0,H=0;for(let _=-2;_<=2;_++){const q=R+_;q>=0&&q<s&&(U+=f[q*r+T],H++)}u[R*r+T]=U/H}};w(C),w(S);const k=new Float32Array(r*s*2);for(let u=0;u<r*s;u++)k[u*2]=C[u]/r,k[u*2+1]=S[u]/s;return{w:r,h:s,data:k}}function e0(a,t,i,e,o,n,r){const s=a.seg;if(!s||o<=.004)return!1;const l=a.segW,c=a.segH,h=(S,m,w)=>{const k=Math.floor(m/i*l),u=Math.floor(w/e*c);return k<0||u<0||k>=l||u>=c?0:s[S][u*l+k]},b=S=>[t[S][0]*i,t[S][1]*e],F=b(10),E=b(152),M=Math.hypot(F[0]-E[0],F[1]-E[1]);if(M<8)return!1;const A=[(F[0]-E[0])/M,(F[1]-E[1])/M],L=[(F[0]+E[0])/2+A[0]*.15*M,(F[1]+E[1])/2+A[1]*.15*M],g=180,x=new Float32Array(g),d=new Float32Array(g),v=Math.max(.5,M/120),y=M*2.2;for(let S=0;S<g;S++){const m=S/g*Math.PI*2,w=Math.cos(m),k=Math.sin(m);let u=0,f=0,R=0;for(let T=0;T<y;T+=v){const U=L[0]+w*T,H=L[1]+k*T;if(h(3,U,H)>.5&&(u=T),h(1,U,H)>.5)f=T,R=0;else if(f>0&&++R*v>M*.15)break}x[S]=u,d[S]=Math.max(f,u)}const P=(S,m)=>{const w=new Float32Array(g);for(let k=0;k<g;k++){let u=0;for(let f=-m;f<=m;f++)u+=S[(k+f+g)%g];w[k]=u/(2*m+1)}return w},N=P(x,4),I=P(d,6);let D=!1;for(let S=0;S<e;S++)for(let m=0;m<i;m++){const w=m-L[0],k=S-L[1],u=Math.hypot(w,k);if(u<1||u>y*1.3)continue;let f=Math.atan2(k,w);f<0&&(f+=Math.PI*2);const R=f/(Math.PI*2)*g,T=Math.floor(R)%g,U=(T+1)%g,H=R-Math.floor(R),_=N[T]*(1-H)+N[U]*H,q=I[T]*(1-H)+I[U]*H,X=q-_;if(X<M*.02)continue;const re=Math.min(1,Math.max(0,(X-M*.02)/(M*.1))),Y=o*Math.min(.15*M,.6*X)*re*re*(3-2*re),ee=Math.max(Y*3,M*.05);let V;if(u<=_)V=0;else if(u<=q){const oe=(u-_)/X;V=oe*oe*(3-2*oe)}else if(u<=q+ee){const oe=1-(u-q)/ee;V=oe*oe*(3-2*oe)}else V=0;if(V<=0)continue;const fe=1-Math.min(1,h(2,m,S)+h(4,m,S))*(1-h(1,m,S)),ye=Y*V*fe/u,me=S*i+m;n[me]-=w*ye,r[me]-=k*ye,D=!0}if(!D)return!1;const C=Math.max(1,Math.round(M*.04));for(const S of[n,r])for(let m=0;m<2;m++){const w=new Float32Array(i*e);for(let k=0;k<e;k++){let u=0;for(let f=-C;f<i+C;f++)f+C<i&&(u+=S[k*i+Math.min(i-1,f+C)]),f-C-1>=0&&(u-=S[k*i+f-C-1]),f>=0&&f<i&&(w[k*i+f]=u/(2*C+1))}for(let k=0;k<i;k++){let u=0;for(let f=-C;f<e+C;f++)f+C<e&&(u+=w[Math.min(e-1,f+C)*i+k]),f-C-1>=0&&(u-=w[(f-C-1)*i+k]),f>=0&&f<e&&(S[f*i+k]=u/(2*C+1))}}return!0}const bt=a=>[a.slim,a.vshape,a.jaw,a.chin,a.forehead,a.nose,a.noseW,a.eyes,a.lips,a.dchin??0,a.smile??0,a.cheekbones??0,a.browLift??0,a.symmetry??0],je=[10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109],t0=[[.12,.8],[.22,.6],[.32,.4],[.42,.2],[.54,0]],Re=(a,t,i)=>{const e=Math.max(0,Math.min(1,(i-a)/(t-a)));return e*e*(3-2*e)};function a0(a){const t=a.length;let i=1/0,e=1/0,o=-1/0,n=-1/0;for(const[E,M]of a)i=Math.min(i,E),e=Math.min(e,M),o=Math.max(o,E),n=Math.max(n,M);const r=Math.max(o-i,n-e)*20,s=(i+o)/2,l=(e+n)/2,c=a.concat([[s-r,l-r],[s+r,l-r],[s,l+r]]),h=(E,M,A)=>{const[L,g]=c[E],[x,d]=c[M],[v,y]=c[A],P=2*(L*(d-y)+x*(y-g)+v*(g-d))||1e-12,N=((L*L+g*g)*(d-y)+(x*x+d*d)*(y-g)+(v*v+y*y)*(g-d))/P,I=((L*L+g*g)*(v-x)+(x*x+d*d)*(L-v)+(v*v+y*y)*(x-L))/P;return{a:E,b:M,c:A,x:N,y:I,r2:(L-N)**2+(g-I)**2}};let b=[h(t,t+1,t+2)];for(let E=0;E<t;E++){const[M,A]=c[E],L=[],g=[];for(const d of b)((M-d.x)**2+(A-d.y)**2<d.r2?L:g).push(d);const x=new Map;for(const d of L)for(const[v,y]of[[d.a,d.b],[d.b,d.c],[d.c,d.a]]){const P=v<y?v+","+y:y+","+v;x.has(P)?x.delete(P):x.set(P,[v,y])}for(const[d,v]of x.values())g.push(h(d,v,E));b=g}const F=[];for(const E of b)E.a<t&&E.b<t&&E.c<t&&F.push(E.a,E.b,E.c);return F}const lt=(a,t,i)=>(t[0]-a[0])*(i[1]-a[1])-(i[0]-a[0])*(t[1]-a[1]);function o0(a,t,i,e,o,n,r,s){if(!bt(e).some(p=>Math.abs(p)>.004))return 1;const l=a.map(p=>[p[0]*t,p[1]*i]),c=a.map(p=>(p[2]??0)*t),h=p=>[l[p][0],l[p][1],c[p]],b=(p,B)=>[p[0]-B[0],p[1]-B[1],p[2]-B[2]],F=(p,B)=>p[0]*B[0]+p[1]*B[1]+p[2]*B[2],E=p=>{const B=Math.hypot(p[0],p[1],p[2])||1;return[p[0]/B,p[1]/B,p[2]/B]},M=(p,B)=>[p[1]*B[2]-p[2]*B[1],p[2]*B[0]-p[0]*B[2],p[0]*B[1]-p[1]*B[0]],A=b(h(454),h(234)),L=b(h(152),h(10)),g=Math.hypot(A[0],A[1],A[2])||1,x=Math.hypot(L[0],L[1],L[2])||1,d=E(A),v=E(b(L,d.map(p=>p*F(L,d))));let y=M(d,v);y[2]>0&&(y=y.map(p=>-p));const P=h(10).map((p,B)=>(p+h(152)[B])/2),N=(()=>{const p=[l[152][0]-l[10][0],l[152][1]-l[10][1]],B=Math.hypot(p[0],p[1])||1;return[p[0]/B,p[1]/B]})(),I=[-N[1],N[0]],D=Math.hypot(l[454][0]-l[234][0],l[454][1]-l[234][1])||g,C=Math.hypot(l[152][0]-l[10][0],l[152][1]-l[10][1])||x,S=[(l[234][0]+l[454][0])/2,(l[234][1]+l[454][1])/2],m=h(234).map((p,B)=>(p+h(454)[B])/2),w=Re(.35,.75,Math.abs(d[2])),k=p=>{const B=[l[p][0]-S[0],l[p][1]-S[1]],z=[l[p][0]-P[0],l[p][1]-P[1]],G=(B[0]*I[0]+B[1]*I[1])/(D/2),j=w>0?F(b(h(p),m),d)/(g/2):0;return[G+(j-G)*w,(z[0]*N[0]+z[1]*N[1])/(C/2)]},u=p=>{const B=Math.asin(Math.max(-1,Math.min(1,p)));return-(Math.sin(B)*d[2]+Math.cos(B)*y[2])},f=p=>Re(-.05,.5,u(p))*(o==="r"&&p<-.2||o==="l"&&p>.2?0:1),R=p=>{let B=0,z=0;for(const G of p)B+=l[G][0],z+=l[G][1];return[B/p.length,z/p.length]},T=(p,B)=>Math.hypot(p[0]-B[0],p[1]-B[1]),U=R([33,133,159,145]),H=R([362,263,386,374]),_=Math.max(T(l[33],l[133]),T(l[362],l[263]))/2||g*.1,q=R([4,98,327,6]),X=Math.max(T(l[98],l[327])/2,g*.08),re=R([13,14,61,291]),Y=Math.max(T(l[61],l[291])/2,g*.12),ee=f(k(33)[0]),V=f(k(263)[0]),fe=[d[0],d[1]],ye=Math.hypot(d[0],d[1])||1,me=[P[0],P[1]],oe=l[61],W=l[291],Q=R([116,123,117]),de=R([345,352,346]),te=R([46,53,52,65,55,70,63,105,66,107]),se=R([276,283,282,295,285,300,293,334,296,336]),ae=Math.max(T(l[46],l[55]),T(l[276],l[285]))/2||D*.15,ge=(p,B,z,G)=>{const j=p[0]-B[0],J=p[1]-B[1],$=j*I[0]+J*I[1],Z=j*N[0]+J*N[1];return Math.exp(-($*$)/(2*z*z)-Z*Z/(2*G*G))},xe=[];if(e.symmetry){const p=Math.min(468,l.length),B=Array.from({length:p},(j,J)=>k(J)),z=.035,G=.8*(1-w);for(let j=0;j<p;j++){const[J,$]=B[j];if(Math.abs(J)<.03){xe.push([0,0]);continue}let Z=1e9,pe=j;for(let Me=0;Me<p;Me++){const ne=(B[Me][0]+J)**2+(B[Me][1]-$)**2;ne<Z&&(Z=ne,pe=Me)}const le=Math.max(-z,Math.min(z,(-B[pe][0]-J)/2))*G,ce=Math.max(-z,Math.min(z,(B[pe][1]-$)/2))*G;xe.push([le*I[0]*D/2+ce*N[0]*C/2,le*I[1]*D/2+ce*N[1]*C/2])}}const Ae=(p,B,z)=>{const[G,j]=k(p),J=f(G);let $=0,Z=0;const pe=Math.sin(Math.max(-1,Math.min(1,G))*Math.PI/2);$+=-pe*.09*e.slim*Re(-.45,.25,j),$+=-pe*.11*e.vshape*Re(.15,.75,j),Z+=.03*e.vshape*Re(.6,1,j)*(1-Math.min(1,Math.abs(G))),$+=pe*.07*e.jaw*Math.exp(-((j-.62)**2)/(2*.2*.2)),Z+=.07*e.chin*Re(.45,1,j)*Math.max(0,1-Math.abs(G)*.9),Z+=-.06*e.forehead*Re(-.35,-1,j)*Math.max(0,1-Math.abs(G)*.6);let le=($*I[0]*D/2+Z*N[0]*C/2)*J,ce=($*I[1]*D/2+Z*N[1]*C/2)*J;const Me=(ne,ue,he,Te=!1)=>{const Pe=T(B,ne),be=1-Re(ue*.7,ue*1.9,Pe);if(be<=0||!he)return;const Ye=B[0]-ne[0],Je=B[1]-ne[1];if(Te){const pt=(Ye*fe[0]+Je*fe[1])/(ye*ye);le+=pt*fe[0]*he*be,ce+=pt*fe[1]*he*be}else le+=Ye*he*be,ce+=Je*he*be};if(e.eyes&&(Me(U,_,.13*e.eyes*ee),Me(H,_,.13*e.eyes*V)),e.nose&&Me(q,X*1.3,.12*e.nose),e.noseW&&Me(q,X,.16*e.noseW,!0),e.lips){const ne=T(B,re),ue=1-Re(Y*.7,Y*1.9,ne);if(ue>0){const he=B[0]-re[0],Te=B[1]-re[1],Pe=he*I[0]+Te*I[1],be=he*N[0]+Te*N[1],Ye=.06*e.lips*ue,Je=.17*e.lips*ue;le+=Pe*Ye*I[0]+be*Je*N[0],ce+=Pe*Ye*I[1]+be*Je*N[1]}}if(e.smile)for(const[ne,ue,he]of[[oe,-1,ee],[W,1,V]]){const Te=ge(B,ne,Y*.42,Y*.5)*e.smile*he,Pe=.2*Y*Te,be=.06*Y*Te;le+=-N[0]*Pe+I[0]*ue*be,ce+=-N[1]*Pe+I[1]*ue*be}if(e.cheekbones)for(const[ne,ue,he]of[[Q,-1,ee],[de,1,V]]){const Te=ge(B,ne,D*.09,D*.07)*e.cheekbones*he;le+=(I[0]*ue*.03-N[0]*.012)*D*Te,ce+=(I[1]*ue*.03-N[1]*.012)*D*Te}if(e.browLift)for(const[ne,ue,he]of[[te,U,ee],[se,H,V]]){const Te=Re(_*.75,_*1.35,T(B,ue)),Pe=ge(B,[ne[0]-N[0]*ae*.15,ne[1]-N[1]*ae*.15],ae*.95,ae*.55)*e.browLift*Te*he,be=.024*C*Pe;le+=-N[0]*be,ce+=-N[1]*be}return e.symmetry&&xe[p]&&(le+=xe[p][0]*e.symmetry,ce+=xe[p][1]*e.symmetry),[le*z,ce*z]},ve=l.slice(0,Math.min(468,l.length)),ke=ve.length,Be=[],Ne=[],ze=je.map((p,B)=>{const z=l[je[(B+je.length-1)%je.length]],G=l[je[(B+1)%je.length]];let j=G[0]-z[0],J=G[1]-z[1];const $=Math.hypot(j,J)||1;j/=$,J/=$;let Z=-J,pe=j;Z*(l[p][0]-me[0])+pe*(l[p][1]-me[1])<0&&(Z=-Z,pe=-pe);const le=l[p][0]-me[0],ce=l[p][1]-me[1],Me=Math.hypot(le,ce)||1,ne=Z+le/Me,ue=pe+ce/Me,he=Math.hypot(ne,ue)||1;return[ne/he,ue/he]}),Fe=[];t0.forEach(([p,B],z)=>je.forEach((G,j)=>{ve.push([l[G][0]+ze[j][0]*p*g,l[G][1]+ze[j][1]*p*g]),Be.push(G),Ne.push(B),Fe.push(z)}));const et=[.75,1,.6,.25,0],Ie=(p,B)=>{if(!e.dchin)return[0,0];const[z,G]=k(Be[p]),j=-.055*C*e.dchin*et[Fe[p]]*Re(.5,.95,G)*(1-Math.min(1,Math.abs(z))*.55)*f(z)*B;return[N[0]*j,N[1]*j]},Oe=ve.length;ve.push([-t,-i],[2*t,-i],[2*t,2*i],[-t,2*i]);const _e=a0(ve),Le=ve.map((p,B)=>s&&B<Oe&&p[0]>=0&&p[1]>=0&&p[0]<t&&p[1]<i?Math.min(1,Math.max(0,s(p[0],p[1],B<ke))):0),qe=new Float32Array(t*i),Xe=new Float32Array(t*i),nt=Math.max(...bt(e).map(Math.abs),.004);let He=1/nt;const Vt=p=>ve.map((B,z)=>{if(z<ke){const G=Ae(z,B,p),j=1-Le[z];return[B[0]+G[0]*j,B[1]+G[1]*j]}if(z<Oe){const G=z-ke,j=Ae(Be[G],l[Be[G]],p),J=Ne[G]*(1-Le[z]),$=Ie(G,p),Z=1-Le[z];return[B[0]+j[0]*J+$[0]*Z,B[1]+j[1]*J+$[1]*Z]}return B});for(let p=0;p<10;p++){const B=ve.map((j,J)=>{if(J<ke){const $=Ae(J,j,He),Z=1-Le[J];return[j[0]+$[0]*Z,j[1]+$[1]*Z]}if(J<Oe){const $=J-ke,Z=Ae(Be[$],l[Be[$]],He),pe=Ne[$]*(1-Le[J]),le=Ie($,He),ce=1-Le[J];return[j[0]+Z[0]*pe+le[0]*ce,j[1]+Z[1]*pe+le[1]*ce]}return j});qe.fill(0),Xe.fill(0),wt(_e,ve,B,t,i,qe,Xe);const[z,G]=mt(qe,Xe,t,i);if(z>=.72&&G<=1.4)break;He*=.8}He*=nt,nt<.999&&(qe.fill(0),Xe.fill(0),wt(_e,ve,Vt(He),t,i,qe,Xe));for(let p=0;p<t*i;p++)n[p]+=qe[p],r[p]+=Xe[p];return He}function wt(a,t,i,e,o,n,r){for(let s=0;s<a.length;s+=3){const l=a[s],c=a[s+1],h=a[s+2],b=t[l],F=t[c],E=t[h],M=i[l],A=i[c],L=i[h];if(Math.max(Math.abs(b[0]-M[0])+Math.abs(b[1]-M[1]),Math.abs(F[0]-A[0])+Math.abs(F[1]-A[1]),Math.abs(E[0]-L[0])+Math.abs(E[1]-L[1]))<.005)continue;const x=lt(M,A,L);if(Math.abs(x)<1e-9)continue;const d=Math.max(0,Math.floor(Math.min(M[0],A[0],L[0]))),v=Math.min(e-1,Math.ceil(Math.max(M[0],A[0],L[0]))),y=Math.max(0,Math.floor(Math.min(M[1],A[1],L[1]))),P=Math.min(o-1,Math.ceil(Math.max(M[1],A[1],L[1])));for(let N=y;N<=P;N++)for(let I=d;I<=v;I++){const D=[I+.5,N+.5],C=lt(A,L,D)/x,S=lt(L,M,D)/x,m=1-C-S;C<-1e-6||S<-1e-6||m<-1e-6||(n[N*e+I]=C*b[0]+S*F[0]+m*E[0]-D[0],r[N*e+I]=C*b[1]+S*F[1]+m*E[1]-D[1])}}}function mt(a,t,i,e){let o=1,n=1;for(let r=0;r<e-2;r++)for(let s=0;s<i-2;s++){const l=r*i+s,c=1+(a[l+2]-a[l])/2,h=(a[l+2*i]-a[l])/2,b=(t[l+2]-t[l])/2,F=1+(t[l+2*i]-t[l])/2;if(c===1&&h===0&&b===0&&F===1)continue;const E=c*c+h*h+b*b+F*F,M=c*F-h*b,A=Math.sqrt(Math.max(0,E*E/4-M*M)),L=Math.sqrt(E/2+A),g=M<=0?0:Math.sqrt(Math.max(0,E/2-A));g<o&&(o=g),L>n&&(n=L)}return[o,n]}const i0=(a,t,i)=>{const e=Math.max(0,Math.min(1,(i-a)/(t-a)));return e*e*(3-2*e)};let yt="",Mt=null,kt=0;const s0=()=>({gender:null,face:0,v:{},lip:"#b8324a",blush:"#e0707a",shadow:"#6b4a5a",hair:"#5a3020",bg:"#ffffff",lens:"#5a86b8",bgT:"#2a6cff",lock:!0,liq:[]}),Ct=[{id:"autoBeauty",name:"تجميل بلمسة",group:"ذكاء",min:0,max:100},{id:"faceSlim",name:"نحافة الوجه",group:"الوجه",min:0,max:100},{id:"vshape",name:"وجه V",group:"الوجه",min:0,max:100,only:"f"},{id:"jaw",name:"عرض الفك",group:"الوجه",min:-100,max:100},{id:"chin",name:"الذقن",group:"الوجه",min:-100,max:100},{id:"forehead",name:"الجبهة",group:"الوجه",min:-100,max:100},{id:"nose",name:"حجم الأنف",group:"الوجه",min:-100,max:100},{id:"noseW",name:"عرض الأنف",group:"الوجه",min:-100,max:100},{id:"eyes",name:"العيون",group:"الوجه",min:-100,max:100},{id:"lips",name:"الشفاه",group:"الوجه",min:-100,max:100},{id:"dchin",name:"إزالة الغبغب",group:"الوجه",min:0,max:100},{id:"smile",name:"ابتسامة",group:"الوجه",min:0,max:100},{id:"cheekbones",name:"عظام الخد",group:"الوجه",min:-100,max:100},{id:"browLift",name:"رفع الحواجب",group:"الوجه",min:-100,max:100},{id:"symmetry",name:"تناسق الوجه",group:"الوجه",min:0,max:100},{id:"smooth",name:"نعومة",group:"البشرة",min:0,max:100},{id:"even",name:"توحيد اللون",group:"البشرة",min:0,max:100},{id:"bright",name:"إشراقة",group:"البشرة",min:-100,max:100},{id:"warm",name:"دفء البشرة",group:"البشرة",min:-100,max:100},{id:"blemish",name:"إزالة الحبوب",group:"البشرة",min:0,max:100},{id:"matte",name:"إزالة اللمعة",group:"البشرة",min:0,max:100},{id:"undereye",name:"الهالات",group:"البشرة",min:0,max:100},{id:"wrinkles",name:"التجاعيد",group:"البشرة",min:0,max:100},{id:"sculpt",name:"نحت بالضوء",group:"البشرة",min:0,max:100},{id:"tan",name:"سمرة خفيفة",group:"البشرة",min:0,max:100},{id:"freckles",name:"نمش",group:"البشرة",min:0,max:100},{id:"teeth",name:"تبييض الأسنان",group:"البشرة",min:0,max:100},{id:"eyeGlow",name:"لمعة العيون",group:"البشرة",min:0,max:100},{id:"eyeWhite",name:"بياض العين",group:"البشرة",min:0,max:100},{id:"catchlight",name:"نقطة ضوء بالعين",group:"البشرة",min:0,max:100},{id:"redEye",name:"العين الحمراء",group:"البشرة",min:0,max:100},{id:"lens",name:"عدسات ملونة",group:"البشرة",min:0,max:100,swatch:"lens"},{id:"lipstick",name:"أحمر الشفاه",group:"مكياج",min:0,max:100,only:"f",swatch:"lip"},{id:"blush",name:"بلشر",group:"مكياج",min:0,max:100,only:"f",swatch:"blush"},{id:"shadow",name:"ظلال وكحل",group:"مكياج",min:0,max:100,only:"f",swatch:"shadow"},{id:"brows",name:"الحواجب",group:"مكياج",min:0,max:100,only:"f"},{id:"liner",name:"آيلاينر ورموش",group:"مكياج",min:0,max:100,only:"f"},{id:"contour",name:"كونتور",group:"مكياج",min:0,max:100,only:"f"},{id:"highlight",name:"هايلايت",group:"مكياج",min:0,max:100,only:"f"},{id:"beard",name:"كثافة اللحية",group:"عناية",min:0,max:100,only:"m"},{id:"browsM",name:"كثافة الحواجب",group:"عناية",min:0,max:100,only:"m"},{id:"hairFill",name:"كثافة الشعر",group:"الشعر",min:0,max:100},{id:"hairVol",name:"حجم الشعر",group:"الشعر",min:0,max:100},{id:"hairColor",name:"لون الشعر",group:"الشعر",min:0,max:100,swatch:"hair"},{id:"hairShine",name:"لمعان الشعر",group:"الشعر",min:0,max:100},{id:"hairline",name:"خط الشعر",group:"الشعر",min:0,max:100},{id:"greyCover",name:"تغطية الشيب",group:"الشعر",min:0,max:100},{id:"studio",name:"إضاءة استوديو",group:"الإضاءة",min:0,max:100},{id:"sideLight",name:"ضوء جانبي",group:"الإضاءة",min:-100,max:100},{id:"bodySlim",name:"نحافة الجسم",group:"الجسم",min:-100,max:100},{id:"waist",name:"الخصر",group:"الجسم",min:-100,max:100},{id:"hips",name:"الورك",group:"الجسم",min:-100,max:100,only:"f"},{id:"shoulders",name:"الأكتاف",group:"الجسم",min:-100,max:100},{id:"arms",name:"الذراعين",group:"الجسم",min:-100,max:100},{id:"legs",name:"الساقين",group:"الجسم",min:-100,max:100},{id:"height",name:"الطول",group:"الجسم",min:0,max:100},{id:"bgBlur",name:"تغبيش الخلفية",group:"الخلفية",min:0,max:100},{id:"bgSwap",name:"تبديل الخلفية",group:"الخلفية",min:0,max:100,swatch:"bg"},{id:"bgPop",name:"عزل الشخص",group:"الخلفية",min:0,max:100},{id:"bgLight",name:"إضاءة الخلفية",group:"الخلفية",min:-100,max:100},{id:"bgSat",name:"ألوان الخلفية",group:"الخلفية",min:-100,max:100},{id:"bgKill",name:"إطفاء ألوان",group:"الخلفية",min:0,max:100},{id:"bgTint",name:"صبغة الخلفية",group:"الخلفية",min:0,max:100,swatch:"bgT"},{id:"subjLight",name:"إضاءة الشخص",group:"الخلفية",min:-100,max:100},{id:"reshape",name:"فرشاة التشكيل",group:"تشكيل حر",min:10,max:100}],H0={lip:["#b8324a","#d0455e","#9b2335","#c8576b","#e07a7a","#8a3a3a","#c06a5a","#6e2a3a"],blush:["#e0707a","#f08a7a","#d9607a","#f0a090","#c86a6a"],shadow:["#6b4a5a","#8a6a50","#4a3a3a","#7a5a7a","#a07050","#2a2228"],hair:["#141010","#5a3020","#2a1a14","#8a5a30","#c09060","#a03a2a","#6a2a4a","#3a3a50","#d0c0b0"],lens:["#5a86b8","#4f8a6a","#8a6a3c","#8a8f98","#a7834f","#3a2a22"],bg:["#ffffff","#f2e8de","#1a1a1a","#e8d0d8","#cfe0f0","#d8e8d0","transparent"],bgT:["#2a6cff","#18b8a8","#ff7a3a","#ff4f8b","#8a5cff","#d4ff3a","#f2c68a","#3a3f5a"]};function j0(a){return Ct.filter(t=>!t.only||t.only===a)}const n0={eyeWhite:.3,wrinkles:.2,smooth:.6,even:.4,bright:.16,undereye:.55,eyeGlow:.35,teeth:.35,blemish:.5,matte:.3,faceSlim:.2,eyes:.12,nose:-.1},r0={eyeWhite:.25,wrinkles:.3,smooth:.45,even:.35,bright:.08,undereye:.45,eyeGlow:.25,teeth:.3,blemish:.5,matte:.4,jaw:.1};function Dt(a){return!a||a.stretch[1]<=0?1:1+(1-a.stretch[0])*a.stretch[1]}function Tt(a,t){if(!t||t.stretch[1]<=0)return a;const i=1+t.stretch[1],e=a*Dt(t);return e<=t.stretch[0]?e:t.stretch[0]+(e-t.stretch[0])/i}const Nt="joji.prints.v1";function G0(){try{return JSON.parse(localStorage.getItem(Nt)||"[]")}catch{return[]}}function z0(a){try{localStorage.setItem(Nt,JSON.stringify(a))}catch{}}const q0=[{id:"f-natural",name:"ناعم طبيعي",gender:"f",v:{smooth:.35,even:.3,undereye:.4,eyes:.1,nose:-.15,lipstick:.2,blush:.2},lip:"#c8576b",blush:"#f0a090"},{id:"f-doll",name:"دمية",gender:"f",v:{smooth:.5,even:.4,bright:.15,undereye:.5,eyes:.25,nose:-.3,noseW:-.2,faceSlim:.25,vshape:.2,lips:.15,lipstick:.35,blush:.35,liner:.35},lip:"#d0455e",blush:"#e0707a"},{id:"f-glam",name:"سهرة",gender:"f",v:{smooth:.4,even:.35,nose:-.2,contour:.5,highlight:.4,liner:.7,shadow:.4,brows:.3,lipstick:.6},lip:"#9b2335",shadow:"#6b4a5a"},{id:"f-redlip",name:"أحمر جريء",gender:"f",v:{smooth:.3,even:.3,lipstick:.75,liner:.5,contour:.3,brows:.2},lip:"#b8142e"},{id:"f-caramel",name:"كراميل",gender:"f",v:{smooth:.35,warm:.25,bright:.1,nose:-.15,eyes:.1,lipstick:.4,blush:.3,contour:.3,liner:.3},lip:"#c06a5a",blush:"#f08a7a"},{id:"m-clean",name:"نظيف",gender:"m",v:{smooth:.25,even:.3,undereye:.45,teeth:.3}},{id:"m-sharp",name:"ملامح حادة",gender:"m",v:{smooth:.2,even:.25,jaw:.25,chin:.15,faceSlim:.1,nose:-.1,beard:.3,browsM:.2}},{id:"m-fresh",name:"وجه منتعش",gender:"m",v:{smooth:.3,even:.3,bright:.2,undereye:.4,eyeGlow:.3,teeth:.25}}],Ge=a=>[1,3,5].map(t=>parseInt(a.slice(t,t+2),16)/255),Et={chin:152,forehead:10},l0=(a,t)=>[a[0]-t[0],a[1]-t[1]],c0=a=>Math.hypot(a[0],a[1]),Bt=(a,t)=>[(a[0]+t[0])/2,(a[1]+t[1])/2],u0=new Set(["الوجه","البشرة","مكياج","عناية","ذكاء"]),h0=["faceSlim","vshape","jaw","chin","forehead","nose","noseW","eyes","lips","dchin","smile","cheekbones","browLift","symmetry"];function It(a,t){if(!a.poses?.length)return a.pose?{P:a.pose,vis:a.poseVis??a.pose.map(()=>1)}:null;const i=a.faces[Math.min(t,a.faces.length-1)];let e=0;if(i&&a.poses.length>1){const o=[(i[234][0]+i[454][0])/2,(i[10][1]+i[152][1])/2];let n=1/0;a.poses.forEach((r,s)=>{const l=Math.hypot(r[0][0]-o[0],r[0][1]-o[1]);l<n&&(n=l,e=s)})}return{P:a.poses[e],vis:a.posesVis?.[e]??a.poses[e].map(()=>1)}}function m0(a,t,i=0){if(!t)return null;const e=Ct.find(o=>o.id===a);if(!e||a==="reshape")return null;if(u0.has(e.group)){if(t.faces.length){const n=t.faceInfo?.[Math.min(i,t.faces.length-1)],r=["smooth","even","bright","warm","autoBeauty","blemish","matte"].includes(a),s=h0.includes(a);return n&&n.far&&s?"الوجه جانبي، وتعديل شكله يعوّج الملامح، فطفيته. أدوات البشرة والشعر والجسم تشتغل":n&&n.width<36&&!r?"الوجه صغير كلش بالصورة، فالملامح ما تبين بدقة. أدوات البشرة والجسم تشتغل":null}const o=t.scene?.face==="hidden"?"الوجه مغطى أو مو باين (يد، كبوس، راس منزّل، أو ظهر للكاميرا)":"ما لقيت وجه بالصورة";return["smooth","even","bright","warm"].includes(a)&&t.seg?null:o}if(e.group==="الشعر"||e.group==="الخلفية")return t.seg?null:"ما گدرت أفصل الشخص عن الخلفية";if(e.group==="الإضاءة")return t.seg?t.faces.length?null:"الضوء يحتاج وجه باين حتى يعرف شكله":"ما گدرت أفصل الشخص عن الخلفية";if(e.group==="الجسم"){const o=It(t,i);if(!o||!t.seg)return"ما لقيت جسم واضح";const n=Wt(o.P,o.vis,t.scene?.turned??0),r="الجسم مايل أو مستلقي، وهاي الأداة تحتاج جسم واقف أو جالس معتدل";switch(a){case"bodySlim":case"waist":return n.upright?n.upper&&n.hips?null:"الخصر يحتاج الأكتاف والورك ظاهرين بالصورة":r;case"hips":return n.upright?n.hips?null:"الورك مو ظاهر بالصورة":r;case"shoulders":return n.upright?n.upper?null:"الأكتاف مو ظاهرة بالصورة":r;case"arms":return n.arms?null:"الذراعين مو ظاهرة بالصورة";case"legs":return n.legs?null:"الساقين مو ظاهرة بالصورة";case"height":return n.standing?null:"الطول يشتغل بس إذا الشخص واقف وكامل بالصورة"}}return null}function f0(a,t){return a?Math.atan2(a[10][1]-a[152][1],(a[10][0]-a[152][0])*t):-Math.PI/2}function d0(a,t,i,e){const o=a.v.autoBeauty??0,n=a.gender==="m"?r0:n0,r=new Map,s=m=>m==="reshape"?0:(r.has(m)||r.set(m,!!m0(m,t,a.face)),r.get(m)?0:(a.v[m]??0)+o*(n[m]??0));if(!(a.liq.length>0||Object.entries(a.v).some(([m,w])=>m!=="reshape"&&Math.abs(w)>.004))||!t)return null;const c=t.w/t.h,h=m=>[m[0]*c,m[1]],b=[],F=t.faces[Math.min(a.face,t.faces.length-1)];let E=.25,M=null,A=null;if(F){const m=k=>F[k];E=c0(l0(h(m(Et.chin)),h(m(Et.forehead))));const w=t.faceInfo?.[Math.min(a.face,t.faces.length-1)]?.far??null;M={slim:s("faceSlim"),vshape:s("vshape"),jaw:s("jaw"),chin:s("chin"),forehead:s("forehead"),nose:s("nose"),noseW:s("noseW"),eyes:s("eyes"),lips:s("lips"),dchin:s("dchin"),smile:s("smile"),cheekbones:s("cheekbones"),browLift:s("browLift"),symmetry:s("symmetry")},A=w==="l"||w==="r"?w:null}let L=[0,0];const g=It(t,a.face),x=g?.P??null;let d=null;if(x&&t.seg){const m=Bt(x[11],x[12]),w=Bt(x[23],x[24]),k=Math.abs(w[1]-m[1])||.2;d={slim:s("bodySlim"),waist:s("waist"),hips:s("hips"),shoulders:s("shoulders"),arms:s("arms"),legs:s("legs"),tight:a.lock},s("height")&&(L=[Math.min(.95,w[1]+k*.1),.28*s("height")])}const v=F?s("hairVol"):0,y=JSON.stringify([d,M,A,v])+"|"+a.face+"|"+e+"|"+t.w+"x"+t.h;if(y!==yt){yt=y;let m=null;if(d&&x)for(let w=1,k=0;k<6;k++,w*=.8){const u={...d,slim:d.slim*w,waist:d.waist*w,hips:d.hips*w,shoulders:d.shoulders*w,arms:d.arms*w,legs:d.legs*w};if(m=Zt(t,x,g.vis,u),!m)break;const f=m.w*m.h,R=new Float32Array(f),T=new Float32Array(f);for(let _=0;_<f;_++)R[_]=m.data[_*2]*m.w,T[_]=m.data[_*2+1]*m.h;const[U,H]=mt(R,T,m.w,m.h);if(U>=.72&&H<=1.4)break}if(F&&M&&Object.values(M).some(w=>Math.abs(w)>.004)){const w=Math.min(1,640/Math.max(t.w,t.h)),k=m?.w??Math.max(2,Math.round(t.w*w)),u=m?.h??Math.max(2,Math.round(t.h*w)),f=new Float32Array(k*u),R=new Float32Array(k*u),T=t.seg,U=t.segW,H=t.segH;o0(F,k,u,M,A,f,R,T?(X,re,Y)=>{let ee=0,V=0;for(const[fe,ye]of[[0,0],[1.5,0],[-1.5,0],[0,1.5],[0,-1.5]]){const me=Math.min(U-1,Math.max(0,Math.floor((X+fe)/k*U))),W=Math.min(H-1,Math.max(0,Math.floor((re+ye)/u*H)))*U+me;ee+=Y?T[2][W]+T[4][W]+T[5][W]:T[4][W]+T[5][W],V++}return i0(.35,.75,ee/V)}:void 0);const q=m?.data??new Float32Array(k*u*2);for(let X=0;X<k*u;X++)q[X*2]+=f[X]/k,q[X*2+1]+=R[X]/u;m={w:k,h:u,data:q}}if(F&&v>.004){const w=Math.min(1,640/Math.max(t.w,t.h)),k=m?.w??Math.max(2,Math.round(t.w*w)),u=m?.h??Math.max(2,Math.round(t.h*w));for(let f=1,R=0;R<5;R++,f*=.75){const T=new Float32Array(k*u),U=new Float32Array(k*u);if(!e0(t,F,k,u,v*f,T,U))break;const[H,_]=mt(T,U,k,u);if(H>=.45&&_<=1.9||R===4){const q=m?.data??new Float32Array(k*u*2);for(let X=0;X<k*u;X++)q[X*2]+=T[X]/k,q[X*2+1]+=U[X]/u;m={w:k,h:u,data:q};break}}}Mt=m,kt++}for(const[m,w,k,u,f]of a.liq)b.push({c:[m,w],r:k,type:1,v:[u,f],s:0,lock:!1});const P=Math.min(64,b.length),N=new Float32Array(256),I=new Float32Array(256),D=b.length-P;for(let m=0;m<P;m++){const w=b[D+m],k=Math.hypot(w.v[0]*c,w.v[1]),u=w.r*.45;w.type===1&&k>u&&(w.v=[w.v[0]*u/k,w.v[1]*u/k]),w.type===0&&(w.s=Math.max(-.45,Math.min(.6,w.s))),N.set([w.c[0],w.c[1],Math.max(.005,w.r),w.type],m*4),I.set([w.v[0],w.v[1],w.s,w.face?2:w.lock?1:0],m*4)}const C=a.bg==="transparent"?[1,1,1,0]:[...Ge(a.bg),1],S=m=>a.gender==="m"&&(m==="smooth"||m==="even")?.6:1;return{n:P,opA:N,opB:I,lock:a.lock?1:0,b:[s("smooth")*S("smooth"),s("even")*S("even"),s("bright"),s("warm"),s("undereye"),s("teeth"),s("eyeGlow"),s("lipstick"),s("blush"),s("shadow"),Math.max(s("brows"),s("browsM")),s("beard"),s("hairColor"),s("hairShine"),s("bgBlur"),s("bgSwap"),s("contour"),s("highlight"),s("liner"),s("lens"),s("hairFill"),s("blemish"),s("matte"),s("bgPop"),s("bgLight"),s("bgSat"),s("bgTint"),s("subjLight"),s("bgKill")],b2:[s("eyeWhite"),s("redEye"),s("catchlight"),s("wrinkles"),s("freckles"),s("tan"),s("greyCover"),s("hairline"),s("studio"),s("sideLight"),s("sculpt"),f0(F,c)],eyes:i?.eyes?.map((m,w)=>A==="r"&&w===0||A==="l"&&w===1?{...m,vis:0}:m),field:Mt,fieldVersion:kt,lip:Ge(a.lip),blush:Ge(a.blush),shadow:Ge(a.shadow),hair:Ge(a.hair),bg:C,lens:Ge(a.lens??"#5a86b8"),bgT:Ge(a.bgT??"#2a6cff"),bgOff:Array.from({length:8},(m,w)=>a.bgOff?.includes(w)?1:0),stretch:L,skinR:E*.022,bgBlur:.035,masksVersion:e,masks:i}}const g0=[{id:"glow",name:"توهج",icon:"Sun",variants:["أبيض","دافي"],hint:"الأضواء تنتشر بنعومة مثل عدسة سينما"},{id:"halation",name:"هالة فيلم",icon:"CircleDot",hint:"حافة حمرة دافية حول الأضواء، مثل فيلم الكاميرات القديمة"},{id:"haze",name:"ضباب حالم",icon:"Haze",variants:["أبيض","دافي","بارد"],hint:"نعومة وضباب خفيف مثل صور الصبح"},{id:"dust",name:"غبار ضوء",icon:"Sparkles",hint:"ذرات غبار صغيرة تلمع بالضوء"},{id:"orbs",name:"كرات ضوء",icon:"CircleDashed",variants:["ذهبي","مدينة","وردي","أزرق"],hint:"أضواء بعيدة مضببة (بوكيه)"},{id:"rain",name:"مطر",icon:"CloudRain",variants:["خفيف","غزير"],hint:"خيوط مطر وجو مبلل"},{id:"leak",name:"تسريب ضوء",icon:"Flame",variants:["دافي","أحمر","وردي","ألوان"],hint:"ضوء يدخل من طرف الفيلم"},{id:"blinds",name:"ظل الشباك",icon:"Blinds",variants:["ستارة","أوراق","شباك"],hint:"شمس داخلة من شباك وترسم ظل"},{id:"caustic",name:"ضوء الماي",icon:"Waves",hint:"انعكاس ضوء الماي على الوجه والجسم"},{id:"flare",name:"شمس",icon:"SunMedium",variants:["يمين","يسار"],hint:"شمس داخلة للعدسة"},{id:"prism",name:"انكسار",icon:"Triangle",hint:"ألوان تنفصل على الأطراف مثل عدسة قديمة"}],$e=12,X0=[{name:"أحمر",h:0,css:"#e5484d"},{name:"برتقالي",h:30,css:"#f08c3a"},{name:"أصفر",h:60,css:"#e9c949"},{name:"أخضر",h:120,css:"#4cb86a"},{name:"سماوي",h:180,css:"#3fc1c9"},{name:"أزرق",h:225,css:"#3f78e0"},{name:"بنفسجي",h:275,css:"#8b5cf6"},{name:"وردي",h:320,css:"#e04fa8"}],Ut=()=>({e:new Array($e).fill(0),v:new Array($e).fill(0),seed:.37,hsl:new Array(24).fill(0),grade:[.58,0,.1,0,.09,0,0,0,0,.4]}),p0=a=>g0.findIndex(t=>t.id===a);function Rt(a){return a?{effects:a.e.some(t=>t>.004),mix:a.hsl.some(t=>Math.abs(t)>.004),grade:a.grade[1]>.004||a.grade[3]>.004||a.grade[5]>.004||a.grade[8]>.004}:{effects:!1,mix:!1,grade:!1}}function Ot(a,t,i){const e=a??Ut(),o=new Float32Array($e),n=new Float32Array($e);for(let r=0;r<$e;r++)o[r]=e.e[r]??0,n[r]=e.v[r]??0;if(t)for(const[r,s]of Object.entries(t)){const l=p0(r);if(l<0||s==null)continue;const[c,h]=Array.isArray(s)?s:[s,0];o[l]<.004&&(n[l]=h),o[l]=Math.min(1,o[l]+c*i)}return{e:o,v:n,seed:e.seed,hsl:new Float32Array(e.hsl),grade:new Float32Array(e.grade),on:o.some(r=>r>.004)||Rt(e).mix||Rt(e).grade}}function x0(a){return Math.max(a[0],a[1],a[2],a[10])>.004?.045:0}const Ue=["exposure","brightness","contrast","highlights","shadows","whites","blacks","saturation","vibrance","temperature","tint","fade","clarity","sharpness","vignette","grain","split","bw","texture","dehaze","noise","noiseColor"],v0=new Set(["sharpness","grain","bw","split","noise","noiseColor"]),ft=()=>Object.fromEntries(Ue.map(a=>[a,0])),at=()=>[[0,0],[1,1]],b0=()=>({rgb:at(),r:at(),g:at(),b:at()}),Ze=()=>({params:ft(),curves:b0(),filterId:null,filterAmount:1,crop:{x:0,y:0,w:1,h:1},ratio:"free",rot:0,flip:!1,auto:!1,autoAmt:1,beauty:s0(),fx:Ut(),ov:[]}),De=a=>JSON.parse(JSON.stringify(a));function V0(a){const t=Ze();return t.crop={...a.crop},t.ratio=a.ratio,t.rot=a.rot,t.flip=a.flip,t.src=0,t}function W0(a){return a.length===2&&a[0][0]===0&&a[0][1]===0&&a[1][0]===1&&a[1][1]===1}class Y0{stack=[];labels=[];thumbs=[];i=-1;push(t,i="",e=null){const o=JSON.stringify(t);return this.stack[this.i]===o?!1:(this.stack=this.stack.slice(0,this.i+1),this.labels=this.labels.slice(0,this.i+1),this.thumbs=this.thumbs.slice(0,this.i+1),this.stack.push(o),this.labels.push(i),this.thumbs.push(e),this.stack.length>80&&(this.stack.shift(),this.labels.shift(),this.thumbs.shift()),this.i=this.stack.length-1,!0)}undo(){return this.i<=0?null:JSON.parse(this.stack[--this.i])}redo(){return this.i>=this.stack.length-1?null:JSON.parse(this.stack[++this.i])}goto(t){return t<0||t>=this.stack.length||t===this.i?null:(this.i=t,JSON.parse(this.stack[t]))}peek(t){return t>=0&&t<this.stack.length?JSON.parse(this.stack[t]):null}get steps(){return this.stack.map((t,i)=>({label:this.labels[i],thumb:this.thumbs[i]}))}get index(){return this.i}get last(){return this.i>=0?JSON.parse(this.stack[this.i]):null}setThumb(t,i){t>=0&&t<this.thumbs.length&&(this.thumbs[t]=i)}get canUndo(){return this.i>0}get canRedo(){return this.i<this.stack.length-1}reset(t,i=null){this.stack=[JSON.stringify(t)],this.labels=["الأصلية"],this.thumbs=[i],this.i=0}}const we=(a,t=0,i=1)=>a<t?t:a>i?i:a,Ee=(a,t,i)=>{const e=we((i-a)/(t-a));return e*e*(3-2*e)},Ve=(a,t,i)=>.2126*a+.7152*t+.0722*i;function ot(a,t,i){const e=Math.min(Math.abs(a-t),360-Math.abs(a-t)),o=Math.max(0,1-e/i);return o*o*(3-2*o)}function St(a,t,i){const e=Math.max(a,t,i),o=Math.min(a,t,i),n=(e+o)/2,r=e-o;if(r<1e-6)return[0,0,n];const s=r/(1-Math.abs(2*n-1)+1e-6);return[((e===a?(t-i)/r%6:e===t?(i-a)/r+2:(a-t)/r+4)*60+360)%360,we(s),n]}function ct(a,t,i){a=(a%360+360)%360;const e=(1-Math.abs(2*i-1))*t,o=e*(1-Math.abs(a/60%2-1)),n=i-e/2,[r,s,l]=a<60?[e,o,0]:a<120?[o,e,0]:a<180?[0,e,o]:a<240?[0,o,e]:a<300?[o,0,e]:[e,0,o];return[r+n,s+n,l+n]}function At(a,t){let i=we(a);t.crush&&(i=i*(1-t.crush*(1-Ee(0,.35,i))*.6)),t.gamma&&(i=Math.pow(i,Math.pow(2,-t.gamma)));const e=t.con??0;if(e>0){const s=1+e*5,l=c=>1/(1+Math.exp(-s*(c-.42)));i=(l(i)-l(0))/(l(1)-l(0))}else e<0&&(i=i+(.45-i)*-e*.6*(1-Math.abs(2*i-1)*.3));const o=t.toe??0,n=t.cap??1;return i=i<.8?i:.8+(1-Math.exp(-(i-.8)*5))*.2/(1-Math.exp(-1)),o+(n-o)*i}function w0(a,t,i,e){let[o,n,r]=St(a,t,i);const s=ot(o,24,26)*Ee(.08,.25,n)*(1-Ee(.55,.85,n))*Ee(.12,.3,r)*(1-Ee(.8,.95,r));{let D=0,C=1,S=0;const m=[[108,52,-18,(e.greens??.6)/Math.max(1,e.sat??1)**1.5,-.08],...e.hue??[]];for(const[w,k,u,f,R]of m){const T=ot(o,w,k)*Ee(.04,.2,n);D+=u*T,C*=1+(f-1)*T,S+=R*T*n}o+=D,n=we(n*C),r=we(r+S*.3)}let[l,c,h]=ct(o,n,r);const b=Ve(l,c,h),F=1-Ee(.05,.45,b),E=Ee(.55,.95,b),M=(e.sat??1)*(1+((e.satSh??1)-1)*F)*(1+((e.satHi??1)-1)*E);if(l=b+(l-b)*M,c=b+(c-b)*M,h=b+(h-b)*M,M>1){const D=1-(M-1)*.12*n;l*=D,c*=D,h*=D}if(e.mono){const D=e.mixR??[.2126,.7152,.0722],C=we(l*D[0]+c*D[1]+h*D[2]);let S=e.mono;e.keep&&(S*=1-ot(o,e.keep[0],e.keep[1])*Ee(.15,.4,n)),l+=(C-l)*S,c+=(C-c)*S,h+=(C-h)*S}const A=Math.max(1e-4,Ve(l,c,h)),L=At(A,e),g=L/A,x=D=>.6*(D*g)+.4*At(D,e);l=x(l),c=x(c),h=x(h);const d=we(L),v=Math.pow(1-Ee(0,.55,d),1.5),y=Ee(.45,1,d),P=Math.max(0,1-v-y),N=(D,C)=>{D&&(l+=D[0]*C,c+=D[1]*C,h+=D[2]*C)};N(e.sh,v),N(e.mid,P),N(e.hi,y);const I=(D,C)=>{if(!D||C<=0)return;const[S,m]=D,w=Ve(l,c,h),k=Math.max(.05,Ve(S[0],S[1],S[2])),u=m*C;l+=(w*S[0]/k-l)*u,c+=(w*S[1]/k-c)*u,h+=(w*S[2]/k-h)*u};if(I(e.gelSh,v),I(e.gelMid,P),I(e.gelHi,y),e.skin&&s>0){const D=Ve(l,c,h),[C,S,m]=ct(24+(o-24)*.5,we(Math.min(n,.55)*Math.min(1.1,e.sat??1)),.5),w=Ve(C,S,m),k=e.skinWarm??0,u=[D+(C-w)*(1+k),D+(S-w),D+(m-w)*(1-k*.5)],f=e.skin*s*(e.mono?0:1);l+=(u[0]-l)*f,c+=(u[1]-c)*f,h+=(u[2]-h)*f}if((e.greens??.6)<1){const[D,C,S]=St(we(l),we(c),we(h)),m=ot(D,105,48)*Ee(.35,.8,C);m>0&&([l,c,h]=ct(D-8*m,C+(Math.min(C,.42)-C)*m,S*(1-.12*m)))}return[we(l),we(c),we(h)]}const y0=[{id:"nightcall",name:"نايت كول",ref:1,def:{crush:.5,gamma:-.8,con:.4,sat:.75,gelMid:[[1,.62,.32],.45],gelHi:[[1,.8,.55],.4],sh:[.012,.004,-.01],skin:.25}},{id:"dust",name:"غبار السينما",ref:2,def:{toe:.12,cap:.86,gamma:-.25,con:.3,sat:.6,sh:[-.06,.02,.012],mid:[.01,.005,-.04],hi:[.05,0,-.07],hue:[[0,30,0,1.4,0]],skin:.4}},{id:"redroom",name:"غرفة حمراء",ref:3,def:{crush:.4,gamma:-.6,con:.4,sat:1.1,gelSh:[[.3,.22,.4],.45],gelMid:[[1,.15,.18],.8],gelHi:[[1,.55,.5],.4],greens:.4}},{id:"lowkey",name:"ظل",ref:4,def:{toe:.03,cap:.78,gamma:-.9,con:.3,sat:.35,gelSh:[[.35,.5,.48],.35],mid:[-.01,.006,0],skin:.5,greens:.5}},{id:"nightflash",name:"فلاش الليل",ref:5,def:{crush:1,gamma:-.6,con:.75,sat:.55,gelSh:[[.35,.45,.7],.3],gelHi:[[1,.94,.86],.3],skin:.4,greens:.5}},{id:"neonrain",name:"مطر النيون",ref:6,def:{toe:.15,gamma:-.15,con:.25,sat:1.1,gelSh:[[.8,.4,.9],.32],gelMid:[[1,.85,.45],.5],gelHi:[[1,.95,.65],.35],hue:[[330,40,0,1.3,0]],skin:.2}},{id:"redcyan",name:"أحمر وسماوي",ref:7,def:{gamma:-.45,con:.5,sat:1.2,gelSh:[[.9,.05,.1],.65],gelMid:[[1,.15,.18],.55],gelHi:[[.5,.95,1],.65],greens:.4}},{id:"tealfilm",name:"فيلم تيل",ref:8,def:{toe:.11,cap:.86,con:.2,sat:.62,sh:[-.02,.012,.004],mid:[-.06,.025,-.005],hi:[-.05,.02,-.02],hue:[[110,50,40,.8,0],[0,30,0,.95,0]],skin:.5}},{id:"amber",name:"شباك العصر",ref:9,def:{crush:.45,gamma:-.45,con:.45,sat:1.05,sh:[0,.004,-.004],gelMid:[[1,.52,.18],.45],gelHi:[[1,.78,.5],.3],skinWarm:.1,greens:.5}},{id:"fire",name:"نار",ref:10,def:{gamma:-.3,con:.5,sat:1.25,gelMid:[[1,.42,.08],.5],gelHi:[[1,.62,.25],.4],sh:[-.02,.01,.02],greens:.45}},{id:"tealorange",name:"برتقالي وتيل",ref:11,def:{crush:.3,gamma:-.15,con:.5,sat:1.15,gelSh:[[.1,.55,.65],.4],gelHi:[[1,.72,.42],.3],hue:[[215,60,-8,1.12,0],[30,30,0,1.3,0],[110,50,50,.8,0]],skin:.55}},{id:"homewarm",name:"دفء البيت",ref:12,def:{toe:.08,cap:.9,gamma:.05,con:-.12,sat:.95,gelMid:[[1,.7,.48],.42],gelHi:[[1,.86,.68],.32],sh:[.02,-.01,.015],skin:.25}},{id:"gypsy",name:"غجري",ref:13,def:{crush:.6,gamma:-.4,con:.35,sat:.9,gelSh:[[.4,.55,.4],.38],gelMid:[[1,.7,.45],.36],skin:.3}},{id:"street",name:"شارع حي",ref:14,def:{crush:.35,gamma:-.2,con:.7,sat:.7,gelSh:[[.45,.55,.65],.35],hi:[.03,.01,-.03],hue:[[0,30,0,1.4,0]],skin:.45}},{id:"polaroid70",name:"بولارويد ٧٠",ref:15,def:{toe:.15,cap:.87,gamma:-.1,con:.35,sat:.55,gelSh:[[.35,.55,.45],.4],gelMid:[[1,.78,.5],.3],gelHi:[[1,.92,.7],.3]}},{id:"grit",name:"خشن",ref:16,def:{toe:.05,cap:.97,con:.75,sat:.4,mono:.65,mid:[.02,0,-.02],skin:.2}},{id:"goldenblue",name:"شمس وظل",ref:17,def:{gamma:-.4,con:.4,sat:.85,gelSh:[[.3,.5,1],.45],gelHi:[[1,.8,.45],.45],skin:.35}},{id:"dusk",name:"شفق",ref:18,def:{gamma:-.35,con:.35,sat:1.2,gelSh:[[.5,.3,1],.42],gelHi:[[1,.55,.3],.45],mid:[.04,-.02,0]}},{id:"beige",name:"بيج",ref:19,def:{toe:.15,cap:.86,gamma:.12,con:-.2,sat:.45,gelMid:[[1,.86,.68],.4],gelHi:[[1,.95,.85],.3],skin:.4}},{id:"honeyhalo",name:"عسل غامق",ref:20,def:{crush:.45,gamma:-.5,con:.4,sat:1,gelMid:[[1,.55,.25],.5],gelHi:[[1,.8,.55],.3],greens:.5}},{id:"storm",name:"عاصفة ذهبية",ref:21,def:{gamma:-.4,con:.6,sat:1.1,gelSh:[[.25,.45,.9],.42],gelHi:[[1,.7,.35],.5],skin:.3}},{id:"bluelight",name:"ضوء أزرق",ref:22,def:{gamma:-.35,con:.45,sat:.9,sh:[-.01,0,.02],gelMid:[[.4,.82,1],.45],gelHi:[[.6,.92,1],.45]}},{id:"bluenight",name:"ليل أزرق",ref:23,def:{gamma:-.5,con:.3,sat:1.25,sh:[0,-.01,.08],mid:[-.06,-.01,.12],hi:[-.06,.02,.04]}},{id:"morning",name:"حلم الصبح",ref:24,def:{toe:.15,gamma:.1,con:-.08,sat:.8,gelMid:[[1,.82,.6],.3],gelHi:[[1,.88,.62],.38],skin:.3}},{id:"frappe",name:"كراميل فرابيه",ref:25,def:{toe:.08,cap:.93,gamma:.12,con:-.12,sat:.75,gelMid:[[1,.8,.74],.32],gelHi:[[1,.88,.8],.32],hue:[[0,30,0,.9,0]],skin:.4,skinWarm:.1}},{id:"coffee",name:"قهوة",ref:27,def:{crush:.7,gamma:-.8,cap:.85,con:.4,sat:.8,gelMid:[[1,.66,.42],.42],gelHi:[[1,.8,.6],.3]}},{id:"velvet",name:"مخمل",ref:28,def:{toe:.08,cap:.86,gamma:-.35,con:.35,sat:.95,gelSh:[[.18,.5,.46],.5],mid:[.08,-.02,-.07],hue:[[0,30,-5,1.5,0],[120,60,50,.8,-.1]]}}],Qe=[[0,0],[1,1]],Ce=(a=Qe,t=Qe,i=Qe,e=Qe)=>({rgb:a,r:t,g:i,b:e}),ut=(a=.06)=>[[0,0],[.25,.25-a],[.75,.75+a],[1,1]],We=(a=.08,t=.95)=>[[0,a],[.25,.25+a*.4],[.75,.76],[1,t]],_t=a=>{let t="";for(let i=0;i<a.length;i+=32768)t+=String.fromCharCode(...a.subarray(i,i+32768));return btoa(t)};function M0(a){const t=atob(a.d),i=new Uint8Array(t.length);for(let e=0;e<t.length;e++)i[e]=t.charCodeAt(e);return i}function Ht(a,t){const i=new Uint8Array(a*a*a*3),e=a*a;for(let o=0;o<a;o++)for(let n=0;n<a;n++)for(let r=0;r<a;r++){const s=t(r/(a-1),n/(a-1),o/(a-1)),l=(n*e+o*a+r)*3;for(let c=0;c<3;c++)i[l+c]=Math.round(Math.max(0,Math.min(1,s[c]))*255)}return{n:a,d:_t(i)}}const k0=(a,t,i)=>.3*a+.59*t+.11*i;function T0(a,t,i){const e=Math.max(a,t,i),o=Math.min(a,t,i),n=(e+o)/2,r=e-o;if(r<1e-6)return[0,0,n];const s=r/(1-Math.abs(2*n-1));return[((e===a?(t-i)/r%6:e===t?(i-a)/r+2:(a-t)/r+4)*60+360)%360,s,n]}function Se(a,t,i){const e=(1-Math.abs(2*i-1))*t,o=e*(1-Math.abs(a/60%2-1)),n=i-e/2,[r,s,l]=a<60?[e,o,0]:a<120?[o,e,0]:a<180?[0,e,o]:a<240?[0,o,e]:a<300?[o,0,e]:[e,0,o];return[r+n,s+n,l+n]}const K=(a,t,i)=>{const e=Math.min(Math.abs(a-t),360-Math.abs(a-t));return Math.max(0,1-e/i)},O=(a,t)=>a+t*(a-a*a)*(2*a-1);function ie(a){if(!(typeof btoa>"u"))return Ht(25,(t,i,e)=>{let[o,n,r]=T0(t,i,e);const s=k0(t,i,e);if(a==="teal"){const g=K(o,28,30);o=o+(30-o)*g*.4,n=n*(1+.25*g);const x=Math.max(K(o,200,80),K(o,120,50))*(1-g);o=o+(190-o)*x*.5;let[d,v,y]=Se(o,Math.min(1,n),r);const P=1-Math.min(1,s*2),N=Math.max(0,s*2-1);return d+=-.04*P+.05*N,v+=.02*P+.015*N,y+=.05*P-.04*N,[O(d,.25),O(v,.25),O(y,.25)]}if(a==="warmfilm"){let[x,d,v]=Se(o,n*(1-.3*K(o,110,60))*.95,r);return x=.05+(1-.05)*O(x,.3)+.03*s,d=.05*.9+(1-.05)*O(d,.3)+.01*s,v=.05*1.1+(1-.05)*O(v,.3)*.92,[x,d,v]}if(a==="olive"){const g=K(o,110,60);o=o+(75-o)*g*.6,n=n*(1-.45*g);const x=K(o,215,50);n=n*(1-.2*x),r=r*(1-.08*x);const[d,v,y]=Se(o,n,r);return[O(d,.2)+.015,O(v,.2)+.01,O(y,.2)-.01]}if(a==="bleach"){const x=t+(s-t)*.55,d=i+(s-i)*.55,v=e+(s-e)*.55;return[O(x,.55),O(d,.55),O(v,.55)]}const l=Math.max(0,1-s*2),c=Math.max(0,s*2-1),h=1-l-c,b=K(o,25,22)*Math.min(1,n*3);if(a==="sodium"){const g=O(s,.35),x=g<.5?[.05+g*2*.72,.03+g*2*.36,.02+g*2*.07]:[.77+(g-.5)*2*.23,.39+(g-.5)*2*.47,.09+(g-.5)*2*.43],d=.72;return[t+(x[0]-t)*d,i+(x[1]-i)*d,e+(x[2]-e)*d]}if(a==="sunsetgold"){const g=K(o,30,40);o=o+(32-o)*g*.4,n=Math.min(1,n*(1+.35*g));const x=Math.max(K(o,205,70),K(o,150,45))*(1-g);o=o+(188-o)*x*.6,n=Math.min(1,n*(1+.15*x));let[d,v,y]=Se(o,n,r);return d+=-.06*l+.09*c+.02*h,v+=.025*l+.04*c,y+=.07*l-.08*c-.02*h,[O(d,.35),O(v,.35),O(y,.35)]}if(a==="neon"){const g=K(o,355,40)*(1-b*.7),x=K(o,220,70),d=K(o,110,50);o=o+((o>180?330:-30)-o)*g*.35,o=o+(195-o)*x*.4,n=Math.min(1,n*(1+.45*(1-b*.6))*(1-.4*d));let[v,y,P]=Se((o+360)%360,n,r);return v+=.04*l+.05*c,y-=.03*l-0*c,P+=.1*l+.04*c,[O(v,.45)-.01,O(y,.45)-.01,O(P,.45)]}if(a==="sepia"){const g=O(s,.25),x=.07,v=x+(.93-x)*g,y=.15,P=[v*1.1+.02,v*.96+.01,v*.76];return[P[0]+(t-s)*y,P[1]+(i-s)*y,P[2]+(e-s)*y]}if(a==="redteal"){const g=Math.max(K(o,5,30),K(o,355,30))*(1-b*.5);n=Math.min(1,n*(1+.45*g));const x=K(o,45,35)*(1-g);o=o+(28-o)*x*.5,n=n*(1-.15*x);const d=(o>85&&o<290?1:0)*Math.min(1,n*4);o=o+(186-o)*d*.7;let[v,y,P]=Se(o,Math.min(1,n),r);return v+=-.05*l,y+=.03*l,P+=.05*l,[O(v,.3),O(y,.3),O(P,.3)]}if(a==="dusk"){let[d,v,y]=Se(o,n*.85,r);return d=.09+.02+(.95-.09)*O(d,.12)+.035*h,v=.09+(.95-.09-.02)*O(v,.12)+.005*h,y=.09+.01+(.95-.09-.05)*O(y,.12),[d,v,y]}if(a==="rainnight"){const g=K(o,215,60);n=n*(1-.45*g);const x=K(o,100,60);o=o+(85-o)*x*.4;let[d,v,y]=Se(o,n*.9,r);return d+=-.03*l+.06*c,v+=.03*l+.045*c,y+=.005*l-.06*c,[O(d,.3)+.01,O(v,.3)+.012,O(y,.3)]}const F=g=>[s+(t-s)*g,s+(i-s)*g,s+(e-s)*g];if(a==="keepred"){const g=Math.max(K(o,355,28),K(o,5,22))*Math.min(1,Math.max(0,n-.25)*2.5),x=Math.min(1,g*1.3+b*.12),[d,v,y]=F(x);return[O(d,.25),O(v,.25),O(y,.25)]}if(a==="keepwarm"){const g=Math.max(K(o,30,45),K(o,355,25))*Math.min(1,n*3),[x,d,v]=F(Math.min(1,g*1.15));return[O(x,.22)+.01,O(d,.22),O(v,.22)-.01]}if(a==="redlight"){const g=O(s,.3),x=[Math.min(1,g*1.35+.02),g*.38,g*.4],d=.5*Math.min(1,s*2.2),v=.03+t*.5,y=.05+i*.55,P=.07+e*.6;return[v+(x[0]-v)*d,y+(x[1]-y)*d,P+(x[2]-P)*d]}if(a==="moody"){const[g,x,d]=F(.4+b*.35),v=g-.04*l+.02*c,y=x+.015*l+.01*c,P=d+.01*l-.02*c;return[O(v,.4)*.94,O(y,.4)*.94,O(P,.4)*.94]}if(a==="caramel"){const g=Math.max(K(o,355,25),K(o,10,20)),x=K(o,210,70);n=n*(.8+.3*g)*(1-.65*x);let[d,v,y]=Se((o+360)%360,Math.min(1,n),r);const P=.07;return d=P+.02+(.95-P)*O(d,.25)+.04*h,v=P+(.93-P)*O(v,.25)+.015*h,y=P-.01+(.86-P)*O(y,.25),[d,v,y]}if(a==="violet"){const[g,x,d]=Se(o,n*.9,r),v=K(o,35,30)*c,y=g+.05*l+.02*h+.04*v,P=x-.03*l-.01*h,N=d+.1*l+.03*h-.05*v;return[O(y,.35),O(P,.35),O(N,.35)]}const[E,M,A]=Se(o,Math.min(1,n*1.1),r),L=Math.max(0,s-.35);return[E+.06*L+.02,M+.03*L+.005,A-.05*L-.01]})}function J0(a){let t=0;const i=[];let e=[0,0,0],o=[1,1,1];for(const c of a.split(/\r?\n/)){const h=c.trim();if(!h||h.startsWith("#"))continue;const b=h.split(/\s+/);if(b[0]==="LUT_3D_SIZE"){t=parseInt(b[1],10);continue}if(b[0]==="DOMAIN_MIN"){e=b.slice(1,4).map(Number);continue}if(b[0]==="DOMAIN_MAX"){o=b.slice(1,4).map(Number);continue}/^[A-Z_]/.test(b[0])||b.length>=3&&i.push(+b[0],+b[1],+b[2])}if(!(t>=2&&t<=65)||i.length<t*t*t*3)return null;const n=Math.min(t,33),r=c=>Math.round(c*(t-1)/(n-1)),s=new Uint8Array(n*n*n*3),l=n*n;for(let c=0;c<n;c++)for(let h=0;h<n;h++)for(let b=0;b<n;b++){const F=(r(b)+r(h)*t+r(c)*t*t)*3,E=(h*l+c*n+b)*3;for(let M=0;M<3;M++)s[E+M]=Math.round(Math.max(0,Math.min(1,(i[F+M]-e[M])/(o[M]-e[M]||1)))*255)}return{n,d:_t(s)}}const K0=["سينما","أجواء","أساسي","احترافي","دافئ","بارد","سينمائي","ناعم","فيلم","أبيض وأسود"],it=[{id:"clear",name:"صافي",group:"أساسي",params:{contrast:.12,vibrance:.25,clarity:.15,sharpness:.15}},{id:"vivid",name:"حيوي",group:"أساسي",params:{contrast:.2,saturation:.18,vibrance:.35,shadows:.1},curves:Ce(ut(.04))},{id:"bright",name:"مشرق",group:"أساسي",params:{exposure:.15,brightness:.18,shadows:.25,highlights:-.2,vibrance:.15}},{id:"crisp",name:"حاد",group:"أساسي",params:{contrast:.3,clarity:.4,sharpness:.3,blacks:-.15}},{id:"deep",name:"عميق",group:"أساسي",params:{exposure:-.1,contrast:.25,saturation:.1,highlights:-.3,vignette:.25},curves:Ce(ut(.05))},{id:"warm",name:"دافئ",group:"دافئ",params:{temperature:.35,tint:.05,vibrance:.15,contrast:.05}},{id:"golden",name:"ذهبي",group:"دافئ",params:{temperature:.45,saturation:.05,highlights:-.15,fade:.1,split:.5},shadow:[.48,.45,.52],highlight:[.62,.54,.4]},{id:"sunset",name:"غروب",group:"دافئ",params:{temperature:.5,tint:.15,contrast:.15,saturation:.1,vignette:.2,split:.6},shadow:[.45,.42,.55],highlight:[.65,.5,.38]},{id:"honey",name:"عسلي",group:"دافئ",params:{temperature:.3,brightness:.1,fade:.15,vibrance:.1,split:.5},shadow:[.52,.47,.42],highlight:[.6,.55,.42]},{id:"desert",name:"صحراء",group:"دافئ",params:{temperature:.4,saturation:-.15,contrast:.1,fade:.12,split:.5},shadow:[.5,.46,.42],highlight:[.6,.53,.44]},{id:"cool",name:"بارد",group:"بارد",params:{temperature:-.35,tint:-.03,contrast:.08,vibrance:.1}},{id:"ocean",name:"بحر",group:"بارد",params:{temperature:-.3,saturation:.1,contrast:.12,split:.5},shadow:[.4,.5,.6],highlight:[.5,.55,.55]},{id:"frost",name:"صقيع",group:"بارد",params:{temperature:-.45,saturation:-.3,brightness:.12,fade:.15},curves:Ce(We(.05,.98))},{id:"night",name:"ليل",group:"بارد",params:{exposure:-.15,temperature:-.3,contrast:.2,vignette:.35,split:.6},shadow:[.38,.45,.62],highlight:[.52,.52,.5]},{id:"cinema",name:"سينمائي",group:"سينمائي",params:{contrast:.2,saturation:-.1,highlights:-.25,vignette:.25,split:.9},shadow:[.38,.52,.58],highlight:[.64,.54,.42],curves:Ce(ut(.05))},{id:"noir-teal",name:"ليلي",group:"سينمائي",params:{contrast:.25,saturation:-.25,exposure:-.1,split:1,vignette:.3},shadow:[.36,.5,.56],highlight:[.58,.54,.48]},{id:"formal",name:"رسمي",group:"سينمائي",params:{contrast:.18,saturation:-.2,clarity:.25,temperature:-.05,blacks:-.1}},{id:"street",name:"شارع",group:"سينمائي",params:{contrast:.3,saturation:-.3,clarity:.35,grain:.25,vignette:.2,fade:.08}},{id:"drama",name:"دراما",group:"سينمائي",params:{contrast:.35,highlights:-.4,shadows:-.15,saturation:-.15,clarity:.3,vignette:.4}},{id:"soft",name:"ناعم",group:"ناعم",params:{brightness:.12,contrast:-.15,highlights:-.15,clarity:-.25,vibrance:.1},curves:Ce(We(.04,1))},{id:"rose",name:"وردي",group:"ناعم",params:{tint:.25,temperature:.08,brightness:.12,fade:.1,split:.5},shadow:[.55,.47,.52],highlight:[.6,.5,.52]},{id:"bride",name:"عروس",group:"ناعم",params:{exposure:.15,brightness:.15,contrast:-.1,saturation:-.1,clarity:-.3,highlights:-.2,tint:.06},curves:Ce(We(.05,1))},{id:"evening",name:"سهرة",group:"ناعم",params:{exposure:-.05,tint:.12,temperature:.12,contrast:.12,vignette:.3,split:.6},shadow:[.5,.42,.55],highlight:[.62,.52,.48]},{id:"peach",name:"خوخي",group:"ناعم",params:{temperature:.2,tint:.12,brightness:.1,fade:.12,vibrance:.1}},{id:"film",name:"فيلم",group:"فيلم",params:{contrast:.08,saturation:-.1,grain:.3,fade:.15,split:.5},shadow:[.46,.5,.54],highlight:[.56,.53,.46],curves:Ce(We(.07,.96))},{id:"retro",name:"قديم",group:"فيلم",params:{temperature:.25,saturation:-.25,fade:.3,grain:.35,vignette:.3},curves:Ce(We(.1,.92),[[0,.04],[1,1]],Qe,[[0,0],[1,.9]])},{id:"polar",name:"بولارويد",group:"فيلم",params:{brightness:.1,contrast:-.05,fade:.2,tint:-.05,split:.6},shadow:[.44,.52,.52],highlight:[.58,.55,.46],curves:Ce(We(.08,.97))},{id:"lut-teal",name:"تركواز وبرتقالي",group:"احترافي",params:{},lut:ie("teal")},{id:"lut-kodak",name:"فيلم دافئ",group:"احترافي",params:{},lut:ie("warmfilm")},{id:"lut-olive",name:"زيتوني",group:"احترافي",params:{},lut:ie("olive")},{id:"lut-bleach",name:"باهت حاد",group:"احترافي",params:{},lut:ie("bleach")},{id:"lut-golden",name:"ساعة ذهبية",group:"احترافي",params:{},lut:ie("golden")},{id:"cine-keepred",name:"يبقى الأحمر",group:"سينمائي",params:{vignette:.2},lut:ie("keepred")},{id:"cine-keepwarm",name:"يبقى الدافي",group:"سينمائي",params:{vignette:.15},lut:ie("keepwarm")},{id:"cine-redlight",name:"ضوء أحمر",group:"سينمائي",params:{vignette:.35,grain:.1},lut:ie("redlight")},{id:"cine-post",name:"بوست سينمائي",group:"سينمائي",params:{saturation:-.3,contrast:.12,highlights:-.15,shadows:.08,fade:.06,temperature:.1,vignette:.35,grain:.15},lut:ie("moody")},{id:"cine-moody",name:"كئيب",group:"سينمائي",params:{vignette:.3,grain:.15,clarity:.1},lut:ie("moody")},{id:"cine-caramel",name:"كراميل",group:"سينمائي",params:{grain:.15,vignette:.15},lut:ie("caramel")},{id:"cine-violet",name:"ليل بنفسجي",group:"سينمائي",params:{vignette:.25},lut:ie("violet")},{id:"mood-sodium",name:"ضوء الشارع",group:"أجواء",params:{vignette:.3,grain:.12},lut:ie("sodium")},{id:"mood-sunset",name:"غروب ذهبي",group:"أجواء",params:{vignette:.15},lut:ie("sunsetgold")},{id:"mood-neon",name:"نيون الليل",group:"أجواء",params:{vignette:.2,clarity:.1},lut:ie("neon")},{id:"mood-sepia",name:"سيبيا قديم",group:"أجواء",params:{grain:.35,vignette:.3},lut:ie("sepia")},{id:"mood-redteal",name:"أحمر وتركواز",group:"أجواء",params:{vignette:.15},lut:ie("redteal")},{id:"mood-dusk",name:"غسق ناعم",group:"أجواء",params:{grain:.08},lut:ie("dusk")},{id:"mood-rain",name:"ليل ممطر",group:"أجواء",params:{vignette:.3,grain:.1},lut:ie("rainnight")},{id:"mono",name:"أبيض وأسود",group:"أبيض وأسود",params:{bw:1,contrast:.15}},{id:"mono-hi",name:"فحمي",group:"أبيض وأسود",params:{bw:1,contrast:.4,clarity:.3,blacks:-.2,vignette:.25}},{id:"mono-soft",name:"رمادي",group:"أبيض وأسود",params:{bw:1,contrast:-.1,fade:.25,grain:.15}}],Ft={nightcall:{p:{vignette:.3,grain:.18},fx:{halation:.25}},dust:{p:{vignette:.25,grain:.3},fx:{dust:.55,haze:[.15,2]}},redroom:{p:{vignette:.35,grain:.15},fx:{glow:.3,halation:.3}},lowkey:{p:{vignette:.35,grain:.15}},nightflash:{p:{vignette:.45,grain:.2,clarity:.1},fx:{glow:.35}},neonrain:{p:{vignette:.2,grain:.12},fx:{glow:[.35,1],orbs:[.45,1],rain:.4}},redcyan:{p:{vignette:.3,grain:.1},fx:{glow:.35,halation:.2}},tealfilm:{p:{vignette:.25,grain:.25},fx:{halation:.15}},amber:{p:{vignette:.35,grain:.15},fx:{glow:[.2,1],halation:.3}},fire:{p:{vignette:.3,grain:.12,clarity:.12},fx:{glow:[.3,1],halation:.35}},tealorange:{p:{vignette:.2,clarity:.15},fx:{glow:[.15,1]}},homewarm:{p:{grain:.12},fx:{glow:[.15,1],haze:[.12,1]}},gypsy:{p:{vignette:.35,grain:.25},fx:{halation:.2}},street:{p:{clarity:.15,vignette:.15,grain:.08}},polaroid70:{p:{vignette:.25,grain:.3},fx:{halation:.15,haze:[.12,1]}},grit:{p:{clarity:.3,vignette:.3,grain:.4}},goldenblue:{p:{vignette:.25,grain:.1},fx:{glow:[.2,1]}},dusk:{p:{vignette:.25,grain:.1},fx:{glow:[.25,1]}},beige:{p:{grain:.15},fx:{haze:[.15,1]}},honeyhalo:{p:{vignette:.3,grain:.18},fx:{glow:[.3,1],halation:.4}},storm:{p:{vignette:.3,clarity:.2},fx:{glow:[.2,1]}},bluelight:{p:{vignette:.35,grain:.15},fx:{glow:.25}},bluenight:{p:{vignette:.3,grain:.12},fx:{glow:.25}},morning:{p:{grain:.12},fx:{glow:[.3,1],haze:[.35,1],dust:.25}},frappe:{p:{grain:.1,clarity:-.1},fx:{glow:[.2,1],haze:[.2,1]}},coffee:{p:{vignette:.35,grain:.22},fx:{halation:.2}},velvet:{p:{vignette:.3,grain:.2},fx:{halation:.25}}},Lt=new Map;for(const a of y0){const t={id:`cine2-${a.id}`,name:a.name,group:"سينما",params:Ft[a.id]?.p??{},fx:Ft[a.id]?.fx,ref:a.ref};Object.defineProperty(t,"lut",{enumerable:!0,get(){let i=Lt.get(a.id);return!i&&typeof btoa<"u"&&(i=Ht(25,(e,o,n)=>w0(e,o,n,a.def)),Lt.set(a.id,i)),i}}),it.splice(it.findIndex(i=>i.group==="أساسي"),0,t)}const E0=new Set(["desert","ocean","crisp","honey","polar","lut-olive","cine-redlight"]),Q0=it.filter(a=>!E0.has(a.id)),jt="joji.customFilters.v1";function B0(){try{return JSON.parse(localStorage.getItem(jt)||"[]")}catch{return[]}}function $0(a){try{localStorage.setItem(jt,JSON.stringify(a))}catch{}}function dt(a){return a?it.find(t=>t.id===a)??B0().find(t=>t.id===a)??null:null}const R0=()=>!!globalThis.__jojiEdgeOff,ht=(a,t)=>t<3?a.TEXTURE3+t:t===3?a.TEXTURE7:t===4?a.TEXTURE9:a.TEXTURE14,S0=new Float32Array(Ue.length);class A0{canvas;gl;prog;tex;lutU;lutF;lut3=null;lut3Id="";u={};texW=0;texH=0;lastCurvesU="";masks=[];m6=null;masksVersion=-1;disp=null;dispVersion=-1;plate=null;plateV=-1;lastCurvesF="";maxTex;constructor(t,i=!1,e=!1){this.canvas=t??document.createElement("canvas");const o=this.canvas.getContext("webgl2",{alpha:e,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:i,powerPreference:"high-performance"});if(!o)throw new Error("webgl2");this.gl=o,this.maxTex=o.getParameter(o.MAX_TEXTURE_SIZE),this.prog=this.link(),o.useProgram(this.prog);const n=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,n),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),o.STATIC_DRAW);const r=o.getAttribLocation(this.prog,"aPos");o.enableVertexAttribArray(r),o.vertexAttribPointer(r,2,o.FLOAT,!1,0,0);for(const s of["uTex","uCurveU","uCurveF","uSrc","uTileOrigin","uTileSize","uOutSize","uSharpR","uClarR","uSplit","uFAmt","uU","uF","uFShadow","uFHigh","uFlipY","uSrcFull","uTexFull","uStr","uAspect","uNOps","uOpA","uOpB","uLock","uBeauty","uB","uLipC","uBlushC","uShadowC","uHairC","uBgC","uSkinR","uBgLod","uBgR","uM0","uFxSeg","uFxD","uM1","uM2","uM3","uM4","uM5","uM5On","uLut3","uLutN","uLensC","uBgT","uBgOff","uChecker","uDisp","uDispOn","uPlate","uPlateOn","uM6","uM6On","uB2","uEye","uFxOn","uFxE","uFxV","uHsl","uGrd","uGlowR","uGlowLod","uFxSeed","uEdLoc","uEdLocOn","uNRLod","uEdA","uNR","uNC","uNCLod","uTexR","uMb","uDx","uDxP","uDxQ"])this.u[s]=o.getUniformLocation(this.prog,s);this.tex=this.mkTex(o.LINEAR),this.lutU=this.mkTex(o.LINEAR),this.lutF=this.mkTex(o.LINEAR),o.uniform1i(this.u.uTex,0),o.uniform1i(this.u.uCurveU,1),o.uniform1i(this.u.uCurveF,2),o.uniform1i(this.u.uM0,3),o.uniform1i(this.u.uM1,4),o.uniform1i(this.u.uM2,5),o.uniform1i(this.u.uM3,7),o.uniform1i(this.u.uM4,9),o.uniform1i(this.u.uM5,14),o.uniform1i(this.u.uM6,15),o.uniform1i(this.u.uLut3,8),this.masks=[this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR)],this.m6=this.mkTex(o.LINEAR),o.activeTexture(o.TEXTURE15),o.bindTexture(o.TEXTURE_2D,this.m6),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([128,128,0,0]));for(let s=0;s<6;s++)o.activeTexture(ht(o,s)),o.bindTexture(o.TEXTURE_2D,this.masks[s]),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([0,0,255,0]));o.activeTexture(o.TEXTURE0),o.uniform1f(this.u.uFlipY,-1),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,o.NONE)}link(){const t=this.gl,i=(o,n)=>{const r=t.createShader(o);if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(r)??"shader");return r},e=t.createProgram();if(t.attachShader(e,i(t.VERTEX_SHADER,Kt)),t.attachShader(e,i(t.FRAGMENT_SHADER,Qt)),t.linkProgram(e),!t.getProgramParameter(e,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(e)??"link");return e}mkTex(t){const i=this.gl,e=i.createTexture();return i.bindTexture(i.TEXTURE_2D,e),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,t),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,t),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),e}setImage(t){const i=this.gl;i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.tex),i.texImage2D(i.TEXTURE_2D,0,i.RGBA8,i.RGBA,i.UNSIGNED_BYTE,t),i.generateMipmap(i.TEXTURE_2D),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR_MIPMAP_LINEAR);const e=t;this.texW=e.videoWidth||t.width,this.texH=e.videoHeight||t.height}setLut(t,i,e,o){const n=JSON.stringify(e);if((o==="U"?this.lastCurvesU:this.lastCurvesF)===n)return;o==="U"?this.lastCurvesU=n:this.lastCurvesF=n;const r=this.gl;r.activeTexture(r.TEXTURE0+t),r.bindTexture(r.TEXTURE_2D,i),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,256,1,0,r.RGBA,r.UNSIGNED_BYTE,$t(e)),r.activeTexture(r.TEXTURE0)}draw(t,i){const e=this.gl,o=this.canvas.width,n=this.canvas.height;e.viewport(0,0,o,n),e.useProgram(this.prog),this.setLut(1,this.lutU,t.curves,"U");const r=t.filter;this.setLut(2,this.lutF,r?.curves??F0,"F"),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,this.lutU),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,this.lutF),r?.lut&&(e.activeTexture(e.TEXTURE8),this.lut3||(this.lut3=this.mkTex(e.LINEAR)),e.bindTexture(e.TEXTURE_2D,this.lut3),this.lut3Id!==r.id&&(this.lut3Id=r.id,e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,e.RGB8,r.lut.n*r.lut.n,r.lut.n,0,e.RGB,e.UNSIGNED_BYTE,M0(r.lut)))),e.uniform1f(this.u.uLutN,r?.lut?r.lut.n:0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.tex);const s=i.tileSize??[o,n],l=i.outSize??s,c=i.texFull??{x:0,y:0,w:1,h:1};e.uniform4f(this.u.uSrcFull,i.src.x,i.src.y,i.src.w,i.src.h),e.uniform4f(this.u.uTexFull,c.x,c.y,c.w,c.h),e.uniform1f(this.u.uAspect,i.aspect??this.texW/Math.max(1,this.texH)),this.setBeauty(i.beauty??null,c),this.setSeg(t),e.uniform2f(this.u.uTileOrigin,...i.tileOrigin??[0,0]),e.uniform2f(this.u.uTileSize,s[0],s[1]),e.uniform2f(this.u.uOutSize,l[0],l[1]);const h=i.src.w/c.w*this.texW,b=i.src.h/c.h*this.texH,F=Math.min(h,b),E=i.outShortPx??Math.min(l[0],l[1]),M=F/Math.max(1,Math.min(s[0],s[1])),A=i.texScale??(i.outShortPx?F/Math.max(1,i.outShortPx):M),L=Math.max(.75,Math.max(1,E/1600)*A),g=Math.max(1.5,E*.009*A);e.uniform2f(this.u.uSharpR,L/this.texW,L/this.texH),e.uniform2f(this.u.uClarR,g/this.texW,g/this.texH),e.uniform1f(this.u.uSplit,i.split??-1),e.uniform1f(this.u.uChecker,i.checker?1:0),e.uniform1f(this.u.uFAmt,r?t.filterAmount:0),e.uniform1fv(this.u.uU,Ue.map(v=>t.params[v]??0)),e.uniform1fv(this.u.uF,r?Ue.map(v=>r.params[v]??0):S0),e.uniform3fv(this.u.uFShadow,r?.shadow??[.5,.5,.5]),e.uniform3fv(this.u.uFHigh,r?.highlight??[.5,.5,.5]);const x=Ot(t.fx,r?.fx,r?t.filterAmount:0);e.uniform1f(this.u.uFxOn,x.on?1:0),e.uniform1fv(this.u.uFxE,x.e),e.uniform1fv(this.u.uFxV,x.v),e.uniform1fv(this.u.uHsl,x.hsl),e.uniform1fv(this.u.uGrd,x.grade),e.uniform1f(this.u.uFxSeed,x.seed);const d=E*.03*A;this.setEd(t,A,E),e.uniform2f(this.u.uGlowR,d/this.texW,d/this.texH),e.uniform1f(this.u.uGlowLod,Math.max(0,Math.log2(Math.max(1,d/3)))),e.drawArrays(e.TRIANGLE_STRIP,0,4)}edV=-1;edTex=null;dxId="";dxTex=null;setEd(t,i,e){const o=this.gl,n=t.ed,r=Math.max(.75,i);o.uniform2f(this.u.uNR,r/this.texW,r/this.texH),o.uniform1f(this.u.uNRLod,Math.max(0,Math.log2(r)));const s=Math.max(1.5,7*i);o.uniform2f(this.u.uNC,s/this.texW,s/this.texH),o.uniform1f(this.u.uNCLod,Math.max(0,Math.log2(s/4)));const l=Math.max(.9,e*.0022*i);o.uniform2f(this.u.uTexR,l/this.texW,l/this.texH),this.edTex||(o.activeTexture(o.TEXTURE11),this.edTex=this.mkTex(o.LINEAR),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([128,255,0,255])),o.uniform1i(this.u.uEdLoc,11),o.activeTexture(o.TEXTURE12),this.dxTex=this.mkTex(o.LINEAR),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),o.uniform1i(this.u.uDx,12)),o.activeTexture(o.TEXTURE11),o.bindTexture(o.TEXTURE_2D,this.edTex),n?.map&&n.map.v!==this.edV&&(this.edV=n.map.v,o.pixelStorei(o.UNPACK_ALIGNMENT,1),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,n.map.w,n.map.h,0,o.RGBA,o.UNSIGNED_BYTE,n.map.data)),o.uniform1f(this.u.uEdLocOn,n?.map?(n.map.light?1:0)+(n.map.person?2:0):0),o.uniform3fv(this.u.uEdA,n?.A??[1,1,1]);const c=n?.mb;c&&c.a>0?o.uniform4f(this.u.uMb,c.dx,c.dy,c.a,Math.max(0,Math.log2(Math.max(1,c.lenFull*i/28)))):o.uniform4f(this.u.uMb,0,0,0,0),o.activeTexture(o.TEXTURE12),o.bindTexture(o.TEXTURE_2D,this.dxTex);const h=n?.dx;h&&h.id!==this.dxId&&(this.dxId=h.id,o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,o.RGBA,o.UNSIGNED_BYTE,h.img),o.generateMipmap(o.TEXTURE_2D),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR_MIPMAP_LINEAR)),o.uniform4f(this.u.uDxP,h?.a??0,h?.s??1,h?.x??0,h?.y??0),o.uniform4f(this.u.uDxQ,h?.bg??0,h?h.img.width/Math.max(1,h.img.height):1,0,h&&h.a>0?1:0),o.activeTexture(o.TEXTURE0)}updateRect(t,i,e,o,n){const r=this.gl;if(t.width!==this.texW||t.height!==this.texH){this.setImage(t);return}if(i=Math.max(0,Math.floor(i)),e=Math.max(0,Math.floor(e)),o=Math.min(t.width-i,Math.ceil(o)),n=Math.min(t.height-e,Math.ceil(n)),o<=0||n<=0)return;const s=t.getContext("2d").getImageData(i,e,o,n);r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,this.tex),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,i,e,o,n,r.RGBA,r.UNSIGNED_BYTE,s.data),r.generateMipmap(r.TEXTURE_2D)}segV=-1;segTex=null;setSeg(t){const i=this.gl,e=t.seg;i.uniform1f(this.u.uFxSeg,e?1:0),e&&(i.activeTexture(i.TEXTURE10),this.segTex||(this.segTex=this.mkTex(i.LINEAR),i.uniform1i(this.u.uFxD,10)),i.bindTexture(i.TEXTURE_2D,this.segTex),this.segV!==e.v&&(this.segV=e.v,i.pixelStorei(i.UNPACK_ALIGNMENT,1),i.texImage2D(i.TEXTURE_2D,0,i.RGBA8,e.w,e.h,0,i.RGBA,i.UNSIGNED_BYTE,e.data)),i.activeTexture(i.TEXTURE0))}setBeauty(t,i){const e=this.gl;if(e.uniform1f(this.u.uBeauty,t?1:0),!t){e.uniform2f(this.u.uStr,0,0);return}if(t.masks&&t.masksVersion!==this.masksVersion){this.masksVersion=t.masksVersion;const s=t.masks;e.pixelStorei(e.UNPACK_ALIGNMENT,1),s.data.forEach((l,c)=>{if(c>5)return;e.activeTexture(ht(e,c)),e.bindTexture(e.TEXTURE_2D,this.masks[c]);const h=c===5&&s.gw&&s.gh;e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,h?s.gw:s.w,h?s.gh:s.h,0,e.RGBA,e.UNSIGNED_BYTE,l)}),s.m6&&(e.activeTexture(e.TEXTURE15),e.bindTexture(e.TEXTURE_2D,this.m6),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,s.m6.w,s.m6.h,0,e.RGBA,e.UNSIGNED_BYTE,s.m6.data))}e.activeTexture(e.TEXTURE15),e.bindTexture(e.TEXTURE_2D,this.m6),e.uniform1f(this.u.uM6On,t.masks?.m6?1:0);{const s=new Float32Array(12);(t.b2??[]).forEach((c,h)=>{h<12&&(s[h]=c)}),e.uniform4fv(this.u.uB2,s);const l=new Float32Array(8);(t.eyes??[]).slice(0,2).forEach((c,h)=>l.set([c.x,c.y,c.r,c.vis],h*4)),e.uniform4fv(this.u.uEye,l)}for(let s=0;s<6;s++)e.activeTexture(ht(e,s)),e.bindTexture(e.TEXTURE_2D,this.masks[s]);e.uniform1f(this.u.uM5On,t.masks&&t.masks.data.length>5&&!R0()?1:0),e.activeTexture(e.TEXTURE6),this.disp||(this.disp=this.mkTex(e.LINEAR),e.uniform1i(this.u.uDisp,6)),e.bindTexture(e.TEXTURE_2D,this.disp),t.field&&t.fieldVersion!==this.dispVersion&&(this.dispVersion=t.fieldVersion,e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,e.RG16F,t.field.w,t.field.h,0,e.RG,e.FLOAT,t.field.data)),e.uniform1f(this.u.uDispOn,t.field?1:0);const o=t.field?t.plate:null;o&&(e.activeTexture(e.TEXTURE13),this.plate||(this.plate=this.mkTex(e.LINEAR),e.uniform1i(this.u.uPlate,13)),e.bindTexture(e.TEXTURE_2D,this.plate),o.v!==this.plateV&&(this.plateV=o.v,e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,o.c))),e.uniform1f(this.u.uPlateOn,o?1:0),e.activeTexture(e.TEXTURE0),e.uniform1i(this.u.uNOps,t.n),e.uniform4fv(this.u.uOpA,t.opA),e.uniform4fv(this.u.uOpB,t.opB),e.uniform1f(this.u.uLock,t.lock),e.uniform1fv(this.u.uB,t.b),e.uniform3fv(this.u.uLipC,t.lip),e.uniform3fv(this.u.uBlushC,t.blush),e.uniform3fv(this.u.uShadowC,t.shadow),e.uniform3fv(this.u.uHairC,t.hair),e.uniform3fv(this.u.uLensC,t.lens),e.uniform4fv(this.u.uBgC,t.bg),e.uniform3fv(this.u.uBgT,t.bgT??[.16,.42,1]),e.uniform1fv(this.u.uBgOff,t.bgOff??[0,0,0,0,0,0,0,0]),e.uniform2f(this.u.uStr,t.stretch[0],t.stretch[1]);const n=this.texH/i.h,r=t.skinR*n;e.uniform2f(this.u.uSkinR,r/this.texW,r/this.texH),e.uniform1f(this.u.uBgLod,Math.log2(Math.max(1,t.bgBlur*n*.5))),e.uniform2f(this.u.uBgR,t.bgBlur*n/this.texW,t.bgBlur*n/this.texH)}dispose(){this.gl.getExtension("WEBGL_lose_context")?.loseContext()}}const F0={rgb:[[0,0],[1,1]],r:[[0,0],[1,1]],g:[[0,0],[1,1]],b:[[0,0],[1,1]]},Pt=5e7;async function L0(a){const t=a.name.replace(/\.[^.]+$/,"")||"joji";let i;try{i=await createImageBitmap(a,{imageOrientation:"from-image"})}catch{i=await new Promise((n,r)=>{const s=new Image;s.onload=()=>n(s),s.onerror=()=>r(new Error("decode")),s.src=URL.createObjectURL(a)})}let e="naturalWidth"in i?i.naturalWidth:i.width,o="naturalHeight"in i?i.naturalHeight:i.height;if(!e||!o)throw new Error("decode");if(e*o>Pt){const n=Math.sqrt(Pt/(e*o)),r=Math.round(e*n),s=Math.round(o*n),l=await createImageBitmap(i,{resizeWidth:r,resizeHeight:s,resizeQuality:"high"});"close"in i&&i.close(),i=l,e=r,o=s}return{src:i,w:e,h:o,name:t}}function gt(a,t,i){return i%2?{w:t,h:a}:{w:a,h:t}}function Gt(a,t,i,e,o){o&&(a.translate(t,0),a.scale(-1,1)),e===1?(a.translate(t,0),a.rotate(Math.PI/2)):e===2?(a.translate(t,i),a.rotate(Math.PI)):e===3&&(a.translate(0,i),a.rotate(-Math.PI/2))}function st(a,t,i=!1){const e=document.createElement("canvas");e.width=a,e.height=t;const o=e.getContext("2d",{alpha:i});return o.imageSmoothingEnabled=!0,o.imageSmoothingQuality="high",{c:e,ctx:o}}function P0(a,t,i,e){const o=gt(a.w,a.h,t),n=Math.min(1,e/Math.max(o.w,o.h)),r=Math.max(1,Math.round(o.w*n)),s=Math.max(1,Math.round(o.h*n)),{c:l,ctx:c}=st(r,s);return c.scale(n,n),Gt(c,o.w,o.h,t,i),c.drawImage(a.src,0,0),l}function Z0(a,t,i){const e=t.w*a.width,o=t.h*a.height,n=i/Math.min(e,o),{c:r,ctx:s}=st(i,i);return s.drawImage(a,t.x*a.width+(e-i/n)/2,t.y*a.height+(o-i/n)/2,i/n,i/n,0,0,i,i),r}function C0(a,t,i=1){const e=gt(a.w,a.h,t.rot);return{w:Math.max(1,Math.round(t.crop.w*e.w)),h:Math.max(1,Math.round(t.crop.h*e.h*i))}}async function D0(a,t,i,e,o){const n=gt(a.w,a.h,t.rot),r=Dt(e),s=n.h*r,l=Math.round(t.crop.x*n.w),c=Math.round(t.crop.y*s),{w:h,h:b}=C0(a,t,r),F=zt(e),E=st(h,b,F),M=new A0(void 0,!0,F);try{let A=e?Math.round(Math.max(64,.07*Math.max(n.w,n.h))):48;const L=x0(Ot(i.fx,i.filter?.fx,i.filter?i.filterAmount:0).e);L&&(A=Math.max(A,Math.round(L*Math.min(h,b)))),i.ed?.margin&&(A=Math.max(A,i.ed.margin));const g=Math.max(256,Math.min(2048,M.maxTex-2*A)),x=[];for(let v=0;v<b;v+=g)for(let y=0;y<h;y+=g)x.push([y,v,Math.min(g,h-y),Math.min(g,b-v)]);const d=st(g+2*A,g+2*A);for(let v=0;v<x.length;v++){const[y,P,N,I]=x[v],D=l+y,C=c+P,S=Tt(C/s,e)*n.h,m=Tt((C+I)/s,e)*n.h,w=Math.max(0,D-A),k=Math.max(0,Math.floor(S)-A),u=Math.min(n.w,D+N+A),f=Math.min(n.h,Math.ceil(m)+A),R=u-w,T=f-k;(d.c.width!==R||d.c.height!==T)&&(d.c.width=R,d.c.height=T);const U=d.ctx;U.setTransform(1,0,0,1,0,0),U.translate(-w,-k),Gt(U,n.w,n.h,t.rot,t.flip),U.drawImage(a.src,0,0),i.pre&&(U.setTransform(1,0,0,1,0,0),i.pre(U,w,k,R,T)),M.setImage(d.c),M.canvas.width=N,M.canvas.height=I,M.draw(i,{src:{x:D/n.w,y:C/s,w:N/n.w,h:I/s},texFull:{x:w/n.w,y:k/n.h,w:R/n.w,h:T/n.h},aspect:n.w/n.h,beauty:e,tileOrigin:[y,P],tileSize:[N,I],outSize:[h,b]}),E.ctx.drawImage(M.canvas,y,P),o((v+1)/x.length),await new Promise(H=>setTimeout(H,0))}}finally{M.dispose()}return E.c}const zt=a=>!!a&&a.b[15]>0&&a.bg[3]<.5;function N0(a,t,i){return new Promise((e,o)=>a.toBlob(n=>n?e(n):o(new Error("encode")),t,i))}function I0(a,t){const e=t.w*a.width,o=t.h*a.height,n=Math.min(1,256/Math.max(e,o)),r=Math.max(1,Math.round(e*n)),s=Math.max(1,Math.round(o*n)),l=document.createElement("canvas");l.width=r,l.height=s;const c=l.getContext("2d",{willReadFrequently:!0});c.drawImage(a,t.x*a.width,t.y*a.height,e,o,0,0,r,s);const h=c.getImageData(0,0,r,s).data,b=new Uint32Array(256);let F=0,E=0,M=0,A=0,L=0,g=0,x=0,d=0,v=0;for(let f=0;f<h.length;f+=4){const R=h[f]/255,T=h[f+1]/255,U=h[f+2]/255,H=.2126*R+.7152*T+.0722*U;b[Math.min(255,Math.round(H*255))]++,F++,E+=H,M+=H*H,H<.12&&d++,H>.96&&v++,H>.15&&H<.85&&(A+=R,L+=T,g+=U,x++)}const y=f=>{let R=0;for(let T=0;T<256;T++)if(R+=b[T],R>=f*F)return T/255;return 1},P=y(.01),N=y(.5),I=y(.99),D=E/F,C=Math.sqrt(Math.max(0,M/F-D*D)),S=(f,R,T)=>Math.min(T,Math.max(R,f)),m=ft(),w=Math.log2(.46/Math.max(.04,(N+D)/2));m.exposure=S(w*.4,-.35,.45),P>.04&&(m.blacks=-S((P-.02)*4,0,.5)),I<.94&&(m.whites=S((.98-I)*3.2,0,.5));const k=v/F,u=d/F;if(k>.01?m.highlights=-S(k*8+.15,0,.6):m.highlights=-.12,u>.08?m.shadows=S(u*1.3+.1,0,.55):m.shadows=.1,m.contrast=S((.22-C)*1.6,-.1,.3),m.clarity=.16,m.sharpness=.12,m.vibrance=.22,x>F*.1){const f=A/x,R=L/x,T=g/x;m.temperature=S((T-f)*2.2,-.35,.35),m.tint=S((R-(f+T)/2)*2.5,-.3,.3)}for(const f of Object.keys(m))m[f]=Math.round(m[f]*100)/100;return m}const qt="joji.presets";function ea(){try{return JSON.parse(localStorage.getItem(qt)||"[]")}catch{return[]}}function ta(a){try{return localStorage.setItem(qt,JSON.stringify(a.slice(0,40))),!0}catch{return!1}}const U0=a=>Object.entries(a.beauty.v).some(([t,i])=>t!=="reshape"&&Math.abs(i)>.004),aa=a=>Ue.some(t=>Math.abs(a.params[t])>.004)||!!a.filterId||JSON.stringify(a.curves)!==JSON.stringify(Ze().curves)||JSON.stringify(a.fx)!==JSON.stringify(Ze().fx)||a.auto;function oa(a,t,i,e,o){const n=De(a.params);if(a.auto&&o)for(const s of Ue)n[s]-=o[s]*a.autoAmt;const r={id:`p${Date.now()}`,name:t,thumb:i,auto:a.auto&&!!o,st:{params:n,curves:De(a.curves),filterId:a.filterId,filterAmount:a.filterAmount,fx:De(a.fx)}};if(e&&U0(a)){const s=a.beauty;r.beauty={v:Object.fromEntries(Object.entries(s.v).filter(([l])=>l!=="reshape")),lip:s.lip,blush:s.blush,shadow:s.shadow,hair:s.hair,lens:s.lens,gender:s.gender}}return r}function Xt(a,t,i){const e=De(a);if(e.params={...ft(),...De(t.st.params)},e.curves=De(t.st.curves),e.filterId=t.st.filterId&&dt(t.st.filterId)?t.st.filterId:null,e.filterAmount=t.st.filterAmount,e.fx=De(t.st.fx),e.auto=!1,e.autoAmt=1,t.auto&&i){const o=I0(i,e.crop);for(const n of Ue)e.params[n]=Math.max(-1,Math.min(1,e.params[n]+o[n]));e.auto=!0}for(const o of Ue)e.params[o]=Math.max(v0.has(o)?0:-1,Math.min(1,e.params[o]));return t.beauty&&(e.beauty={...e.beauty,...De(t.beauty),v:{...De(t.beauty.v)},gender:e.beauty.gender??t.beauty.gender}),e}function ia(a,t,i,e){const o=Xt(Ze(),{...i,beauty:void 0},t);a.setImage(t),a.canvas.width=e.width,a.canvas.height=e.height,a.draw({params:o.params,curves:o.curves,filter:dt(o.filterId),filterAmount:o.filterAmount,fx:o.fx},{src:{x:0,y:0,w:1,h:1},outShortPx:1200}),e.getContext("2d").drawImage(a.canvas,0,0,e.width,e.height)}async function sa(a,t,i){const e=await L0(a);try{const o=P0(e,0,!1,1600);let n=Ze();try{const b=localStorage.getItem("joji.gender");(b==="m"||b==="f")&&(n.beauty.gender=b)}catch{}n=Xt(n,t,o);let r=null;if(t.beauty)try{const b=await xt(()=>import("./detect-_T5TTqDK.js"),__vite__mapDeps([0,1,2]),import.meta.url),F=Math.min(1,1280/Math.max(o.width,o.height)),E=document.createElement("canvas");E.width=Math.round(o.width*F),E.height=Math.round(o.height*F),E.getContext("2d").drawImage(o,0,0,E.width,E.height);const M=await b.analyze(E,o),{buildMasks:A}=await xt(async()=>{const{buildMasks:g}=await import("./masks-ChSKZ8sp.js");return{buildMasks:g}},__vite__mapDeps([3,1,2,0]),import.meta.url),L=M.faces.length?A(M,0,o):null;r=d0(n.beauty,M,L,1)}catch(b){console.warn("batch beauty",b)}i(.3);const s={params:n.params,curves:n.curves,filter:dt(n.filterId),filterAmount:n.filterAmount,fx:n.fx},l=await D0(e,n,s,r,b=>i(.3+b*.6)),c=zt(r),h=await N0(l,c?"image/png":"image/jpeg",.94);return l.width=l.height=0,i(1),{blob:h,name:`joji-${e.name.replace(/\.[a-z0-9]+$/i,"")}`.replace(/[^A-Za-z0-9_-]+/g,"-").replace(/-+/g,"-").replace(/-$/,"")}}finally{"close"in e.src&&e.src.close()}}export{Xt as A,X0 as B,aa as C,U0 as D,g0 as E,Q0 as F,K0 as G,Y0 as H,oa as I,ta as J,G0 as K,q0 as L,s0 as M,C0 as N,D0 as O,Ue as P,N0 as Q,A0 as R,H0 as S,Ct as T,z0 as U,v0 as V,sa as W,a0 as X,Ze as a,Dt as b,De as c,dt as d,p0 as e,Ut as f,zt as g,I0 as h,W0 as i,V0 as j,d0 as k,L0 as l,P0 as m,B0 as n,gt as o,Rt as p,Z0 as q,$0 as r,tt as s,j0 as t,Tt as u,J0 as v,m0 as w,ea as x,ia as y,ft as z};
