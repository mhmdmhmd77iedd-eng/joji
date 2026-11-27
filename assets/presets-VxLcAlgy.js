const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./detect-C7pwrWYL.js","./index-MZKGPHnf.js","./index-Da6XihgR.css","./masks-CHHfB90x.js","./plate-Co9xVqa6.js"])))=>i.map(i=>d[i]);
import{_ as ce}from"./index-MZKGPHnf.js";import{bodyFlags as $e}from"./detect-C7pwrWYL.js";const Ze=`
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
`,t0=`
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
`,e0=`#version 300 es
in vec2 aPos;
out vec2 vUv;
uniform float uFlipY;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos.x, aPos.y * uFlipY, 0.0, 1.0);
}`,a0=`#version 300 es
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
  // capped: fine texture on a busy background (tiles, a hoodie print) must not speckle the edge
  m.b = clamp(m.b + clamp(A.x * d, -0.25, 0.25) * gate.x, 0.0, 1.0);
  m.g = clamp(m.g + clamp(A.y * d, -0.35, 0.35) * gate.y, 0.0, 1.0);
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

${Ze}
${t0}

void main() {
  vec2 gp = (uTileOrigin + vUv * uTileSize) / uOutSize; // global output position 0..1
  vec2 q = unstretch(uSrcFull.xy + vUv * uSrcFull.zw);
  vec2 p = uBeauty > 0.0 ? warp(q) : q;
  if (uBeauty > 0.0 && uDispOn > 0.5) p += texture(uDisp, q).rg;
  vec2 tuv = (p - uTexFull.xy) / uTexFull.zw;
  vec3 orig = texture(uTex, (q - uTexFull.xy) / uTexFull.zw).rgb;
  if (uSplit >= 0.0 && gp.x < uSplit) { outColor = vec4(orig, 1.0); return; }
  vec3 src = edDenoise(texture(uTex, tuv).rgb, tuv);
  // background lock: the photo around the body never moves. Where a body or hair edit moved things (alpha of the
  // field), a pixel shows the person if the person is at its source; else what lies behind: the plate (photo with
  // the person filled in) where the person used to be, the untouched photo everywhere else. So walls, tiles and
  // lines stay straight. Hair length (alpha < 0) takes only hair from its source and leaves the rest as it was.
  if (uBeauty > 0.0 && uDispOn > 0.5) {
    vec4 F = texture(uDisp, q);
    float lw = F.a;
    if (lw > 0.001 && uLock > 0.0) {
      // hair counts as the person (loose strands are only half in the person mask); the field's blue is the
      // person with mask holes filled (made at field size, a little soft), so a gap in the fine mask well inside
      // the person is never shown as background
      vec4 mp = maskM0(p), mq = texture(uM0, q);
      float sp = smoothstep(0.85, 1.0, texture(uDisp, p).b), sq = smoothstep(0.85, 1.0, F.b);
      // the sharp (guided) mask can dip inside the person where clothes match the background's brightness;
      // the plain mask counts too where it is sure
      vec4 mr = texture(uM0, p);
      float pp = max(max(smoothstep(0.2, 0.65, max(mp.b, mp.g)), smoothstep(0.6, 0.9, max(mr.b, mr.g))), sp);
      float pq = max(smoothstep(0.02, 0.25, max(mq.b, mq.g)), sq); // generous: the person's soft halo and shadow edge go too
      vec3 behind = mix(orig, texture(uPlate, q).rgb, pq * uPlateOn);
      src = mix(src, mix(behind, src, pp), lw * uLock);
    } else if (lw < -0.001) {
      // strict: a faint hair guess over the ground would copy the stretched ground in as ghost lines
      vec4 mp = maskM0(p);
      float ph = smoothstep(0.35, 0.75, mp.g) * smoothstep(0.3, 0.7, mp.b);
      src = mix(src, mix(orig, src, ph), -lw);
    }
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
      float pm = smoothstep(0.18, 0.82, person);                       // a soft hand-over, so the cut never shows as a line
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
      // lighter keeps the bright parts' detail (no white-out at 100); darker stops short of black
      if (uB[24] > 0.0) bc = bc + (1.0 - bc) * bc * uB[24] * 0.75 + (1.0 - bc) * (1.0 - bc) * uB[24] * 0.1;
      else if (uB[24] < 0.0) bc = bc * (1.0 + uB[24] * 0.6);
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
}`;function ae(a,e=256){const s=[...a].sort((h,f)=>h[0]-f[0]),t=new Float32Array(e),o=s.length;if(o<2){for(let h=0;h<e;h++)t[h]=h/(e-1);return t}const n=[],l=[],r=new Array(o);for(let h=0;h<o-1;h++)n[h]=Math.max(1e-6,s[h+1][0]-s[h][0]),l[h]=(s[h+1][1]-s[h][1])/n[h];r[0]=l[0],r[o-1]=l[o-2];for(let h=1;h<o-1;h++)r[h]=l[h-1]*l[h]<=0?0:(l[h-1]+l[h])/2;for(let h=0;h<o-1;h++){if(l[h]===0){r[h]=0,r[h+1]=0;continue}const f=r[h]/l[h],k=r[h+1]/l[h],N=f*f+k*k;if(N>9){const M=3/Math.sqrt(N);r[h]=M*f*l[h],r[h+1]=M*k*l[h]}}let i=0;for(let h=0;h<e;h++){const f=h/(e-1);let k;if(f<=s[0][0])k=s[0][1];else if(f>=s[o-1][0])k=s[o-1][1];else{for(;i<o-2&&f>s[i+1][0];)i++;const N=n[i],M=(f-s[i][0])/N,A=M*M,E=A*M;k=(2*E-3*A+1)*s[i][1]+(E-2*A+M)*N*r[i]+(-2*E+3*A)*s[i+1][1]+(E-A)*N*r[i+1]}t[h]=Math.min(1,Math.max(0,k))}return t}function o0(a){const e=ae(a.rgb),s=ae(a.r),t=ae(a.g),o=ae(a.b),n=new Uint8Array(256*4),l=(r,i)=>r[Math.round(i*255)];for(let r=0;r<256;r++){const i=e[r];n[r*4]=Math.round(l(s,i)*255),n[r*4+1]=Math.round(l(t,i)*255),n[r*4+2]=Math.round(l(o,i)*255),n[r*4+3]=255}return n}function ge(a,e,s){const t=new Uint8Array(e*s),o=[],n=r=>{!t[r]&&a[r]<.35&&(t[r]=1,o.push(r))};for(let r=0;r<e;r++)n(r),n((s-1)*e+r);for(let r=0;r<s;r++)n(r*e),n(r*e+e-1);for(;o.length;){const r=o.pop(),i=r%e,h=(r-i)/e;i>0&&n(r-1),i<e-1&&n(r+1),h>0&&n(r-e),h<s-1&&n(r+e)}const l=new Float32Array(e*s);for(let r=0;r<e*s;r++)l[r]=t[r]?a[r]:1;return l}const ye={slimmer:.18,wider:.15},Jt=(a,e,s)=>Math.max(e,Math.min(s,a)),ue=(a,e,s)=>Math.exp(-((a-e)*(a-e))/(2*s*s));function s0(a,e,s,t){if(!a.seg||![t.slim,t.waist,t.hips,t.shoulders,t.arms,t.legs].some(c=>Math.abs(c)>.004))return null;const n=Math.min(1,640/Math.max(a.w,a.h)),l=Math.max(2,Math.round(a.w*n)),r=Math.max(2,Math.round(a.h*n)),i=a.seg[0],h=a.segW,f=a.segH,k=new Float32Array(l*r);for(let c=0;c<r;c++){const m=Math.min(f-1,Math.floor((c+.5)/r*f))*h;for(let u=0;u<l;u++)k[c*l+u]=1-i[m+Math.min(h-1,Math.floor((u+.5)/l*h))]}const N=(c,m)=>{const u=Math.round(c),d=Math.round(m);return u<0||d<0||u>=l||d>=r?0:k[d*l+u]},M=c=>[e[c][0]*l,e[c][1]*r],A=(c,m)=>[(c[0]+m[0])/2,(c[1]+m[1])/2],E=(c,m)=>Math.hypot(c[0]-m[0],c[1]-m[1]),R=c=>s[c]>.5,x=M(11),p=M(12);let g=M(23),v=M(24);const b=E(x,p)||l*.1,F=[],P=R(23)&&R(24),I=!P&&R(11)&&R(12)&&Math.abs(t.shoulders)>.004;if(I){const c=[p[0]-x[0],p[1]-x[1]];let m=[-c[1],c[0]];m[1]<0&&(m=[-m[0],-m[1]]);const u=Math.hypot(m[0],m[1])||1,d=b*1.4/u;g=[x[0]+m[0]*d,x[1]+m[1]*d],v=[p[0]+m[0]*d,p[1]+m[1]*d],t={...t,slim:0,waist:0,hips:0}}if(R(11)&&R(12)&&(P||I)){const c=A(x,p),m=A(g,v),u=b*.15,d=x[0]<p[0],y=W=>{const J=W===-1===d?[11,13,15]:[12,14,16];return J.every(R)?J.map(M):null},G={[-1]:y(-1),1:y(1)},S=[(m[0]-c[0])/(E(c,m)||1),(m[1]-c[1])/(E(c,m)||1)],T=[S[1],-S[0]],U=T[0]>=0?T:[-T[0],-T[1]],X=E(c,m)||1;F.push({A:c,B:m,t0:-.12,t1:1.3,maxH:b*.75,rigid:!0,k:W=>{const J=W<0?Jt(1+W/.12,0,1):1;let q=1;return q*=1-.08*t.slim*Jt((W-.05)/.2,0,1)*(W>1.1?Jt((1.3-W)/.2,0,1):1),q*=1-.13*t.waist*ue(W,.7,.17),q*=1+.08*t.hips*ue(W,1.06,.13),q*=1+.07*t.shoulders*ue(W,.06,.13),q=Jt(q,1-ye.slimmer,1+ye.wider),1+(q-1)*J},limit:(W,J)=>{const q=G[J];if(!q)return 1/0;const K=[c[0]+S[0]*W*X,c[1]+S[1]*W*X];let lt=1/0;for(let bt=0;bt<2;bt++){const ft=q[bt],Z=q[bt+1],V=[Z[0]-ft[0],Z[1]-ft[1]],rt=V[0]*U[1]-V[1]*U[0];if(Math.abs(rt)<1e-6)continue;const $=((K[0]-ft[0])*U[1]-(K[1]-ft[1])*U[0])/rt;if($<-.05||$>1.05)continue;const it=[ft[0]+V[0]*$,ft[1]+V[1]*$],nt=(it[0]-K[0])*U[0]+(it[1]-K[1])*U[1];Math.sign(nt)===J&&(lt=Math.min(lt,Math.abs(nt)-u))}return lt}})}const L=(c,m,u,d,y)=>{if(Math.abs(u)<.004||!R(c)||!R(m))return;const G=M(c),S=M(m);F.push({A:G,B:S,t0:-.1,t1:1.1,maxH:d,rigid:!1,k:T=>1-y*u*Jt(Math.min(T+.1,1.1-T)/.25,0,1)})};for(const[c,m]of[[11,13],[13,15],[12,14],[14,16]])L(c,m,t.arms,b*.2,.13);for(const[c,m]of[[23,25],[25,27],[24,26],[26,28]])L(c,m,t.legs,b*.36,.1);if(!F.length)return null;const C=new Float32Array(l*r),O=new Float32Array(l*r),_=new Float32Array(l*r),j=56;for(const c of F){const m=E(c.A,c.B)||1,u=[(c.B[0]-c.A[0])/m,(c.B[1]-c.A[1])/m],d=[u[1],-u[0]],y=d[0]>=0?d:[-d[0],-d[1]],G=Array.from({length:j},(Z,V)=>c.t0+(c.t1-c.t0)*V/(j-1)),S={[-1]:{h:new Float32Array(j),o:new Float32Array(j)},1:{h:new Float32Array(j),o:new Float32Array(j)}},T=Math.max(c.maxH*2.2,b*1.2);for(let Z=0;Z<j;Z++){const V=[c.A[0]+u[0]*G[Z]*m,c.A[1]+u[1]*G[Z]*m];for(const rt of[-1,1]){let $=0;if(N(V[0],V[1])>.5)for(;$<T&&N(V[0]+y[0]*rt*($+1),V[1]+y[1]*rt*($+1))>.5;)$++;const it=$;let nt=Math.min(it,c.maxH,c.limit?c.limit(G[Z],rt):1/0);nt=Math.max(nt,0),S[rt].h[Z]=nt,S[rt].o[Z]=c.rigid?Math.max(it,nt):nt}}for(const Z of[-1,1])for(const V of[S[Z].h,S[Z].o]){const rt=Float32Array.from(V,($,it)=>[V[Math.max(0,it-1)],V[it],V[Math.min(j-1,it+1)]].sort((ht,yt)=>ht-yt)[1]);for(let $=0;$<j;$++){let it=0,nt=0;for(let ht=-3;ht<=3;ht++){const yt=$+ht;yt>=0&&yt<j&&(it+=rt[yt],nt++)}V[$]=it/nt}}const U=Float32Array.from(G,Z=>c.k(Z)),X=Math.max(...Array.from(S[-1].o),...Array.from(S[1].o))*2+4,W=[c.A[0],c.B[0]],J=[c.A[1],c.B[1]],q=Math.max(Math.abs(c.t0),Math.abs(c.t1-1))*m,K=Math.max(0,Math.floor(Math.min(...W)-X-q)),lt=Math.min(l-1,Math.ceil(Math.max(...W)+X+q)),bt=Math.max(0,Math.floor(Math.min(...J)-X-q)),ft=Math.min(r-1,Math.ceil(Math.max(...J)+X+q));for(let Z=bt;Z<=ft;Z++)for(let V=K;V<=lt;V++){const rt=V+.5-c.A[0],$=Z+.5-c.A[1],it=(rt*u[0]+$*u[1])/m;if(it<=c.t0||it>=c.t1)continue;const nt=rt*y[0]+$*y[1],ht=nt>=0?1:-1,yt=(it-c.t0)/(c.t1-c.t0)*(j-1),ct=Math.floor(yt),At=Math.min(j-1,ct+1),gt=yt-ct,ut=S[ht].h[ct]*(1-gt)+S[ht].h[At]*gt;if(ut<1)continue;const Dt=S[ht].o[ct]*(1-gt)+S[ht].o[At]*gt,Nt=U[ct]*(1-gt)+U[At]*gt;if(Math.abs(Nt-1)<.001)continue;const Ft=Math.abs(nt),zt=ut*Nt,Ct=zt-ut,Yt=Math.max(Math.abs(Ct)*3,(t.tight?.35:.7)*ut);let Rt;if(Ft<=zt)if(t.tight){const jt=Ft/zt,Ht=Jt((jt-.25)/.75,0,1);Rt=Ft+(ut-zt)*Ht*Ht*(3-2*Ht)}else Rt=Ft/Nt;else if(Ft<=Dt+Ct)Rt=Ft-Ct;else if(Ft<=Dt+Yt)Rt=Dt+(Ft-(Dt+Ct))*Yt/(Yt-Ct);else continue;const Ut=(Rt-Ft)*ht;C[Z*l+V]+=Ut*y[0],O[Z*l+V]+=Ut*y[1],_[Z*l+V]=1}}const z=c=>{const m=new Float32Array(c.length);for(let u=0;u<r;u++)for(let d=0;d<l;d++){let y=0,G=0;for(let S=-2;S<=2;S++){const T=d+S;T>=0&&T<l&&(y+=c[u*l+T],G++)}m[u*l+d]=y/G}for(let u=0;u<r;u++)for(let d=0;d<l;d++){let y=0,G=0;for(let S=-2;S<=2;S++){const T=u+S;T>=0&&T<r&&(y+=m[T*l+d],G++)}c[u*l+d]=y/G}};z(C),z(O);for(let c=0;c<l*r;c++)_[c]=Math.abs(C[c])+Math.abs(O[c])>.02?1:0;const D=new Float32Array(l*r*2);for(let c=0;c<l*r;c++)D[c*2]=C[c]/l,D[c*2+1]=O[c]/r;return{w:l,h:r,data:D,solid:t.tight?ge(k,l,r):void 0,lockw:t.tight?_:void 0}}function Me(a,e,s){const t=a.seg[0],o=a.segW,n=a.segH,l=new Float32Array(e*s);for(let r=0;r<s;r++){const i=Math.min(n-1,Math.floor((r+.5)/s*n))*o;for(let h=0;h<e;h++)l[r*e+h]=1-t[i+Math.min(o-1,Math.floor((h+.5)/e*o))]}return l}function i0(a,e,s,t,o,n,l,r){if(o<=.004)return!1;const i=T=>e[T]>.5;if(![11,12,23,24,25,26].every(i))return!1;const h=T=>a[T][1]*t,f=T=>a[T][0]*s,k=(h(23)+h(24))/2,N=(h(11)+h(12))/2,M=Math.abs(k-N)||t*.2,A=k+M*.1,E=[27,28].filter(i),R=E.length?Math.max(...E.map(h)):Math.min(t,Math.max(h(25),h(26))+M*.9),x=R-A;if(x<t*.08)return!1;const p=Math.abs(f(11)-f(12))||s*.1,g=a.map((T,U)=>i(U)?T[0]*s:NaN).filter(T=>!Number.isNaN(T));let v=Math.min(...g)-p*.6,b=Math.max(...g)+p*.6;const F=Math.max(0,Math.floor(v)),P=Math.min(s-1,Math.ceil(b));let I=-1,L=-1;for(let T=0;T<t&&I<0;T++)for(let U=F;U<=P;U++)if(l[T*s+U]>.5){I=T;break}for(let T=t-1;T>=0&&L<0;T--)for(let U=F;U<=P;U++)if(l[T*s+U]>.5){L=T;break}if(I<0||L<0)return!1;const C=.12*o*x,O=Math.max(0,t*.985-L),_=Math.max(0,I-t*.015),j=Math.min(C,O+_);if(j<C*.5||j<1)return!1;const z=Math.min(j,O),D=j-z,c=256,m=new Float32Array(c+1),u=T=>{const U=Math.max(0,Math.min(1,T));return U*U*(3-2*U)};for(let T=1;T<=c;T++){const U=(T-.5)/c;m[T]=m[T-1]+u(U/.35)*(1-u((U-.82)/.16))}for(let T=0;T<=c;T++)m[T]/=m[c];const d=T=>(T<=A?T:T>=R?T+j:T+j*m[Math.round((T-A)/x*c)])-D,y=new Float32Array(t);let G=-D-1;for(let T=0;T<t;T++){for(;G<t+j&&d(G+.25)<T+.5;)G+=.25;y[T]=Math.max(0,G)}const S=p*.3;v=Math.max(0,v),b=Math.min(s-1,b);for(let T=0;T<t;T++){const U=y[T]-(T+.5);if(!(Math.abs(U)<.001))for(let X=Math.max(0,Math.floor(v-S));X<=Math.min(s-1,Math.ceil(b+S));X++){const W=X<v?1-(v-X)/S:X>b?1-(X-b)/S:1;n[T*s+X]+=U*u(W),W>0&&(r[T*s+X]=1)}}return!0}function n0(a,e,s,t,o,n,l,r){const i=a.seg;if(!i||o<=.004)return!1;const h=a.segW,f=a.segH,k=(D,c,m)=>{const u=Math.floor(c/s*h),d=Math.floor(m/t*f);return u<0||d<0||u>=h||d>=f?0:i[D][d*h+u]},N=D=>[e[D][0]*s,e[D][1]*t],M=N(10),A=N(152),E=Math.hypot(M[0]-A[0],M[1]-A[1]);if(E<8)return!1;const R=[(M[0]-A[0])/E,(M[1]-A[1])/E],x=[(M[0]+A[0])/2+R[0]*.15*E,(M[1]+A[1])/2+R[1]*.15*E],p=180,g=new Float32Array(p),v=new Float32Array(p),b=Math.max(.5,E/120),F=E*2.2;for(let D=0;D<p;D++){const c=D/p*Math.PI*2,m=Math.cos(c),u=Math.sin(c);let d=0,y=0,G=0;for(let S=0;S<F;S+=b){const T=x[0]+m*S,U=x[1]+u*S;if(k(3,T,U)>.5&&(d=S),k(1,T,U)>.5)y=S,G=0;else if(y>0&&++G*b>E*.15)break}g[D]=d,v[D]=Math.max(y,d)}const P=(D,c)=>{const m=new Float32Array(p);for(let u=0;u<p;u++){let d=0;for(let y=-c;y<=c;y++)d+=D[(u+y+p)%p];m[u]=d/(2*c+1)}return m},I=P(g,4),L=P(v,6),C=[];if(a.pose&&a.poseVis)for(const D of[7,8])(a.poseVis[D]??0)>.5&&C.push([a.pose[D][0]*s,a.pose[D][1]*t]);const O=E*.17,_=E*.34;let j=!1;for(let D=0;D<t;D++)for(let c=0;c<s;c++){const m=c-x[0],u=D-x[1],d=Math.hypot(m,u);if(d<1||d>F*1.3)continue;let y=Math.atan2(u,m);y<0&&(y+=Math.PI*2);const G=y/(Math.PI*2)*p,S=Math.floor(G)%p,T=(S+1)%p,U=G-Math.floor(G),X=I[S]*(1-U)+I[T]*U,W=L[S]*(1-U)+L[T]*U,J=W-X;if(J<E*.02)continue;const q=Math.min(1,Math.max(0,(J-E*.02)/(E*.1))),K=(m*R[0]+u*R[1])/d,lt=Math.max(0,Math.min(1,1-(J-E*.06)/(E*.3))),bt=K>0?1-.65*(1-.55*lt)*K*K:1-.5*K*K,ft=o*bt*Math.min((.13+.06*lt)*E,(.5+.3*lt)*J)*q*q*(3-2*q),Z=Math.max(ft*3,E*.05);let V;if(d<=X)V=0;else if(d<=W){const ut=(d-X)/J;V=ut*ut*(3-2*ut)}else if(d<=W+Z){const ut=1-(d-W)/Z;V=ut*ut*(3-2*ut)}else V=0;if(V<=0)continue;const rt=1-Math.min(1,k(2,c,D)+k(4,c,D))*(1-k(1,c,D)),it=m*R[1]-u*R[0]>=0?[R[1],-R[0]]:[-R[1],R[0]],nt=Math.max(0,Math.min(1,-K*1.6)),ht=m/d*(1-nt)+it[0]*nt,yt=u/d*(1-nt)+it[1]*nt;let ct=1;for(const ut of C){const Dt=Math.hypot(c-ut[0],D-ut[1]);if(Dt<_){const Nt=Math.max(0,(Dt-O)/(_-O));ct=Math.min(ct,Nt*Nt*(3-2*Nt))}}const At=ft*V*rt*ct,gt=D*s+c;n[gt]-=ht*At,l[gt]-=yt*At,r&&(r[gt]=1),j=!0}if(!j)return!1;const z=Math.max(1,Math.round(E*.04));for(const D of[n,l])for(let c=0;c<2;c++){const m=new Float32Array(s*t);for(let u=0;u<t;u++){let d=0;for(let y=-z;y<s+z;y++)y+z<s&&(d+=D[u*s+Math.min(s-1,y+z)]),y-z-1>=0&&(d-=D[u*s+y-z-1]),y>=0&&y<s&&(m[u*s+y]=d/(2*z+1))}for(let u=0;u<s;u++){let d=0;for(let y=-z;y<t+z;y++)y+z<t&&(d+=m[Math.min(t-1,y+z)*s+u]),y-z-1>=0&&(d-=m[(y-z-1)*s+u]),y>=0&&y<t&&(D[y*s+u]=d/(2*z+1))}}if(r)for(let D=0;D<s*t;D++)r[D]=Math.abs(n[D])+Math.abs(l[D])>.02?1:0;return!0}function Ie(a,e,s,t,o,n,l){const r=a.seg;if(!r||o<=.004)return!1;const i=(u,d)=>r[1][Math.min(a.segH-1,Math.floor((d+.5)/t*a.segH))*a.segW+Math.min(a.segW-1,Math.floor((u+.5)/s*a.segW))],h=u=>e[u][1]*t,f=u=>e[u][0]*s,k=h(152),N=h(10),M=k-N;if(M<8)return!1;const A=Math.abs(f(454)-f(234))||M*.8,E=(f(454)+f(234))/2,R=h(14)+M*.1,x=Math.max(0,Math.floor(E-A*3)),p=Math.min(s-1,Math.ceil(E+A*3));let g=-1,v=0,b=s,F=-1;for(let u=Math.ceil(R);u<t;u++){let d=0;for(let y=x;y<=p;y++)i(y,u)>.5&&(d++,y<b&&(b=y),y>F&&(F=y));if(d>1)g=u,v+=d;else if(g>0&&u>g+M*.15)break}const P=Math.max(0,b-A*.2),I=Math.min(s-1,F+A*.2),L=g-R;if(g<0||L<M*.25||v<M*M*.04)return!1;const C=Math.min(.35*o*L,t*.99-g);if(C<1)return!1;const O=u=>{const d=Math.max(0,Math.min(1,u));return d*d*(3-2*d)},_=256,j=new Float32Array(_+1);for(let u=1;u<=_;u++)j[u]=j[u-1]+O((u-.5)/_/.4);for(let u=0;u<=_;u++)j[u]/=j[_];const z=u=>u<=R?u:u>=g?u+C:u+C*j[Math.round((u-R)/L*_)],D=new Float32Array(t);let c=0;for(let u=0;u<t;u++){for(;c<t+C&&z(c+.25)<u+.5;)c+=.25;D[u]=c}const m=A*.3;for(let u=0;u<t;u++){const d=D[u]-(u+.5);if(!(Math.abs(d)<.001))for(let y=Math.max(0,Math.floor(P-m));y<=Math.min(s-1,Math.ceil(I+m));y++){const G=O(y<P?1-(P-y)/m:y>I?1-(y-I)/m:1);if(G<=0)continue;const S=u*s+y;l[S]>0||(n[S]+=d*G,l[S]=-1)}}return!0}const ke=a=>[a.slim,a.vshape,a.jaw,a.chin,a.forehead,a.nose,a.noseW,a.eyes,a.lips,a.dchin??0,a.smile??0,a.cheekbones??0,a.browLift??0,a.symmetry??0],Xt=[10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109],r0=[[.12,.8],[.22,.6],[.32,.4],[.42,.2],[.54,0]],Lt=(a,e,s)=>{const t=Math.max(0,Math.min(1,(s-a)/(e-a)));return t*t*(3-2*t)};function l0(a){const e=a.length;let s=1/0,t=1/0,o=-1/0,n=-1/0;for(const[M,A]of a)s=Math.min(s,M),t=Math.min(t,A),o=Math.max(o,M),n=Math.max(n,A);const l=Math.max(o-s,n-t)*20,r=(s+o)/2,i=(t+n)/2,h=a.concat([[r-l,i-l],[r+l,i-l],[r,i+l]]),f=(M,A,E)=>{const[R,x]=h[M],[p,g]=h[A],[v,b]=h[E],F=2*(R*(g-b)+p*(b-x)+v*(x-g))||1e-12,P=((R*R+x*x)*(g-b)+(p*p+g*g)*(b-x)+(v*v+b*b)*(x-g))/F,I=((R*R+x*x)*(v-p)+(p*p+g*g)*(R-v)+(v*v+b*b)*(p-R))/F;return{a:M,b:A,c:E,x:P,y:I,r2:(R-P)**2+(x-I)**2}};let k=[f(e,e+1,e+2)];for(let M=0;M<e;M++){const[A,E]=h[M],R=[],x=[];for(const g of k)((A-g.x)**2+(E-g.y)**2<g.r2?R:x).push(g);const p=new Map;for(const g of R)for(const[v,b]of[[g.a,g.b],[g.b,g.c],[g.c,g.a]]){const F=v<b?v+","+b:b+","+v;p.has(F)?p.delete(F):p.set(F,[v,b])}for(const[g,v]of p.values())x.push(f(g,v,M));k=x}const N=[];for(const M of k)M.a<e&&M.b<e&&M.c<e&&N.push(M.a,M.b,M.c);return N}const he=(a,e,s)=>(e[0]-a[0])*(s[1]-a[1])-(s[0]-a[0])*(e[1]-a[1]);function c0(a,e,s,t,o,n,l,r){if(!ke(t).some(w=>Math.abs(w)>.004))return 1;const i=a.map(w=>[w[0]*e,w[1]*s]),h=a.map(w=>(w[2]??0)*e),f=w=>[i[w][0],i[w][1],h[w]],k=(w,B)=>[w[0]-B[0],w[1]-B[1],w[2]-B[2]],N=(w,B)=>w[0]*B[0]+w[1]*B[1]+w[2]*B[2],M=w=>{const B=Math.hypot(w[0],w[1],w[2])||1;return[w[0]/B,w[1]/B,w[2]/B]},A=(w,B)=>[w[1]*B[2]-w[2]*B[1],w[2]*B[0]-w[0]*B[2],w[0]*B[1]-w[1]*B[0]],E=k(f(454),f(234)),R=k(f(152),f(10)),x=Math.hypot(E[0],E[1],E[2])||1,p=Math.hypot(R[0],R[1],R[2])||1,g=M(E),v=M(k(R,g.map(w=>w*N(R,g))));let b=A(g,v);b[2]>0&&(b=b.map(w=>-w));const F=f(10).map((w,B)=>(w+f(152)[B])/2),P=(()=>{const w=[i[152][0]-i[10][0],i[152][1]-i[10][1]],B=Math.hypot(w[0],w[1])||1;return[w[0]/B,w[1]/B]})(),I=[-P[1],P[0]],L=Math.hypot(i[454][0]-i[234][0],i[454][1]-i[234][1])||x,C=Math.hypot(i[152][0]-i[10][0],i[152][1]-i[10][1])||p,O=[(i[234][0]+i[454][0])/2,(i[234][1]+i[454][1])/2],_=f(234).map((w,B)=>(w+f(454)[B])/2),j=Lt(.35,.75,Math.abs(g[2])),z=w=>{const B=[i[w][0]-O[0],i[w][1]-O[1]],tt=[i[w][0]-F[0],i[w][1]-F[1]],Q=(B[0]*I[0]+B[1]*I[1])/(L/2),Y=j>0?N(k(f(w),_),g)/(x/2):0;return[Q+(Y-Q)*j,(tt[0]*P[0]+tt[1]*P[1])/(C/2)]},D=w=>{const B=Math.asin(Math.max(-1,Math.min(1,w)));return-(Math.sin(B)*g[2]+Math.cos(B)*b[2])},c=w=>Lt(-.05,.5,D(w))*(o==="r"&&w<-.2||o==="l"&&w>.2?0:1),m=w=>{let B=0,tt=0;for(const Q of w)B+=i[Q][0],tt+=i[Q][1];return[B/w.length,tt/w.length]},u=(w,B)=>Math.hypot(w[0]-B[0],w[1]-B[1]),d=m([33,133,159,145]),y=m([362,263,386,374]),G=Math.max(u(i[33],i[133]),u(i[362],i[263]))/2||x*.1,S=m([4,98,327,6]),T=Math.max(u(i[98],i[327])/2,x*.08),U=m([13,14,61,291]),X=Math.max(u(i[61],i[291])/2,x*.12),W=c(z(33)[0]),J=c(z(263)[0]),q=[g[0],g[1]],K=Math.hypot(g[0],g[1])||1,lt=[F[0],F[1]],bt=i[61],ft=i[291],Z=m([116,123,117]),V=m([345,352,346]),rt=m([46,53,52,65,55,70,63,105,66,107]),$=m([276,283,282,295,285,300,293,334,296,336]),it=Math.max(u(i[46],i[55]),u(i[276],i[285]))/2||L*.15,nt=(w,B,tt,Q)=>{const Y=w[0]-B[0],et=w[1]-B[1],ot=Y*I[0]+et*I[1],st=Y*P[0]+et*P[1];return Math.exp(-(ot*ot)/(2*tt*tt)-st*st/(2*Q*Q))},ht=[];if(t.symmetry){const w=Math.min(468,i.length),B=Array.from({length:w},(Y,et)=>z(et)),tt=.035,Q=.8*(1-j);for(let Y=0;Y<w;Y++){const[et,ot]=B[Y];if(Math.abs(et)<.03){ht.push([0,0]);continue}let st=1e9,Mt=Y;for(let Et=0;Et<w;Et++){const dt=(B[Et][0]+et)**2+(B[Et][1]-ot)**2;dt<st&&(st=dt,Mt=Et)}const pt=Math.max(-tt,Math.min(tt,(-B[Mt][0]-et)/2))*Q,xt=Math.max(-tt,Math.min(tt,(B[Mt][1]-ot)/2))*Q;ht.push([pt*I[0]*L/2+xt*P[0]*C/2,pt*I[1]*L/2+xt*P[1]*C/2])}}const yt=(w,B,tt)=>{const[Q,Y]=z(w),et=c(Q);let ot=0,st=0;const Mt=Math.sin(Math.max(-1,Math.min(1,Q))*Math.PI/2);ot+=-Mt*.09*t.slim*Lt(-.45,.25,Y),ot+=-Mt*.11*t.vshape*Lt(.15,.75,Y),st+=.03*t.vshape*Lt(.6,1,Y)*(1-Math.min(1,Math.abs(Q))),ot+=Mt*.07*t.jaw*Math.exp(-((Y-.62)**2)/(2*.2*.2)),st+=.07*t.chin*Lt(.45,1,Y)*Math.max(0,1-Math.abs(Q)*.9),st+=-.06*t.forehead*Lt(-.35,-1,Y)*Math.max(0,1-Math.abs(Q)*.6);let pt=(ot*I[0]*L/2+st*P[0]*C/2)*et,xt=(ot*I[1]*L/2+st*P[1]*C/2)*et;const Et=(dt,vt,wt,Bt=!1)=>{const It=u(B,dt),kt=1-Lt(vt*.7,vt*1.9,It);if(kt<=0||!wt)return;const Qt=B[0]-dt[0],$t=B[1]-dt[1];if(Bt){const be=(Qt*q[0]+$t*q[1])/(K*K);pt+=be*q[0]*wt*kt,xt+=be*q[1]*wt*kt}else pt+=Qt*wt*kt,xt+=$t*wt*kt};if(t.eyes&&(Et(d,G,.13*t.eyes*W),Et(y,G,.13*t.eyes*J)),t.nose&&Et(S,T*1.3,.12*t.nose),t.noseW&&Et(S,T,.16*t.noseW,!0),t.lips){const dt=u(B,U),vt=1-Lt(X*.7,X*1.9,dt);if(vt>0){const wt=B[0]-U[0],Bt=B[1]-U[1],It=wt*I[0]+Bt*I[1],kt=wt*P[0]+Bt*P[1],Qt=.06*t.lips*vt,$t=.17*t.lips*vt;pt+=It*Qt*I[0]+kt*$t*P[0],xt+=It*Qt*I[1]+kt*$t*P[1]}}if(t.smile)for(const[dt,vt,wt]of[[bt,-1,W],[ft,1,J]]){const Bt=nt(B,dt,X*.42,X*.5)*t.smile*wt,It=.2*X*Bt,kt=.06*X*Bt;pt+=-P[0]*It+I[0]*vt*kt,xt+=-P[1]*It+I[1]*vt*kt}if(t.cheekbones)for(const[dt,vt,wt]of[[Z,-1,W],[V,1,J]]){const Bt=nt(B,dt,L*.09,L*.07)*t.cheekbones*wt;pt+=(I[0]*vt*.03-P[0]*.012)*L*Bt,xt+=(I[1]*vt*.03-P[1]*.012)*L*Bt}if(t.browLift)for(const[dt,vt,wt]of[[rt,d,W],[$,y,J]]){const Bt=Lt(G*.75,G*1.35,u(B,vt)),It=nt(B,[dt[0]-P[0]*it*.15,dt[1]-P[1]*it*.15],it*.95,it*.55)*t.browLift*Bt*wt,kt=.024*C*It;pt+=-P[0]*kt,xt+=-P[1]*kt}return t.symmetry&&ht[w]&&(pt+=ht[w][0]*t.symmetry,xt+=ht[w][1]*t.symmetry),[pt*tt,xt*tt]},ct=i.slice(0,Math.min(468,i.length)),At=ct.length,gt=[],ut=[],Dt=Xt.map((w,B)=>{const tt=i[Xt[(B+Xt.length-1)%Xt.length]],Q=i[Xt[(B+1)%Xt.length]];let Y=Q[0]-tt[0],et=Q[1]-tt[1];const ot=Math.hypot(Y,et)||1;Y/=ot,et/=ot;let st=-et,Mt=Y;st*(i[w][0]-lt[0])+Mt*(i[w][1]-lt[1])<0&&(st=-st,Mt=-Mt);const pt=i[w][0]-lt[0],xt=i[w][1]-lt[1],Et=Math.hypot(pt,xt)||1,dt=st+pt/Et,vt=Mt+xt/Et,wt=Math.hypot(dt,vt)||1;return[dt/wt,vt/wt]}),Nt=[];r0.forEach(([w,B],tt)=>Xt.forEach((Q,Y)=>{ct.push([i[Q][0]+Dt[Y][0]*w*x,i[Q][1]+Dt[Y][1]*w*x]),gt.push(Q),ut.push(B),Nt.push(tt)}));const Ft=[.75,1,.6,.25,0],zt=(w,B)=>{if(!t.dchin)return[0,0];const[tt,Q]=z(gt[w]),Y=-.055*C*t.dchin*Ft[Nt[w]]*Lt(.5,.95,Q)*(1-Math.min(1,Math.abs(tt))*.55)*c(tt)*B;return[P[0]*Y,P[1]*Y]},Ct=ct.length;ct.push([-e,-s],[2*e,-s],[2*e,2*s],[-e,2*s]);const Yt=l0(ct),Rt=ct.map((w,B)=>r&&B<Ct&&w[0]>=0&&w[1]>=0&&w[0]<e&&w[1]<s?Math.min(1,Math.max(0,r(w[0],w[1],B<At))):0),Ut=new Float32Array(e*s),jt=new Float32Array(e*s),Ht=Math.max(...ke(t).map(Math.abs),.004);let qt=1/Ht;const Qe=w=>ct.map((B,tt)=>{if(tt<At){const Q=yt(tt,B,w),Y=1-Rt[tt];return[B[0]+Q[0]*Y,B[1]+Q[1]*Y]}if(tt<Ct){const Q=tt-At,Y=yt(gt[Q],i[gt[Q]],w),et=ut[Q]*(1-Rt[tt]),ot=zt(Q,w),st=1-Rt[tt];return[B[0]+Y[0]*et+ot[0]*st,B[1]+Y[1]*et+ot[1]*st]}return B});for(let w=0;w<10;w++){const B=ct.map((Y,et)=>{if(et<At){const ot=yt(et,Y,qt),st=1-Rt[et];return[Y[0]+ot[0]*st,Y[1]+ot[1]*st]}if(et<Ct){const ot=et-At,st=yt(gt[ot],i[gt[ot]],qt),Mt=ut[ot]*(1-Rt[et]),pt=zt(ot,qt),xt=1-Rt[et];return[Y[0]+st[0]*Mt+pt[0]*xt,Y[1]+st[1]*Mt+pt[1]*xt]}return Y});Ut.fill(0),jt.fill(0),Te(Yt,ct,B,e,s,Ut,jt);const[tt,Q]=pe(Ut,jt,e,s);if(tt>=.72&&Q<=1.4)break;qt*=.8}qt*=Ht,Ht<.999&&(Ut.fill(0),jt.fill(0),Te(Yt,ct,Qe(qt),e,s,Ut,jt));for(let w=0;w<e*s;w++)n[w]+=Ut[w],l[w]+=jt[w];return qt}function Te(a,e,s,t,o,n,l){for(let r=0;r<a.length;r+=3){const i=a[r],h=a[r+1],f=a[r+2],k=e[i],N=e[h],M=e[f],A=s[i],E=s[h],R=s[f];if(Math.max(Math.abs(k[0]-A[0])+Math.abs(k[1]-A[1]),Math.abs(N[0]-E[0])+Math.abs(N[1]-E[1]),Math.abs(M[0]-R[0])+Math.abs(M[1]-R[1]))<.005)continue;const p=he(A,E,R);if(Math.abs(p)<1e-9)continue;const g=Math.max(0,Math.floor(Math.min(A[0],E[0],R[0]))),v=Math.min(t-1,Math.ceil(Math.max(A[0],E[0],R[0]))),b=Math.max(0,Math.floor(Math.min(A[1],E[1],R[1]))),F=Math.min(o-1,Math.ceil(Math.max(A[1],E[1],R[1])));for(let P=b;P<=F;P++)for(let I=g;I<=v;I++){const L=[I+.5,P+.5],C=he(E,R,L)/p,O=he(R,A,L)/p,_=1-C-O;C<-1e-6||O<-1e-6||_<-1e-6||(n[P*t+I]=C*k[0]+O*N[0]+_*M[0]-L[0],l[P*t+I]=C*k[1]+O*N[1]+_*M[1]-L[1])}}}function pe(a,e,s,t){let o=1,n=1;for(let l=0;l<t-2;l++)for(let r=0;r<s-2;r++){const i=l*s+r,h=1+(a[i+2]-a[i])/2,f=(a[i+2*s]-a[i])/2,k=(e[i+2]-e[i])/2,N=1+(e[i+2*s]-e[i])/2;if(h===1&&f===0&&k===0&&N===1)continue;const M=h*h+f*f+k*k+N*N,A=h*N-f*k,E=Math.sqrt(Math.max(0,M*M/4-A*A)),R=Math.sqrt(M/2+E),x=A<=0?0:Math.sqrt(Math.max(0,M/2-E));x<o&&(o=x),R>n&&(n=R)}return[o,n]}const u0=(a,e,s)=>{const t=Math.max(0,Math.min(1,(s-a)/(e-a)));return t*t*(3-2*t)};let Ee="",Ae=null,Re=0,oe=null;const h0=()=>({gender:null,face:0,v:{},lip:"#b8324a",blush:"#e0707a",shadow:"#6b4a5a",hair:"#5a3020",bg:"#ffffff",lens:"#5a86b8",bgT:"#2a6cff",lock:!0,liq:[]}),_e=[{id:"autoBeauty",name:"تجميل بلمسة",group:"ذكاء",min:0,max:100},{id:"faceSlim",name:"نحافة الوجه",group:"الوجه",min:0,max:100},{id:"vshape",name:"وجه V",group:"الوجه",min:0,max:100,only:"f"},{id:"jaw",name:"عرض الفك",group:"الوجه",min:-100,max:100},{id:"chin",name:"الذقن",group:"الوجه",min:-100,max:100},{id:"forehead",name:"الجبهة",group:"الوجه",min:-100,max:100},{id:"nose",name:"حجم الأنف",group:"الوجه",min:-100,max:100},{id:"noseW",name:"عرض الأنف",group:"الوجه",min:-100,max:100},{id:"eyes",name:"العيون",group:"الوجه",min:-100,max:100},{id:"lips",name:"الشفاه",group:"الوجه",min:-100,max:100},{id:"dchin",name:"إزالة الغبغب",group:"الوجه",min:0,max:100},{id:"smile",name:"ابتسامة",group:"الوجه",min:0,max:100},{id:"cheekbones",name:"عظام الخد",group:"الوجه",min:-100,max:100},{id:"browLift",name:"رفع الحواجب",group:"الوجه",min:-100,max:100},{id:"symmetry",name:"تناسق الوجه",group:"الوجه",min:0,max:100},{id:"smooth",name:"نعومة",group:"البشرة",min:0,max:100},{id:"even",name:"توحيد اللون",group:"البشرة",min:0,max:100},{id:"bright",name:"إشراقة",group:"البشرة",min:-100,max:100},{id:"warm",name:"دفء البشرة",group:"البشرة",min:-100,max:100},{id:"blemish",name:"إزالة الحبوب",group:"البشرة",min:0,max:100},{id:"matte",name:"إزالة اللمعة",group:"البشرة",min:0,max:100},{id:"undereye",name:"الهالات",group:"البشرة",min:0,max:100},{id:"wrinkles",name:"التجاعيد",group:"البشرة",min:0,max:100},{id:"sculpt",name:"نحت بالضوء",group:"البشرة",min:0,max:100},{id:"tan",name:"سمرة خفيفة",group:"البشرة",min:0,max:100},{id:"freckles",name:"نمش",group:"البشرة",min:0,max:100},{id:"teeth",name:"تبييض الأسنان",group:"البشرة",min:0,max:100},{id:"eyeGlow",name:"لمعة العيون",group:"البشرة",min:0,max:100},{id:"eyeWhite",name:"بياض العين",group:"البشرة",min:0,max:100},{id:"catchlight",name:"نقطة ضوء بالعين",group:"البشرة",min:0,max:100},{id:"redEye",name:"العين الحمراء",group:"البشرة",min:0,max:100},{id:"lens",name:"عدسات ملونة",group:"البشرة",min:0,max:100,swatch:"lens"},{id:"lipstick",name:"أحمر الشفاه",group:"مكياج",min:0,max:100,only:"f",swatch:"lip"},{id:"blush",name:"بلشر",group:"مكياج",min:0,max:100,only:"f",swatch:"blush"},{id:"shadow",name:"ظلال وكحل",group:"مكياج",min:0,max:100,only:"f",swatch:"shadow"},{id:"brows",name:"الحواجب",group:"مكياج",min:0,max:100,only:"f"},{id:"liner",name:"آيلاينر ورموش",group:"مكياج",min:0,max:100,only:"f"},{id:"contour",name:"كونتور",group:"مكياج",min:0,max:100,only:"f"},{id:"highlight",name:"هايلايت",group:"مكياج",min:0,max:100,only:"f"},{id:"beard",name:"كثافة اللحية",group:"عناية",min:0,max:100,only:"m"},{id:"browsM",name:"كثافة الحواجب",group:"عناية",min:0,max:100,only:"m"},{id:"hairFill",name:"كثافة الشعر",group:"الشعر",min:0,max:100},{id:"hairVol",name:"حجم الشعر",group:"الشعر",min:0,max:100},{id:"hairLen",name:"طول الشعر",group:"الشعر",min:0,max:100},{id:"hairColor",name:"لون الشعر",group:"الشعر",min:0,max:100,swatch:"hair"},{id:"hairShine",name:"لمعان الشعر",group:"الشعر",min:0,max:100},{id:"hairline",name:"خط الشعر",group:"الشعر",min:0,max:100},{id:"greyCover",name:"تغطية الشيب",group:"الشعر",min:0,max:100},{id:"studio",name:"إضاءة استوديو",group:"الإضاءة",min:0,max:100},{id:"sideLight",name:"ضوء جانبي",group:"الإضاءة",min:-100,max:100},{id:"bodySlim",name:"نحافة الجسم",group:"الجسم",min:-100,max:100},{id:"waist",name:"الخصر",group:"الجسم",min:-100,max:100},{id:"hips",name:"الورك",group:"الجسم",min:-100,max:100,only:"f"},{id:"shoulders",name:"الأكتاف",group:"الجسم",min:-100,max:100},{id:"arms",name:"الذراعين",group:"الجسم",min:-100,max:100},{id:"legs",name:"الساقين",group:"الجسم",min:-100,max:100},{id:"height",name:"الطول",group:"الجسم",min:0,max:100},{id:"bgBlur",name:"تغبيش الخلفية",group:"الخلفية",min:0,max:100},{id:"bgSwap",name:"تبديل الخلفية",group:"الخلفية",min:0,max:100,swatch:"bg"},{id:"bgPop",name:"عزل الشخص",group:"الخلفية",min:0,max:100},{id:"bgLight",name:"إضاءة الخلفية",group:"الخلفية",min:-100,max:100},{id:"bgSat",name:"ألوان الخلفية",group:"الخلفية",min:-100,max:100},{id:"bgKill",name:"إطفاء ألوان",group:"الخلفية",min:0,max:100},{id:"bgTint",name:"صبغة الخلفية",group:"الخلفية",min:0,max:100,swatch:"bgT"},{id:"subjLight",name:"إضاءة الشخص",group:"الخلفية",min:-100,max:100},{id:"reshape",name:"فرشاة التشكيل",group:"تشكيل حر",min:10,max:100}],Y0={lip:["#b8324a","#d0455e","#9b2335","#c8576b","#e07a7a","#8a3a3a","#c06a5a","#6e2a3a"],blush:["#e0707a","#f08a7a","#d9607a","#f0a090","#c86a6a"],shadow:["#6b4a5a","#8a6a50","#4a3a3a","#7a5a7a","#a07050","#2a2228"],hair:["#141010","#5a3020","#2a1a14","#8a5a30","#c09060","#a03a2a","#6a2a4a","#3a3a50","#d0c0b0"],lens:["#5a86b8","#4f8a6a","#8a6a3c","#8a8f98","#a7834f","#3a2a22"],bg:["#ffffff","#f2e8de","#1a1a1a","#e8d0d8","#cfe0f0","#d8e8d0","transparent"],bgT:["#2a6cff","#18b8a8","#ff7a3a","#ff4f8b","#8a5cff","#d4ff3a","#f2c68a","#3a3f5a"]};function J0(a){return _e.filter(e=>!e.only||e.only===a)}const m0={eyeWhite:.3,wrinkles:.2,smooth:.6,even:.4,bright:.16,undereye:.55,eyeGlow:.35,teeth:.35,blemish:.5,matte:.3,faceSlim:.2,eyes:.12,nose:-.1},f0={eyeWhite:.25,wrinkles:.3,smooth:.45,even:.35,bright:.08,undereye:.45,eyeGlow:.25,teeth:.3,blemish:.5,matte:.4,jaw:.1};function Oe(a){return!a||a.stretch[1]<=0?1:1+(1-a.stretch[0])*a.stretch[1]}function Be(a,e){if(!e||e.stretch[1]<=0)return a;const s=1+e.stretch[1],t=a*Oe(e);return t<=e.stretch[0]?t:e.stretch[0]+(t-e.stretch[0])/s}const je="joji.prints.v1";function K0(){try{return JSON.parse(localStorage.getItem(je)||"[]")}catch{return[]}}function W0(a){try{localStorage.setItem(je,JSON.stringify(a))}catch{}}const Q0=[{id:"f-natural",name:"ناعم طبيعي",gender:"f",v:{smooth:.35,even:.3,undereye:.4,eyes:.1,nose:-.15,lipstick:.2,blush:.2},lip:"#c8576b",blush:"#f0a090"},{id:"f-doll",name:"دمية",gender:"f",v:{smooth:.5,even:.4,bright:.15,undereye:.5,eyes:.25,nose:-.3,noseW:-.2,faceSlim:.25,vshape:.2,lips:.15,lipstick:.35,blush:.35,liner:.35},lip:"#d0455e",blush:"#e0707a"},{id:"f-glam",name:"سهرة",gender:"f",v:{smooth:.4,even:.35,nose:-.2,contour:.5,highlight:.4,liner:.7,shadow:.4,brows:.3,lipstick:.6},lip:"#9b2335",shadow:"#6b4a5a"},{id:"f-redlip",name:"أحمر جريء",gender:"f",v:{smooth:.3,even:.3,lipstick:.75,liner:.5,contour:.3,brows:.2},lip:"#b8142e"},{id:"f-caramel",name:"كراميل",gender:"f",v:{smooth:.35,warm:.25,bright:.1,nose:-.15,eyes:.1,lipstick:.4,blush:.3,contour:.3,liner:.3},lip:"#c06a5a",blush:"#f08a7a"},{id:"m-clean",name:"نظيف",gender:"m",v:{smooth:.25,even:.3,undereye:.45,teeth:.3}},{id:"m-sharp",name:"ملامح حادة",gender:"m",v:{smooth:.2,even:.25,jaw:.25,chin:.15,faceSlim:.1,nose:-.1,beard:.3,browsM:.2}},{id:"m-fresh",name:"وجه منتعش",gender:"m",v:{smooth:.3,even:.3,bright:.2,undereye:.4,eyeGlow:.3,teeth:.25}}],Vt=a=>[1,3,5].map(e=>parseInt(a.slice(e,e+2),16)/255),Se={chin:152,forehead:10},d0=(a,e)=>[a[0]-e[0],a[1]-e[1]],g0=a=>Math.hypot(a[0],a[1]),se=(a,e)=>[(a[0]+e[0])/2,(a[1]+e[1])/2],p0=new Set(["الوجه","البشرة","مكياج","عناية","ذكاء"]),x0=["faceSlim","vshape","jaw","chin","forehead","nose","noseW","eyes","lips","dchin","smile","cheekbones","browLift","symmetry"];function Ge(a,e){if(!a.poses?.length)return a.pose?{P:a.pose,vis:a.poseVis??a.pose.map(()=>1)}:null;const s=a.faces[Math.min(e,a.faces.length-1)];let t=0;if(s&&a.poses.length>1){const o=[(s[234][0]+s[454][0])/2,(s[10][1]+s[152][1])/2];let n=1/0;a.poses.forEach((l,r)=>{const i=Math.hypot(l[0][0]-o[0],l[0][1]-o[1]);i<n&&(n=i,t=r)})}return{P:a.poses[t],vis:a.posesVis?.[t]??a.poses[t].map(()=>1)}}function v0(a,e,s=0){if(!e)return null;const t=_e.find(o=>o.id===a);if(!t||a==="reshape")return null;if(p0.has(t.group)){if(e.faces.length){const n=e.faceInfo?.[Math.min(s,e.faces.length-1)],l=["smooth","even","bright","warm","autoBeauty","blemish","matte"].includes(a),r=x0.includes(a);return n&&n.far&&r?"الوجه جانبي، وتعديل شكله يعوّج الملامح، فطفيته. أدوات البشرة والشعر والجسم تشتغل":n&&n.width<36&&!l?"الوجه صغير كلش بالصورة، فالملامح ما تبين بدقة. أدوات البشرة والجسم تشتغل":null}const o=e.scene?.face==="hidden"?"الوجه مغطى أو مو باين (يد، كبوس، راس منزّل، أو ظهر للكاميرا)":"ما لقيت وجه بالصورة";return["smooth","even","bright","warm"].includes(a)&&e.seg?null:o}if(a==="hairLen"){if(!e.seg)return"ما گدرت أفصل الشخص عن الخلفية";const o=e.faces[Math.min(s,e.faces.length-1)];return o?w0(e,o)?null:"طول الشعر يشتغل على الشعر النازل تحت الحنك، وهنا الشعر قصير أو مو باين":"طول الشعر يحتاج وجه باين"}if(t.group==="الشعر"||t.group==="الخلفية")return e.seg?null:"ما گدرت أفصل الشخص عن الخلفية";if(t.group==="الإضاءة")return e.seg?e.faces.length?null:"الضوء يحتاج وجه باين حتى يعرف شكله":"ما گدرت أفصل الشخص عن الخلفية";if(t.group==="الجسم"){const o=Ge(e,s);if(!o||!e.seg)return"ما لقيت جسم واضح";const n=$e(o.P,o.vis,e.scene?.turned??0),l="الجسم مايل أو مستلقي، وهاي الأداة تحتاج جسم واقف أو جالس معتدل";switch(a){case"bodySlim":case"waist":return n.upright?n.upper&&n.hips?null:"الخصر يحتاج الأكتاف والورك ظاهرين بالصورة":l;case"hips":return n.upright?n.hips?null:"الورك مو ظاهر بالصورة":l;case"shoulders":return n.upright?n.upper?null:"الأكتاف مو ظاهرة بالصورة":l;case"arms":return n.arms?null:"الذراعين مو ظاهرة بالصورة";case"legs":return n.legs?null:"الساقين مو ظاهرة بالصورة";case"height":return n.standing?null:"الطول يشتغل بس إذا الشخص واقف وكامل بالصورة"}}return null}const Fe=new WeakMap;function w0(a,e){let s=Fe.get(e);if(s===void 0){const t=Math.max(2,Math.round(a.segW/2)),o=Math.max(2,Math.round(a.segH/2));s=Ie(a,e,t,o,1,new Float32Array(t*o),new Float32Array(t*o)),Fe.set(e,s)}return s}function b0(a,e){return a?Math.atan2(a[10][1]-a[152][1],(a[10][0]-a[152][0])*e):-Math.PI/2}function y0(a,e,s,t,o=!1){const n=a.v.autoBeauty??0,l=a.gender==="m"?f0:m0,r=new Map,i=c=>c==="reshape"?0:(r.has(c)||r.set(c,!!v0(c,e,a.face)),r.get(c)?0:(a.v[c]??0)+n*(l[c]??0));if(!(a.liq.length>0||Object.entries(a.v).some(([c,m])=>c!=="reshape"&&Math.abs(m)>.004))||!e)return null;const f=e.w/e.h,k=c=>[c[0]*f,c[1]],N=[],M=e.faces[Math.min(a.face,e.faces.length-1)];let A=.25,E=null,R=null;if(M){const c=u=>M[u];A=g0(d0(k(c(Se.chin)),k(c(Se.forehead))));const m=e.faceInfo?.[Math.min(a.face,e.faces.length-1)]?.far??null;E={slim:i("faceSlim"),vshape:i("vshape"),jaw:i("jaw"),chin:i("chin"),forehead:i("forehead"),nose:i("nose"),noseW:i("noseW"),eyes:i("eyes"),lips:i("lips"),dchin:i("dchin"),smile:i("smile"),cheekbones:i("cheekbones"),browLift:i("browLift"),symmetry:i("symmetry")},R=m==="l"||m==="r"?m:null}let x=[0,0];const p=Ge(e,a.face),g=p?.P??null;let v=null,b=0;if(g&&e.seg){const c=se(g[11],g[12]),m=se(g[23],g[24]),u=Math.abs(m[1]-c[1])||.2;v={slim:i("bodySlim"),waist:i("waist"),hips:i("hips"),shoulders:i("shoulders"),arms:i("arms"),legs:i("legs"),tight:a.lock},b=i("height"),b&&!(a.lock&&o)&&(x=[Math.min(.95,m[1]+u*.1),.2*b])}const F=M?i("hairVol"):0,P=M?i("hairLen"):0,I=b>.004&&a.lock&&o,L=JSON.stringify([v,E,R,F,P,a.lock,I?b:0])+"|"+a.face+"|"+t+"|"+e.w+"x"+e.h;if(L!==Ee){Ee=L,oe=null;let c=null;if(v&&g)for(let m=1,u=0;u<6;u++,m*=.8){const d={...v,slim:v.slim*m,waist:v.waist*m,hips:v.hips*m,shoulders:v.shoulders*m,arms:v.arms*m,legs:v.legs*m};if(c=s0(e,g,p.vis,d),!c)break;const y=c.w*c.h,G=new Float32Array(y),S=new Float32Array(y);for(let X=0;X<y;X++)G[X]=c.data[X*2]*c.w,S[X]=c.data[X*2+1]*c.h;const[T,U]=pe(G,S,c.w,c.h);if(T>=.72&&U<=1.4)break}if(M&&E&&Object.values(E).some(m=>Math.abs(m)>.004)){const m=Math.min(1,640/Math.max(e.w,e.h)),u=c?.w??Math.max(2,Math.round(e.w*m)),d=c?.h??Math.max(2,Math.round(e.h*m)),y=new Float32Array(u*d),G=new Float32Array(u*d),S=e.seg,T=e.segW,U=e.segH;c0(M,u,d,E,R,y,G,S?(J,q,K)=>{let lt=0,bt=0;for(const[ft,Z]of[[0,0],[1.5,0],[-1.5,0],[0,1.5],[0,-1.5]]){const V=Math.min(T-1,Math.max(0,Math.floor((J+ft)/u*T))),$=Math.min(U-1,Math.max(0,Math.floor((q+Z)/d*U)))*T+V;lt+=K?S[2][$]+S[4][$]+S[5][$]:S[4][$]+S[5][$],bt++}return u0(.35,.75,lt/bt)}:void 0);const W=c?.data??new Float32Array(u*d*2);for(let J=0;J<u*d;J++)W[J*2]+=y[J]/u,W[J*2+1]+=G[J]/d;c={w:u,h:d,data:W,solid:c?.solid,lockw:c?.lockw}}if(M&&F>.004){const m=Math.min(1,640/Math.max(e.w,e.h)),u=c?.w??Math.max(2,Math.round(e.w*m)),d=c?.h??Math.max(2,Math.round(e.h*m));for(let y=1,G=0;G<5;G++,y*=.75){const S=new Float32Array(u*d),T=new Float32Array(u*d),U=a.lock?new Float32Array(u*d):void 0;if(!n0(e,M,u,d,F*y,S,T,U))break;const[X,W]=pe(S,T,u,d);if(X>=.45&&W<=1.9||G===4){const J=c?.data??new Float32Array(u*d*2);for(let K=0;K<u*d;K++)J[K*2]+=S[K]/u,J[K*2+1]+=T[K]/d;let q=c?.lockw;if(U){q??=new Float32Array(u*d);for(let K=0;K<u*d;K++)q[K]=Math.max(q[K],U[K])}c={w:u,h:d,data:J,solid:c?.solid??(U?ge(Me(e,u,d),u,d):void 0),lockw:q};break}}}if(M&&P>.004){const m=Math.min(1,640/Math.max(e.w,e.h)),u=c?.w??Math.max(2,Math.round(e.w*m)),d=c?.h??Math.max(2,Math.round(e.h*m)),y=new Float32Array(u*d),G=c?.lockw??new Float32Array(u*d);if(Ie(e,M,u,d,P,y,G)){const S=c?.data??new Float32Array(u*d*2);for(let T=0;T<u*d;T++)S[T*2+1]+=y[T]/d;c={w:u,h:d,data:S,solid:c?.solid,lockw:G}}}if(I&&g){const m=Math.min(1,640/Math.max(e.w,e.h)),u=c?.w??Math.max(2,Math.round(e.w*m)),d=c?.h??Math.max(2,Math.round(e.h*m)),y=new Float32Array(u*d),G=Me(e,u,d),S=new Float32Array(u*d);if(i0(g,p.vis,u,d,b,y,G,S)){const T=new Float32Array(u*d*2),U=c?.data,X=c?.lockw;for(let J=0;J<d;J++)for(let q=0;q<u;q++){const K=J*u+q,lt=J+y[K];let bt=0,ft=0,Z=0;const V=Math.max(0,Math.min(d-1,Math.floor(lt))),rt=Math.min(d-1,V+1),$=Math.max(0,Math.min(1,lt-V));U&&(bt=U[(V*u+q)*2]*(1-$)+U[(rt*u+q)*2]*$,ft=U[(V*u+q)*2+1]*(1-$)+U[(rt*u+q)*2+1]*$),X&&(Z=X[V*u+q]*(1-$)+X[rt*u+q]*$),T[K*2]=bt,T[K*2+1]=y[K]/d+ft,S[K]=Math.abs(Z)>S[K]?Z:S[K]}const W=c?.solid??ge(G,u,d);c={w:u,h:d,data:T,solid:W,lockw:S}}else{const T=se(g[11],g[12]),U=se(g[23],g[24]);oe=[Math.min(.95,U[1]+(Math.abs(U[1]-T[1])||.2)*.1),.2*b]}}Ae=c,Re++}I&&oe&&(x=oe);for(const[c,m,u,d,y]of a.liq)N.push({c:[c,m],r:u,type:1,v:[d,y],s:0,lock:!1});const C=Math.min(64,N.length),O=new Float32Array(256),_=new Float32Array(256),j=N.length-C;for(let c=0;c<C;c++){const m=N[j+c],u=Math.hypot(m.v[0]*f,m.v[1]),d=m.r*.45;m.type===1&&u>d&&(m.v=[m.v[0]*d/u,m.v[1]*d/u]),m.type===0&&(m.s=Math.max(-.45,Math.min(.6,m.s))),O.set([m.c[0],m.c[1],Math.max(.005,m.r),m.type],c*4),_.set([m.v[0],m.v[1],m.s,m.face?2:m.lock?1:0],c*4)}const z=a.bg==="transparent"?[1,1,1,0]:[...Vt(a.bg),1],D=c=>a.gender==="m"&&(c==="smooth"||c==="even")?.6:1;return{n:C,opA:O,opB:_,lock:a.lock?1:0,b:[i("smooth")*D("smooth"),i("even")*D("even"),i("bright"),i("warm"),i("undereye"),i("teeth"),i("eyeGlow"),i("lipstick"),i("blush"),i("shadow"),Math.max(i("brows"),i("browsM")),i("beard"),i("hairColor"),i("hairShine"),i("bgBlur"),i("bgSwap"),i("contour"),i("highlight"),i("liner"),i("lens"),i("hairFill"),i("blemish"),i("matte"),i("bgPop"),i("bgLight"),i("bgSat"),i("bgTint"),i("subjLight"),i("bgKill")],b2:[i("eyeWhite"),i("redEye"),i("catchlight"),i("wrinkles"),i("freckles"),i("tan"),i("greyCover"),i("hairline"),i("studio"),i("sideLight"),i("sculpt"),b0(M,f)],eyes:s?.eyes?.map((c,m)=>R==="r"&&m===0||R==="l"&&m===1?{...c,vis:0}:c),field:Ae,fieldVersion:Re,lip:Vt(a.lip),blush:Vt(a.blush),shadow:Vt(a.shadow),hair:Vt(a.hair),bg:z,lens:Vt(a.lens??"#5a86b8"),bgT:Vt(a.bgT??"#2a6cff"),bgOff:Array.from({length:8},(c,m)=>a.bgOff?.includes(m)?1:0),stretch:x,skinR:A*.022,bgBlur:.035,masksVersion:t,masks:s}}const M0=[{id:"glow",name:"توهج",icon:"Sun",variants:["أبيض","دافي"],hint:"الأضواء تنتشر بنعومة مثل عدسة سينما"},{id:"halation",name:"هالة فيلم",icon:"CircleDot",hint:"حافة حمرة دافية حول الأضواء، مثل فيلم الكاميرات القديمة"},{id:"haze",name:"ضباب حالم",icon:"Haze",variants:["أبيض","دافي","بارد"],hint:"نعومة وضباب خفيف مثل صور الصبح"},{id:"dust",name:"غبار ضوء",icon:"Sparkles",hint:"ذرات غبار صغيرة تلمع بالضوء"},{id:"orbs",name:"كرات ضوء",icon:"CircleDashed",variants:["ذهبي","مدينة","وردي","أزرق"],hint:"أضواء بعيدة مضببة (بوكيه)"},{id:"rain",name:"مطر",icon:"CloudRain",variants:["خفيف","غزير"],hint:"خيوط مطر وجو مبلل"},{id:"leak",name:"تسريب ضوء",icon:"Flame",variants:["دافي","أحمر","وردي","ألوان"],hint:"ضوء يدخل من طرف الفيلم"},{id:"blinds",name:"ظل الشباك",icon:"Blinds",variants:["ستارة","أوراق","شباك"],hint:"شمس داخلة من شباك وترسم ظل"},{id:"caustic",name:"ضوء الماي",icon:"Waves",hint:"انعكاس ضوء الماي على الوجه والجسم"},{id:"flare",name:"شمس",icon:"SunMedium",variants:["يمين","يسار"],hint:"شمس داخلة للعدسة"},{id:"prism",name:"انكسار",icon:"Triangle",hint:"ألوان تنفصل على الأطراف مثل عدسة قديمة"}],te=12,$0=[{name:"أحمر",h:0,css:"#e5484d"},{name:"برتقالي",h:30,css:"#f08c3a"},{name:"أصفر",h:60,css:"#e9c949"},{name:"أخضر",h:120,css:"#4cb86a"},{name:"سماوي",h:180,css:"#3fc1c9"},{name:"أزرق",h:225,css:"#3f78e0"},{name:"بنفسجي",h:275,css:"#8b5cf6"},{name:"وردي",h:320,css:"#e04fa8"}],ze=()=>({e:new Array(te).fill(0),v:new Array(te).fill(0),seed:.37,hsl:new Array(24).fill(0),grade:[.58,0,.1,0,.09,0,0,0,0,.4]}),k0=a=>M0.findIndex(e=>e.id===a);function Le(a){return a?{effects:a.e.some(e=>e>.004),mix:a.hsl.some(e=>Math.abs(e)>.004),grade:a.grade[1]>.004||a.grade[3]>.004||a.grade[5]>.004||a.grade[8]>.004}:{effects:!1,mix:!1,grade:!1}}function He(a,e,s){const t=a??ze(),o=new Float32Array(te),n=new Float32Array(te);for(let l=0;l<te;l++)o[l]=t.e[l]??0,n[l]=t.v[l]??0;if(e)for(const[l,r]of Object.entries(e)){const i=k0(l);if(i<0||r==null)continue;const[h,f]=Array.isArray(r)?r:[r,0];o[i]<.004&&(n[i]=f),o[i]=Math.min(1,o[i]+h*s)}return{e:o,v:n,seed:t.seed,hsl:new Float32Array(t.hsl),grade:new Float32Array(t.grade),on:o.some(l=>l>.004)||Le(t).mix||Le(t).grade}}function T0(a){return Math.max(a[0],a[1],a[2],a[10])>.004?.045:0}const Gt=["exposure","brightness","contrast","highlights","shadows","whites","blacks","saturation","vibrance","temperature","tint","fade","clarity","sharpness","vignette","grain","split","bw","texture","dehaze","noise","noiseColor"],E0=new Set(["sharpness","grain","bw","split","noise","noiseColor"]),xe=()=>Object.fromEntries(Gt.map(a=>[a,0])),ie=()=>[[0,0],[1,1]],A0=()=>({rgb:ie(),r:ie(),g:ie(),b:ie()}),ee=()=>({params:xe(),curves:A0(),filterId:null,filterAmount:1,crop:{x:0,y:0,w:1,h:1},ratio:"free",rot:0,flip:!1,auto:!1,autoAmt:1,beauty:h0(),fx:ze(),ov:[]}),Ot=a=>JSON.parse(JSON.stringify(a));function Z0(a){const e=ee();return e.crop={...a.crop},e.ratio=a.ratio,e.rot=a.rot,e.flip=a.flip,e.src=0,e}function ta(a){return a.length===2&&a[0][0]===0&&a[0][1]===0&&a[1][0]===1&&a[1][1]===1}class ea{stack=[];labels=[];thumbs=[];i=-1;push(e,s="",t=null){const o=JSON.stringify(e);return this.stack[this.i]===o?!1:(this.stack=this.stack.slice(0,this.i+1),this.labels=this.labels.slice(0,this.i+1),this.thumbs=this.thumbs.slice(0,this.i+1),this.stack.push(o),this.labels.push(s),this.thumbs.push(t),this.stack.length>80&&(this.stack.shift(),this.labels.shift(),this.thumbs.shift()),this.i=this.stack.length-1,!0)}undo(){return this.i<=0?null:JSON.parse(this.stack[--this.i])}redo(){return this.i>=this.stack.length-1?null:JSON.parse(this.stack[++this.i])}goto(e){return e<0||e>=this.stack.length||e===this.i?null:(this.i=e,JSON.parse(this.stack[e]))}peek(e){return e>=0&&e<this.stack.length?JSON.parse(this.stack[e]):null}get steps(){return this.stack.map((e,s)=>({label:this.labels[s],thumb:this.thumbs[s]}))}get index(){return this.i}get last(){return this.i>=0?JSON.parse(this.stack[this.i]):null}setThumb(e,s){e>=0&&e<this.thumbs.length&&(this.thumbs[e]=s)}get canUndo(){return this.i>0}get canRedo(){return this.i<this.stack.length-1}reset(e,s=null){this.stack=[JSON.stringify(e)],this.labels=["الأصلية"],this.thumbs=[s],this.i=0}}const Tt=(a,e=0,s=1)=>a<e?e:a>s?s:a,St=(a,e,s)=>{const t=Tt((s-a)/(e-a));return t*t*(3-2*t)},Kt=(a,e,s)=>.2126*a+.7152*e+.0722*s;function ne(a,e,s){const t=Math.min(Math.abs(a-e),360-Math.abs(a-e)),o=Math.max(0,1-t/s);return o*o*(3-2*o)}function Pe(a,e,s){const t=Math.max(a,e,s),o=Math.min(a,e,s),n=(t+o)/2,l=t-o;if(l<1e-6)return[0,0,n];const r=l/(1-Math.abs(2*n-1)+1e-6);return[((t===a?(e-s)/l%6:t===e?(s-a)/l+2:(a-e)/l+4)*60+360)%360,Tt(r),n]}function me(a,e,s){a=(a%360+360)%360;const t=(1-Math.abs(2*s-1))*e,o=t*(1-Math.abs(a/60%2-1)),n=s-t/2,[l,r,i]=a<60?[t,o,0]:a<120?[o,t,0]:a<180?[0,t,o]:a<240?[0,o,t]:a<300?[o,0,t]:[t,0,o];return[l+n,r+n,i+n]}function De(a,e){let s=Tt(a);e.crush&&(s=s*(1-e.crush*(1-St(0,.35,s))*.6)),e.gamma&&(s=Math.pow(s,Math.pow(2,-e.gamma)));const t=e.con??0;if(t>0){const r=1+t*5,i=h=>1/(1+Math.exp(-r*(h-.42)));s=(i(s)-i(0))/(i(1)-i(0))}else t<0&&(s=s+(.45-s)*-t*.6*(1-Math.abs(2*s-1)*.3));const o=e.toe??0,n=e.cap??1;return s=s<.8?s:.8+(1-Math.exp(-(s-.8)*5))*.2/(1-Math.exp(-1)),o+(n-o)*s}function R0(a,e,s,t){let[o,n,l]=Pe(a,e,s);const r=ne(o,24,26)*St(.08,.25,n)*(1-St(.55,.85,n))*St(.12,.3,l)*(1-St(.8,.95,l));{let L=0,C=1,O=0;const _=[[108,52,-18,(t.greens??.6)/Math.max(1,t.sat??1)**1.5,-.08],...t.hue??[]];for(const[j,z,D,c,m]of _){const u=ne(o,j,z)*St(.04,.2,n);L+=D*u,C*=1+(c-1)*u,O+=m*u*n}o+=L,n=Tt(n*C),l=Tt(l+O*.3)}let[i,h,f]=me(o,n,l);const k=Kt(i,h,f),N=1-St(.05,.45,k),M=St(.55,.95,k),A=(t.sat??1)*(1+((t.satSh??1)-1)*N)*(1+((t.satHi??1)-1)*M);if(i=k+(i-k)*A,h=k+(h-k)*A,f=k+(f-k)*A,A>1){const L=1-(A-1)*.12*n;i*=L,h*=L,f*=L}if(t.mono){const L=t.mixR??[.2126,.7152,.0722],C=Tt(i*L[0]+h*L[1]+f*L[2]);let O=t.mono;t.keep&&(O*=1-ne(o,t.keep[0],t.keep[1])*St(.15,.4,n)),i+=(C-i)*O,h+=(C-h)*O,f+=(C-f)*O}const E=Math.max(1e-4,Kt(i,h,f)),R=De(E,t),x=R/E,p=L=>.6*(L*x)+.4*De(L,t);i=p(i),h=p(h),f=p(f);const g=Tt(R),v=Math.pow(1-St(0,.55,g),1.5),b=St(.45,1,g),F=Math.max(0,1-v-b),P=(L,C)=>{L&&(i+=L[0]*C,h+=L[1]*C,f+=L[2]*C)};P(t.sh,v),P(t.mid,F),P(t.hi,b);const I=(L,C)=>{if(!L||C<=0)return;const[O,_]=L,j=Kt(i,h,f),z=Math.max(.05,Kt(O[0],O[1],O[2])),D=_*C;i+=(j*O[0]/z-i)*D,h+=(j*O[1]/z-h)*D,f+=(j*O[2]/z-f)*D};if(I(t.gelSh,v),I(t.gelMid,F),I(t.gelHi,b),t.skin&&r>0){const L=Kt(i,h,f),[C,O,_]=me(24+(o-24)*.5,Tt(Math.min(n,.55)*Math.min(1.1,t.sat??1)),.5),j=Kt(C,O,_),z=t.skinWarm??0,D=[L+(C-j)*(1+z),L+(O-j),L+(_-j)*(1-z*.5)],c=t.skin*r*(t.mono?0:1);i+=(D[0]-i)*c,h+=(D[1]-h)*c,f+=(D[2]-f)*c}if((t.greens??.6)<1){const[L,C,O]=Pe(Tt(i),Tt(h),Tt(f)),_=ne(L,105,48)*St(.35,.8,C);_>0&&([i,h,f]=me(L-8*_,C+(Math.min(C,.42)-C)*_,O*(1-.12*_)))}return[Tt(i),Tt(h),Tt(f)]}const B0=[{id:"nightcall",name:"نايت كول",ref:1,def:{crush:.5,gamma:-.8,con:.4,sat:.75,gelMid:[[1,.62,.32],.45],gelHi:[[1,.8,.55],.4],sh:[.012,.004,-.01],skin:.25}},{id:"dust",name:"غبار السينما",ref:2,def:{toe:.12,cap:.86,gamma:-.25,con:.3,sat:.6,sh:[-.06,.02,.012],mid:[.01,.005,-.04],hi:[.05,0,-.07],hue:[[0,30,0,1.4,0]],skin:.4}},{id:"redroom",name:"غرفة حمراء",ref:3,def:{crush:.4,gamma:-.6,con:.4,sat:1.1,gelSh:[[.3,.22,.4],.45],gelMid:[[1,.15,.18],.8],gelHi:[[1,.55,.5],.4],greens:.4}},{id:"lowkey",name:"ظل",ref:4,def:{toe:.03,cap:.78,gamma:-.9,con:.3,sat:.35,gelSh:[[.35,.5,.48],.35],mid:[-.01,.006,0],skin:.5,greens:.5}},{id:"nightflash",name:"فلاش الليل",ref:5,def:{crush:1,gamma:-.6,con:.75,sat:.55,gelSh:[[.35,.45,.7],.3],gelHi:[[1,.94,.86],.3],skin:.4,greens:.5}},{id:"neonrain",name:"مطر النيون",ref:6,def:{toe:.15,gamma:-.15,con:.25,sat:1.1,gelSh:[[.8,.4,.9],.32],gelMid:[[1,.85,.45],.5],gelHi:[[1,.95,.65],.35],hue:[[330,40,0,1.3,0]],skin:.2}},{id:"redcyan",name:"أحمر وسماوي",ref:7,def:{gamma:-.45,con:.5,sat:1.2,gelSh:[[.9,.05,.1],.65],gelMid:[[1,.15,.18],.55],gelHi:[[.5,.95,1],.65],greens:.4}},{id:"tealfilm",name:"فيلم تيل",ref:8,def:{toe:.11,cap:.86,con:.2,sat:.62,sh:[-.02,.012,.004],mid:[-.06,.025,-.005],hi:[-.05,.02,-.02],hue:[[110,50,40,.8,0],[0,30,0,.95,0]],skin:.5}},{id:"amber",name:"شباك العصر",ref:9,def:{crush:.45,gamma:-.45,con:.45,sat:1.05,sh:[0,.004,-.004],gelMid:[[1,.52,.18],.45],gelHi:[[1,.78,.5],.3],skinWarm:.1,greens:.5}},{id:"fire",name:"نار",ref:10,def:{gamma:-.3,con:.5,sat:1.25,gelMid:[[1,.42,.08],.5],gelHi:[[1,.62,.25],.4],sh:[-.02,.01,.02],greens:.45}},{id:"tealorange",name:"برتقالي وتيل",ref:11,def:{crush:.3,gamma:-.15,con:.5,sat:1.15,gelSh:[[.1,.55,.65],.4],gelHi:[[1,.72,.42],.3],hue:[[215,60,-8,1.12,0],[30,30,0,1.3,0],[110,50,50,.8,0]],skin:.55}},{id:"homewarm",name:"دفء البيت",ref:12,def:{toe:.08,cap:.9,gamma:.05,con:-.12,sat:.95,gelMid:[[1,.7,.48],.42],gelHi:[[1,.86,.68],.32],sh:[.02,-.01,.015],skin:.25}},{id:"gypsy",name:"غجري",ref:13,def:{crush:.6,gamma:-.4,con:.35,sat:.9,gelSh:[[.4,.55,.4],.38],gelMid:[[1,.7,.45],.36],skin:.3}},{id:"street",name:"شارع حي",ref:14,def:{crush:.35,gamma:-.2,con:.7,sat:.7,gelSh:[[.45,.55,.65],.35],hi:[.03,.01,-.03],hue:[[0,30,0,1.4,0]],skin:.45}},{id:"polaroid70",name:"بولارويد ٧٠",ref:15,def:{toe:.15,cap:.87,gamma:-.1,con:.35,sat:.55,gelSh:[[.35,.55,.45],.4],gelMid:[[1,.78,.5],.3],gelHi:[[1,.92,.7],.3]}},{id:"grit",name:"خشن",ref:16,def:{toe:.05,cap:.97,con:.75,sat:.4,mono:.65,mid:[.02,0,-.02],skin:.2}},{id:"goldenblue",name:"شمس وظل",ref:17,def:{gamma:-.4,con:.4,sat:.85,gelSh:[[.3,.5,1],.45],gelHi:[[1,.8,.45],.45],skin:.35}},{id:"dusk",name:"شفق",ref:18,def:{gamma:-.35,con:.35,sat:1.2,gelSh:[[.5,.3,1],.42],gelHi:[[1,.55,.3],.45],mid:[.04,-.02,0]}},{id:"beige",name:"بيج",ref:19,def:{toe:.15,cap:.86,gamma:.12,con:-.2,sat:.45,gelMid:[[1,.86,.68],.4],gelHi:[[1,.95,.85],.3],skin:.4}},{id:"honeyhalo",name:"عسل غامق",ref:20,def:{crush:.45,gamma:-.5,con:.4,sat:1,gelMid:[[1,.55,.25],.5],gelHi:[[1,.8,.55],.3],greens:.5}},{id:"storm",name:"عاصفة ذهبية",ref:21,def:{gamma:-.4,con:.6,sat:1.1,gelSh:[[.25,.45,.9],.42],gelHi:[[1,.7,.35],.5],skin:.3}},{id:"bluelight",name:"ضوء أزرق",ref:22,def:{gamma:-.35,con:.45,sat:.9,sh:[-.01,0,.02],gelMid:[[.4,.82,1],.45],gelHi:[[.6,.92,1],.45]}},{id:"bluenight",name:"ليل أزرق",ref:23,def:{gamma:-.5,con:.3,sat:1.25,sh:[0,-.01,.08],mid:[-.06,-.01,.12],hi:[-.06,.02,.04]}},{id:"morning",name:"حلم الصبح",ref:24,def:{toe:.15,gamma:.1,con:-.08,sat:.8,gelMid:[[1,.82,.6],.3],gelHi:[[1,.88,.62],.38],skin:.3}},{id:"frappe",name:"كراميل فرابيه",ref:25,def:{toe:.08,cap:.93,gamma:.12,con:-.12,sat:.75,gelMid:[[1,.8,.74],.32],gelHi:[[1,.88,.8],.32],hue:[[0,30,0,.9,0]],skin:.4,skinWarm:.1}},{id:"coffee",name:"قهوة",ref:27,def:{crush:.7,gamma:-.8,cap:.85,con:.4,sat:.8,gelMid:[[1,.66,.42],.42],gelHi:[[1,.8,.6],.3]}},{id:"velvet",name:"مخمل",ref:28,def:{toe:.08,cap:.86,gamma:-.35,con:.35,sat:.95,gelSh:[[.18,.5,.46],.5],mid:[.08,-.02,-.07],hue:[[0,30,-5,1.5,0],[120,60,50,.8,-.1]]}}],Zt=[[0,0],[1,1]],_t=(a=Zt,e=Zt,s=Zt,t=Zt)=>({rgb:a,r:e,g:s,b:t}),fe=(a=.06)=>[[0,0],[.25,.25-a],[.75,.75+a],[1,1]],Wt=(a=.08,e=.95)=>[[0,a],[.25,.25+a*.4],[.75,.76],[1,e]],qe=a=>{let e="";for(let s=0;s<a.length;s+=32768)e+=String.fromCharCode(...a.subarray(s,s+32768));return btoa(e)};function S0(a){const e=atob(a.d),s=new Uint8Array(e.length);for(let t=0;t<e.length;t++)s[t]=e.charCodeAt(t);return s}function Xe(a,e){const s=new Uint8Array(a*a*a*3),t=a*a;for(let o=0;o<a;o++)for(let n=0;n<a;n++)for(let l=0;l<a;l++){const r=e(l/(a-1),n/(a-1),o/(a-1)),i=(n*t+o*a+l)*3;for(let h=0;h<3;h++)s[i+h]=Math.round(Math.max(0,Math.min(1,r[h]))*255)}return{n:a,d:qe(s)}}const F0=(a,e,s)=>.3*a+.59*e+.11*s;function L0(a,e,s){const t=Math.max(a,e,s),o=Math.min(a,e,s),n=(t+o)/2,l=t-o;if(l<1e-6)return[0,0,n];const r=l/(1-Math.abs(2*n-1));return[((t===a?(e-s)/l%6:t===e?(s-a)/l+2:(a-e)/l+4)*60+360)%360,r,n]}function Pt(a,e,s){const t=(1-Math.abs(2*s-1))*e,o=t*(1-Math.abs(a/60%2-1)),n=s-t/2,[l,r,i]=a<60?[t,o,0]:a<120?[o,t,0]:a<180?[0,t,o]:a<240?[0,o,t]:a<300?[o,0,t]:[t,0,o];return[l+n,r+n,i+n]}const at=(a,e,s)=>{const t=Math.min(Math.abs(a-e),360-Math.abs(a-e));return Math.max(0,1-t/s)},H=(a,e)=>a+e*(a-a*a)*(2*a-1);function mt(a){if(!(typeof btoa>"u"))return Xe(25,(e,s,t)=>{let[o,n,l]=L0(e,s,t);const r=F0(e,s,t);if(a==="teal"){const x=at(o,28,30);o=o+(30-o)*x*.4,n=n*(1+.25*x);const p=Math.max(at(o,200,80),at(o,120,50))*(1-x);o=o+(190-o)*p*.5;let[g,v,b]=Pt(o,Math.min(1,n),l);const F=1-Math.min(1,r*2),P=Math.max(0,r*2-1);return g+=-.04*F+.05*P,v+=.02*F+.015*P,b+=.05*F-.04*P,[H(g,.25),H(v,.25),H(b,.25)]}if(a==="warmfilm"){let[p,g,v]=Pt(o,n*(1-.3*at(o,110,60))*.95,l);return p=.05+(1-.05)*H(p,.3)+.03*r,g=.05*.9+(1-.05)*H(g,.3)+.01*r,v=.05*1.1+(1-.05)*H(v,.3)*.92,[p,g,v]}if(a==="olive"){const x=at(o,110,60);o=o+(75-o)*x*.6,n=n*(1-.45*x);const p=at(o,215,50);n=n*(1-.2*p),l=l*(1-.08*p);const[g,v,b]=Pt(o,n,l);return[H(g,.2)+.015,H(v,.2)+.01,H(b,.2)-.01]}if(a==="bleach"){const p=e+(r-e)*.55,g=s+(r-s)*.55,v=t+(r-t)*.55;return[H(p,.55),H(g,.55),H(v,.55)]}const i=Math.max(0,1-r*2),h=Math.max(0,r*2-1),f=1-i-h,k=at(o,25,22)*Math.min(1,n*3);if(a==="sodium"){const x=H(r,.35),p=x<.5?[.05+x*2*.72,.03+x*2*.36,.02+x*2*.07]:[.77+(x-.5)*2*.23,.39+(x-.5)*2*.47,.09+(x-.5)*2*.43],g=.72;return[e+(p[0]-e)*g,s+(p[1]-s)*g,t+(p[2]-t)*g]}if(a==="sunsetgold"){const x=at(o,30,40);o=o+(32-o)*x*.4,n=Math.min(1,n*(1+.35*x));const p=Math.max(at(o,205,70),at(o,150,45))*(1-x);o=o+(188-o)*p*.6,n=Math.min(1,n*(1+.15*p));let[g,v,b]=Pt(o,n,l);return g+=-.06*i+.09*h+.02*f,v+=.025*i+.04*h,b+=.07*i-.08*h-.02*f,[H(g,.35),H(v,.35),H(b,.35)]}if(a==="neon"){const x=at(o,355,40)*(1-k*.7),p=at(o,220,70),g=at(o,110,50);o=o+((o>180?330:-30)-o)*x*.35,o=o+(195-o)*p*.4,n=Math.min(1,n*(1+.45*(1-k*.6))*(1-.4*g));let[v,b,F]=Pt((o+360)%360,n,l);return v+=.04*i+.05*h,b-=.03*i-0*h,F+=.1*i+.04*h,[H(v,.45)-.01,H(b,.45)-.01,H(F,.45)]}if(a==="sepia"){const x=H(r,.25),p=.07,v=p+(.93-p)*x,b=.15,F=[v*1.1+.02,v*.96+.01,v*.76];return[F[0]+(e-r)*b,F[1]+(s-r)*b,F[2]+(t-r)*b]}if(a==="redteal"){const x=Math.max(at(o,5,30),at(o,355,30))*(1-k*.5);n=Math.min(1,n*(1+.45*x));const p=at(o,45,35)*(1-x);o=o+(28-o)*p*.5,n=n*(1-.15*p);const g=(o>85&&o<290?1:0)*Math.min(1,n*4);o=o+(186-o)*g*.7;let[v,b,F]=Pt(o,Math.min(1,n),l);return v+=-.05*i,b+=.03*i,F+=.05*i,[H(v,.3),H(b,.3),H(F,.3)]}if(a==="dusk"){let[g,v,b]=Pt(o,n*.85,l);return g=.09+.02+(.95-.09)*H(g,.12)+.035*f,v=.09+(.95-.09-.02)*H(v,.12)+.005*f,b=.09+.01+(.95-.09-.05)*H(b,.12),[g,v,b]}if(a==="rainnight"){const x=at(o,215,60);n=n*(1-.45*x);const p=at(o,100,60);o=o+(85-o)*p*.4;let[g,v,b]=Pt(o,n*.9,l);return g+=-.03*i+.06*h,v+=.03*i+.045*h,b+=.005*i-.06*h,[H(g,.3)+.01,H(v,.3)+.012,H(b,.3)]}const N=x=>[r+(e-r)*x,r+(s-r)*x,r+(t-r)*x];if(a==="keepred"){const x=Math.max(at(o,355,28),at(o,5,22))*Math.min(1,Math.max(0,n-.25)*2.5),p=Math.min(1,x*1.3+k*.12),[g,v,b]=N(p);return[H(g,.25),H(v,.25),H(b,.25)]}if(a==="keepwarm"){const x=Math.max(at(o,30,45),at(o,355,25))*Math.min(1,n*3),[p,g,v]=N(Math.min(1,x*1.15));return[H(p,.22)+.01,H(g,.22),H(v,.22)-.01]}if(a==="redlight"){const x=H(r,.3),p=[Math.min(1,x*1.35+.02),x*.38,x*.4],g=.5*Math.min(1,r*2.2),v=.03+e*.5,b=.05+s*.55,F=.07+t*.6;return[v+(p[0]-v)*g,b+(p[1]-b)*g,F+(p[2]-F)*g]}if(a==="moody"){const[x,p,g]=N(.4+k*.35),v=x-.04*i+.02*h,b=p+.015*i+.01*h,F=g+.01*i-.02*h;return[H(v,.4)*.94,H(b,.4)*.94,H(F,.4)*.94]}if(a==="caramel"){const x=Math.max(at(o,355,25),at(o,10,20)),p=at(o,210,70);n=n*(.8+.3*x)*(1-.65*p);let[g,v,b]=Pt((o+360)%360,Math.min(1,n),l);const F=.07;return g=F+.02+(.95-F)*H(g,.25)+.04*f,v=F+(.93-F)*H(v,.25)+.015*f,b=F-.01+(.86-F)*H(b,.25),[g,v,b]}if(a==="violet"){const[x,p,g]=Pt(o,n*.9,l),v=at(o,35,30)*h,b=x+.05*i+.02*f+.04*v,F=p-.03*i-.01*f,P=g+.1*i+.03*f-.05*v;return[H(b,.35),H(F,.35),H(P,.35)]}const[M,A,E]=Pt(o,Math.min(1,n*1.1),l),R=Math.max(0,r-.35);return[M+.06*R+.02,A+.03*R+.005,E-.05*R-.01]})}function aa(a){let e=0;const s=[];let t=[0,0,0],o=[1,1,1];for(const h of a.split(/\r?\n/)){const f=h.trim();if(!f||f.startsWith("#"))continue;const k=f.split(/\s+/);if(k[0]==="LUT_3D_SIZE"){e=parseInt(k[1],10);continue}if(k[0]==="DOMAIN_MIN"){t=k.slice(1,4).map(Number);continue}if(k[0]==="DOMAIN_MAX"){o=k.slice(1,4).map(Number);continue}/^[A-Z_]/.test(k[0])||k.length>=3&&s.push(+k[0],+k[1],+k[2])}if(!(e>=2&&e<=65)||s.length<e*e*e*3)return null;const n=Math.min(e,33),l=h=>Math.round(h*(e-1)/(n-1)),r=new Uint8Array(n*n*n*3),i=n*n;for(let h=0;h<n;h++)for(let f=0;f<n;f++)for(let k=0;k<n;k++){const N=(l(k)+l(f)*e+l(h)*e*e)*3,M=(f*i+h*n+k)*3;for(let A=0;A<3;A++)r[M+A]=Math.round(Math.max(0,Math.min(1,(s[N+A]-t[A])/(o[A]-t[A]||1)))*255)}return{n,d:qe(r)}}const oa=["سينما","أجواء","أساسي","احترافي","دافئ","بارد","سينمائي","ناعم","فيلم","أبيض وأسود"],re=[{id:"clear",name:"صافي",group:"أساسي",params:{contrast:.12,vibrance:.25,clarity:.15,sharpness:.15}},{id:"vivid",name:"حيوي",group:"أساسي",params:{contrast:.2,saturation:.18,vibrance:.35,shadows:.1},curves:_t(fe(.04))},{id:"bright",name:"مشرق",group:"أساسي",params:{exposure:.15,brightness:.18,shadows:.25,highlights:-.2,vibrance:.15}},{id:"crisp",name:"حاد",group:"أساسي",params:{contrast:.3,clarity:.4,sharpness:.3,blacks:-.15}},{id:"deep",name:"عميق",group:"أساسي",params:{exposure:-.1,contrast:.25,saturation:.1,highlights:-.3,vignette:.25},curves:_t(fe(.05))},{id:"warm",name:"دافئ",group:"دافئ",params:{temperature:.35,tint:.05,vibrance:.15,contrast:.05}},{id:"golden",name:"ذهبي",group:"دافئ",params:{temperature:.45,saturation:.05,highlights:-.15,fade:.1,split:.5},shadow:[.48,.45,.52],highlight:[.62,.54,.4]},{id:"sunset",name:"غروب",group:"دافئ",params:{temperature:.5,tint:.15,contrast:.15,saturation:.1,vignette:.2,split:.6},shadow:[.45,.42,.55],highlight:[.65,.5,.38]},{id:"honey",name:"عسلي",group:"دافئ",params:{temperature:.3,brightness:.1,fade:.15,vibrance:.1,split:.5},shadow:[.52,.47,.42],highlight:[.6,.55,.42]},{id:"desert",name:"صحراء",group:"دافئ",params:{temperature:.4,saturation:-.15,contrast:.1,fade:.12,split:.5},shadow:[.5,.46,.42],highlight:[.6,.53,.44]},{id:"cool",name:"بارد",group:"بارد",params:{temperature:-.35,tint:-.03,contrast:.08,vibrance:.1}},{id:"ocean",name:"بحر",group:"بارد",params:{temperature:-.3,saturation:.1,contrast:.12,split:.5},shadow:[.4,.5,.6],highlight:[.5,.55,.55]},{id:"frost",name:"صقيع",group:"بارد",params:{temperature:-.45,saturation:-.3,brightness:.12,fade:.15},curves:_t(Wt(.05,.98))},{id:"night",name:"ليل",group:"بارد",params:{exposure:-.15,temperature:-.3,contrast:.2,vignette:.35,split:.6},shadow:[.38,.45,.62],highlight:[.52,.52,.5]},{id:"cinema",name:"سينمائي",group:"سينمائي",params:{contrast:.2,saturation:-.1,highlights:-.25,vignette:.25,split:.9},shadow:[.38,.52,.58],highlight:[.64,.54,.42],curves:_t(fe(.05))},{id:"noir-teal",name:"ليلي",group:"سينمائي",params:{contrast:.25,saturation:-.25,exposure:-.1,split:1,vignette:.3},shadow:[.36,.5,.56],highlight:[.58,.54,.48]},{id:"formal",name:"رسمي",group:"سينمائي",params:{contrast:.18,saturation:-.2,clarity:.25,temperature:-.05,blacks:-.1}},{id:"street",name:"شارع",group:"سينمائي",params:{contrast:.3,saturation:-.3,clarity:.35,grain:.25,vignette:.2,fade:.08}},{id:"drama",name:"دراما",group:"سينمائي",params:{contrast:.35,highlights:-.4,shadows:-.15,saturation:-.15,clarity:.3,vignette:.4}},{id:"soft",name:"ناعم",group:"ناعم",params:{brightness:.12,contrast:-.15,highlights:-.15,clarity:-.25,vibrance:.1},curves:_t(Wt(.04,1))},{id:"rose",name:"وردي",group:"ناعم",params:{tint:.25,temperature:.08,brightness:.12,fade:.1,split:.5},shadow:[.55,.47,.52],highlight:[.6,.5,.52]},{id:"bride",name:"عروس",group:"ناعم",params:{exposure:.15,brightness:.15,contrast:-.1,saturation:-.1,clarity:-.3,highlights:-.2,tint:.06},curves:_t(Wt(.05,1))},{id:"evening",name:"سهرة",group:"ناعم",params:{exposure:-.05,tint:.12,temperature:.12,contrast:.12,vignette:.3,split:.6},shadow:[.5,.42,.55],highlight:[.62,.52,.48]},{id:"peach",name:"خوخي",group:"ناعم",params:{temperature:.2,tint:.12,brightness:.1,fade:.12,vibrance:.1}},{id:"film",name:"فيلم",group:"فيلم",params:{contrast:.08,saturation:-.1,grain:.3,fade:.15,split:.5},shadow:[.46,.5,.54],highlight:[.56,.53,.46],curves:_t(Wt(.07,.96))},{id:"retro",name:"قديم",group:"فيلم",params:{temperature:.25,saturation:-.25,fade:.3,grain:.35,vignette:.3},curves:_t(Wt(.1,.92),[[0,.04],[1,1]],Zt,[[0,0],[1,.9]])},{id:"polar",name:"بولارويد",group:"فيلم",params:{brightness:.1,contrast:-.05,fade:.2,tint:-.05,split:.6},shadow:[.44,.52,.52],highlight:[.58,.55,.46],curves:_t(Wt(.08,.97))},{id:"lut-teal",name:"تركواز وبرتقالي",group:"احترافي",params:{},lut:mt("teal")},{id:"lut-kodak",name:"فيلم دافئ",group:"احترافي",params:{},lut:mt("warmfilm")},{id:"lut-olive",name:"زيتوني",group:"احترافي",params:{},lut:mt("olive")},{id:"lut-bleach",name:"باهت حاد",group:"احترافي",params:{},lut:mt("bleach")},{id:"lut-golden",name:"ساعة ذهبية",group:"احترافي",params:{},lut:mt("golden")},{id:"cine-keepred",name:"يبقى الأحمر",group:"سينمائي",params:{vignette:.2},lut:mt("keepred")},{id:"cine-keepwarm",name:"يبقى الدافي",group:"سينمائي",params:{vignette:.15},lut:mt("keepwarm")},{id:"cine-redlight",name:"ضوء أحمر",group:"سينمائي",params:{vignette:.35,grain:.1},lut:mt("redlight")},{id:"cine-post",name:"بوست سينمائي",group:"سينمائي",params:{saturation:-.3,contrast:.12,highlights:-.15,shadows:.08,fade:.06,temperature:.1,vignette:.35,grain:.15},lut:mt("moody")},{id:"cine-moody",name:"كئيب",group:"سينمائي",params:{vignette:.3,grain:.15,clarity:.1},lut:mt("moody")},{id:"cine-caramel",name:"كراميل",group:"سينمائي",params:{grain:.15,vignette:.15},lut:mt("caramel")},{id:"cine-violet",name:"ليل بنفسجي",group:"سينمائي",params:{vignette:.25},lut:mt("violet")},{id:"mood-sodium",name:"ضوء الشارع",group:"أجواء",params:{vignette:.3,grain:.12},lut:mt("sodium")},{id:"mood-sunset",name:"غروب ذهبي",group:"أجواء",params:{vignette:.15},lut:mt("sunsetgold")},{id:"mood-neon",name:"نيون الليل",group:"أجواء",params:{vignette:.2,clarity:.1},lut:mt("neon")},{id:"mood-sepia",name:"سيبيا قديم",group:"أجواء",params:{grain:.35,vignette:.3},lut:mt("sepia")},{id:"mood-redteal",name:"أحمر وتركواز",group:"أجواء",params:{vignette:.15},lut:mt("redteal")},{id:"mood-dusk",name:"غسق ناعم",group:"أجواء",params:{grain:.08},lut:mt("dusk")},{id:"mood-rain",name:"ليل ممطر",group:"أجواء",params:{vignette:.3,grain:.1},lut:mt("rainnight")},{id:"mono",name:"أبيض وأسود",group:"أبيض وأسود",params:{bw:1,contrast:.15}},{id:"mono-hi",name:"فحمي",group:"أبيض وأسود",params:{bw:1,contrast:.4,clarity:.3,blacks:-.2,vignette:.25}},{id:"mono-soft",name:"رمادي",group:"أبيض وأسود",params:{bw:1,contrast:-.1,fade:.25,grain:.15}}],Ne={nightcall:{p:{vignette:.3,grain:.18},fx:{halation:.25}},dust:{p:{vignette:.25,grain:.3},fx:{dust:.55,haze:[.15,2]}},redroom:{p:{vignette:.35,grain:.15},fx:{glow:.3,halation:.3}},lowkey:{p:{vignette:.35,grain:.15}},nightflash:{p:{vignette:.45,grain:.2,clarity:.1},fx:{glow:.35}},neonrain:{p:{vignette:.2,grain:.12},fx:{glow:[.35,1],orbs:[.45,1],rain:.4}},redcyan:{p:{vignette:.3,grain:.1},fx:{glow:.35,halation:.2}},tealfilm:{p:{vignette:.25,grain:.25},fx:{halation:.15}},amber:{p:{vignette:.35,grain:.15},fx:{glow:[.2,1],halation:.3}},fire:{p:{vignette:.3,grain:.12,clarity:.12},fx:{glow:[.3,1],halation:.35}},tealorange:{p:{vignette:.2,clarity:.15},fx:{glow:[.15,1]}},homewarm:{p:{grain:.12},fx:{glow:[.15,1],haze:[.12,1]}},gypsy:{p:{vignette:.35,grain:.25},fx:{halation:.2}},street:{p:{clarity:.15,vignette:.15,grain:.08}},polaroid70:{p:{vignette:.25,grain:.3},fx:{halation:.15,haze:[.12,1]}},grit:{p:{clarity:.3,vignette:.3,grain:.4}},goldenblue:{p:{vignette:.25,grain:.1},fx:{glow:[.2,1]}},dusk:{p:{vignette:.25,grain:.1},fx:{glow:[.25,1]}},beige:{p:{grain:.15},fx:{haze:[.15,1]}},honeyhalo:{p:{vignette:.3,grain:.18},fx:{glow:[.3,1],halation:.4}},storm:{p:{vignette:.3,clarity:.2},fx:{glow:[.2,1]}},bluelight:{p:{vignette:.35,grain:.15},fx:{glow:.25}},bluenight:{p:{vignette:.3,grain:.12},fx:{glow:.25}},morning:{p:{grain:.12},fx:{glow:[.3,1],haze:[.35,1],dust:.25}},frappe:{p:{grain:.1,clarity:-.1},fx:{glow:[.2,1],haze:[.2,1]}},coffee:{p:{vignette:.35,grain:.22},fx:{halation:.2}},velvet:{p:{vignette:.3,grain:.2},fx:{halation:.25}}},Ce=new Map;for(const a of B0){const e={id:`cine2-${a.id}`,name:a.name,group:"سينما",params:Ne[a.id]?.p??{},fx:Ne[a.id]?.fx,ref:a.ref};Object.defineProperty(e,"lut",{enumerable:!0,get(){let s=Ce.get(a.id);return!s&&typeof btoa<"u"&&(s=Xe(25,(t,o,n)=>R0(t,o,n,a.def)),Ce.set(a.id,s)),s}}),re.splice(re.findIndex(s=>s.group==="أساسي"),0,e)}const P0=new Set(["desert","ocean","crisp","honey","polar","lut-olive","cine-redlight"]),sa=re.filter(a=>!P0.has(a.id)),Ve="joji.customFilters.v1";function D0(){try{return JSON.parse(localStorage.getItem(Ve)||"[]")}catch{return[]}}function ia(a){try{localStorage.setItem(Ve,JSON.stringify(a))}catch{}}function ve(a){return a?re.find(e=>e.id===a)??D0().find(e=>e.id===a)??null:null}const N0=()=>!!globalThis.__jojiEdgeOff,de=(a,e)=>e<3?a.TEXTURE3+e:e===3?a.TEXTURE7:e===4?a.TEXTURE9:a.TEXTURE14,C0=new Float32Array(Gt.length);class U0{canvas;gl;prog;tex;lutU;lutF;lut3=null;lut3Id="";u={};texW=0;texH=0;lastCurvesU="";masks=[];m6=null;masksVersion=-1;disp=null;dispVersion=-1;plate=null;plateV=-1;lastCurvesF="";maxTex;constructor(e,s=!1,t=!1){this.canvas=e??document.createElement("canvas");const o=this.canvas.getContext("webgl2",{alpha:t,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:s,powerPreference:"high-performance"});if(!o)throw new Error("webgl2");this.gl=o,this.maxTex=o.getParameter(o.MAX_TEXTURE_SIZE),this.prog=this.link(),o.useProgram(this.prog);const n=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,n),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),o.STATIC_DRAW);const l=o.getAttribLocation(this.prog,"aPos");o.enableVertexAttribArray(l),o.vertexAttribPointer(l,2,o.FLOAT,!1,0,0);for(const r of["uTex","uCurveU","uCurveF","uSrc","uTileOrigin","uTileSize","uOutSize","uSharpR","uClarR","uSplit","uFAmt","uU","uF","uFShadow","uFHigh","uFlipY","uSrcFull","uTexFull","uStr","uAspect","uNOps","uOpA","uOpB","uLock","uBeauty","uB","uLipC","uBlushC","uShadowC","uHairC","uBgC","uSkinR","uBgLod","uBgR","uM0","uFxSeg","uFxD","uM1","uM2","uM3","uM4","uM5","uM5On","uLut3","uLutN","uLensC","uBgT","uBgOff","uChecker","uDisp","uDispOn","uPlate","uPlateOn","uM6","uM6On","uB2","uEye","uFxOn","uFxE","uFxV","uHsl","uGrd","uGlowR","uGlowLod","uFxSeed","uEdLoc","uEdLocOn","uNRLod","uEdA","uNR","uNC","uNCLod","uTexR","uMb","uDx","uDxP","uDxQ"])this.u[r]=o.getUniformLocation(this.prog,r);this.tex=this.mkTex(o.LINEAR),this.lutU=this.mkTex(o.LINEAR),this.lutF=this.mkTex(o.LINEAR),o.uniform1i(this.u.uTex,0),o.uniform1i(this.u.uCurveU,1),o.uniform1i(this.u.uCurveF,2),o.uniform1i(this.u.uM0,3),o.uniform1i(this.u.uM1,4),o.uniform1i(this.u.uM2,5),o.uniform1i(this.u.uM3,7),o.uniform1i(this.u.uM4,9),o.uniform1i(this.u.uM5,14),o.uniform1i(this.u.uM6,15),o.uniform1i(this.u.uLut3,8),this.masks=[this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR),this.mkTex(o.LINEAR)],this.m6=this.mkTex(o.LINEAR),o.activeTexture(o.TEXTURE15),o.bindTexture(o.TEXTURE_2D,this.m6),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([128,128,0,0]));for(let r=0;r<6;r++)o.activeTexture(de(o,r)),o.bindTexture(o.TEXTURE_2D,this.masks[r]),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([0,0,255,0]));o.activeTexture(o.TEXTURE0),o.uniform1f(this.u.uFlipY,-1),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,o.NONE)}link(){const e=this.gl,s=(o,n)=>{const l=e.createShader(o);if(e.shaderSource(l,n),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(l)??"shader");return l},t=e.createProgram();if(e.attachShader(t,s(e.VERTEX_SHADER,e0)),e.attachShader(t,s(e.FRAGMENT_SHADER,a0)),e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(t)??"link");return t}mkTex(e){const s=this.gl,t=s.createTexture();return s.bindTexture(s.TEXTURE_2D,t),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,e),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,e),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),t}setImage(e){const s=this.gl;s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,this.tex),s.texImage2D(s.TEXTURE_2D,0,s.RGBA8,s.RGBA,s.UNSIGNED_BYTE,e),s.generateMipmap(s.TEXTURE_2D),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR_MIPMAP_LINEAR);const t=e;this.texW=t.videoWidth||e.width,this.texH=t.videoHeight||e.height}setLut(e,s,t,o){const n=JSON.stringify(t);if((o==="U"?this.lastCurvesU:this.lastCurvesF)===n)return;o==="U"?this.lastCurvesU=n:this.lastCurvesF=n;const l=this.gl;l.activeTexture(l.TEXTURE0+e),l.bindTexture(l.TEXTURE_2D,s),l.texImage2D(l.TEXTURE_2D,0,l.RGBA8,256,1,0,l.RGBA,l.UNSIGNED_BYTE,o0(t)),l.activeTexture(l.TEXTURE0)}draw(e,s){const t=this.gl,o=this.canvas.width,n=this.canvas.height;t.viewport(0,0,o,n),t.useProgram(this.prog),this.setLut(1,this.lutU,e.curves,"U");const l=e.filter;this.setLut(2,this.lutF,l?.curves??I0,"F"),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.lutU),t.activeTexture(t.TEXTURE2),t.bindTexture(t.TEXTURE_2D,this.lutF),l?.lut&&(t.activeTexture(t.TEXTURE8),this.lut3||(this.lut3=this.mkTex(t.LINEAR)),t.bindTexture(t.TEXTURE_2D,this.lut3),this.lut3Id!==l.id&&(this.lut3Id=l.id,t.pixelStorei(t.UNPACK_ALIGNMENT,1),t.texImage2D(t.TEXTURE_2D,0,t.RGB8,l.lut.n*l.lut.n,l.lut.n,0,t.RGB,t.UNSIGNED_BYTE,S0(l.lut)))),t.uniform1f(this.u.uLutN,l?.lut?l.lut.n:0),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.tex);const r=s.tileSize??[o,n],i=s.outSize??r,h=s.texFull??{x:0,y:0,w:1,h:1};t.uniform4f(this.u.uSrcFull,s.src.x,s.src.y,s.src.w,s.src.h),t.uniform4f(this.u.uTexFull,h.x,h.y,h.w,h.h),t.uniform1f(this.u.uAspect,s.aspect??this.texW/Math.max(1,this.texH)),this.setBeauty(s.beauty??null,h),this.setSeg(e),t.uniform2f(this.u.uTileOrigin,...s.tileOrigin??[0,0]),t.uniform2f(this.u.uTileSize,r[0],r[1]),t.uniform2f(this.u.uOutSize,i[0],i[1]);const f=s.src.w/h.w*this.texW,k=s.src.h/h.h*this.texH,N=Math.min(f,k),M=s.outShortPx??Math.min(i[0],i[1]),A=N/Math.max(1,Math.min(r[0],r[1])),E=s.texScale??(s.outShortPx?N/Math.max(1,s.outShortPx):A),R=Math.max(.75,Math.max(1,M/1600)*E),x=Math.max(1.5,M*.009*E);t.uniform2f(this.u.uSharpR,R/this.texW,R/this.texH),t.uniform2f(this.u.uClarR,x/this.texW,x/this.texH),t.uniform1f(this.u.uSplit,s.split??-1),t.uniform1f(this.u.uChecker,s.checker?1:0),t.uniform1f(this.u.uFAmt,l?e.filterAmount:0),t.uniform1fv(this.u.uU,Gt.map(v=>e.params[v]??0)),t.uniform1fv(this.u.uF,l?Gt.map(v=>l.params[v]??0):C0),t.uniform3fv(this.u.uFShadow,l?.shadow??[.5,.5,.5]),t.uniform3fv(this.u.uFHigh,l?.highlight??[.5,.5,.5]);const p=He(e.fx,l?.fx,l?e.filterAmount:0);t.uniform1f(this.u.uFxOn,p.on?1:0),t.uniform1fv(this.u.uFxE,p.e),t.uniform1fv(this.u.uFxV,p.v),t.uniform1fv(this.u.uHsl,p.hsl),t.uniform1fv(this.u.uGrd,p.grade),t.uniform1f(this.u.uFxSeed,p.seed);const g=M*.03*E;this.setEd(e,E,M),t.uniform2f(this.u.uGlowR,g/this.texW,g/this.texH),t.uniform1f(this.u.uGlowLod,Math.max(0,Math.log2(Math.max(1,g/3)))),t.drawArrays(t.TRIANGLE_STRIP,0,4)}edV=-1;edTex=null;dxId="";dxTex=null;setEd(e,s,t){const o=this.gl,n=e.ed,l=Math.max(.75,s);o.uniform2f(this.u.uNR,l/this.texW,l/this.texH),o.uniform1f(this.u.uNRLod,Math.max(0,Math.log2(l)));const r=Math.max(1.5,7*s);o.uniform2f(this.u.uNC,r/this.texW,r/this.texH),o.uniform1f(this.u.uNCLod,Math.max(0,Math.log2(r/4)));const i=Math.max(.9,t*.0022*s);o.uniform2f(this.u.uTexR,i/this.texW,i/this.texH),this.edTex||(o.activeTexture(o.TEXTURE11),this.edTex=this.mkTex(o.LINEAR),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([128,255,0,255])),o.uniform1i(this.u.uEdLoc,11),o.activeTexture(o.TEXTURE12),this.dxTex=this.mkTex(o.LINEAR),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),o.uniform1i(this.u.uDx,12)),o.activeTexture(o.TEXTURE11),o.bindTexture(o.TEXTURE_2D,this.edTex),n?.map&&n.map.v!==this.edV&&(this.edV=n.map.v,o.pixelStorei(o.UNPACK_ALIGNMENT,1),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,n.map.w,n.map.h,0,o.RGBA,o.UNSIGNED_BYTE,n.map.data)),o.uniform1f(this.u.uEdLocOn,n?.map?(n.map.light?1:0)+(n.map.person?2:0):0),o.uniform3fv(this.u.uEdA,n?.A??[1,1,1]);const h=n?.mb;h&&h.a>0?o.uniform4f(this.u.uMb,h.dx,h.dy,h.a,Math.max(0,Math.log2(Math.max(1,h.lenFull*s/28)))):o.uniform4f(this.u.uMb,0,0,0,0),o.activeTexture(o.TEXTURE12),o.bindTexture(o.TEXTURE_2D,this.dxTex);const f=n?.dx;f&&f.id!==this.dxId&&(this.dxId=f.id,o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,o.RGBA,o.UNSIGNED_BYTE,f.img),o.generateMipmap(o.TEXTURE_2D),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR_MIPMAP_LINEAR)),o.uniform4f(this.u.uDxP,f?.a??0,f?.s??1,f?.x??0,f?.y??0),o.uniform4f(this.u.uDxQ,f?.bg??0,f?f.img.width/Math.max(1,f.img.height):1,0,f&&f.a>0?1:0),o.activeTexture(o.TEXTURE0)}updateRect(e,s,t,o,n){const l=this.gl;if(e.width!==this.texW||e.height!==this.texH){this.setImage(e);return}if(s=Math.max(0,Math.floor(s)),t=Math.max(0,Math.floor(t)),o=Math.min(e.width-s,Math.ceil(o)),n=Math.min(e.height-t,Math.ceil(n)),o<=0||n<=0)return;const r=e.getContext("2d").getImageData(s,t,o,n);l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.tex),l.pixelStorei(l.UNPACK_ALIGNMENT,1),l.texSubImage2D(l.TEXTURE_2D,0,s,t,o,n,l.RGBA,l.UNSIGNED_BYTE,r.data),l.generateMipmap(l.TEXTURE_2D)}segV=-1;segTex=null;setSeg(e){const s=this.gl,t=e.seg;s.uniform1f(this.u.uFxSeg,t?1:0),t&&(s.activeTexture(s.TEXTURE10),this.segTex||(this.segTex=this.mkTex(s.LINEAR),s.uniform1i(this.u.uFxD,10)),s.bindTexture(s.TEXTURE_2D,this.segTex),this.segV!==t.v&&(this.segV=t.v,s.pixelStorei(s.UNPACK_ALIGNMENT,1),s.texImage2D(s.TEXTURE_2D,0,s.RGBA8,t.w,t.h,0,s.RGBA,s.UNSIGNED_BYTE,t.data)),s.activeTexture(s.TEXTURE0))}setBeauty(e,s){const t=this.gl;if(t.uniform1f(this.u.uBeauty,e?1:0),!e){t.uniform2f(this.u.uStr,0,0);return}if(e.masks&&e.masksVersion!==this.masksVersion){this.masksVersion=e.masksVersion;const r=e.masks;t.pixelStorei(t.UNPACK_ALIGNMENT,1),r.data.forEach((i,h)=>{if(h>5)return;t.activeTexture(de(t,h)),t.bindTexture(t.TEXTURE_2D,this.masks[h]);const f=h===5&&r.gw&&r.gh;t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,f?r.gw:r.w,f?r.gh:r.h,0,t.RGBA,t.UNSIGNED_BYTE,i)}),r.m6&&(t.activeTexture(t.TEXTURE15),t.bindTexture(t.TEXTURE_2D,this.m6),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,r.m6.w,r.m6.h,0,t.RGBA,t.UNSIGNED_BYTE,r.m6.data))}t.activeTexture(t.TEXTURE15),t.bindTexture(t.TEXTURE_2D,this.m6),t.uniform1f(this.u.uM6On,e.masks?.m6?1:0);{const r=new Float32Array(12);(e.b2??[]).forEach((h,f)=>{f<12&&(r[f]=h)}),t.uniform4fv(this.u.uB2,r);const i=new Float32Array(8);(e.eyes??[]).slice(0,2).forEach((h,f)=>i.set([h.x,h.y,h.r,h.vis],f*4)),t.uniform4fv(this.u.uEye,i)}for(let r=0;r<6;r++)t.activeTexture(de(t,r)),t.bindTexture(t.TEXTURE_2D,this.masks[r]);if(t.uniform1f(this.u.uM5On,e.masks&&e.masks.data.length>5&&!N0()?1:0),t.activeTexture(t.TEXTURE6),this.disp||(this.disp=this.mkTex(t.LINEAR),t.uniform1i(this.u.uDisp,6)),t.bindTexture(t.TEXTURE_2D,this.disp),e.field&&e.fieldVersion!==this.dispVersion){this.dispVersion=e.fieldVersion,t.pixelStorei(t.UNPACK_ALIGNMENT,1);const r=e.field,i=r.w*r.h,h=new Float32Array(i*4);for(let f=0;f<i;f++)h[f*4]=r.data[f*2],h[f*4+1]=r.data[f*2+1],h[f*4+2]=r.solid?r.solid[f]:0,h[f*4+3]=r.lockw?r.lockw[f]:0;t.texImage2D(t.TEXTURE_2D,0,t.RGBA16F,r.w,r.h,0,t.RGBA,t.FLOAT,h)}t.uniform1f(this.u.uDispOn,e.field?1:0);const o=e.field?e.plate:null;o&&(t.activeTexture(t.TEXTURE13),this.plate||(this.plate=this.mkTex(t.LINEAR),t.uniform1i(this.u.uPlate,13)),t.bindTexture(t.TEXTURE_2D,this.plate),o.v!==this.plateV&&(this.plateV=o.v,t.pixelStorei(t.UNPACK_ALIGNMENT,4),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,o.c))),t.uniform1f(this.u.uPlateOn,o?1:0),t.activeTexture(t.TEXTURE0),t.uniform1i(this.u.uNOps,e.n),t.uniform4fv(this.u.uOpA,e.opA),t.uniform4fv(this.u.uOpB,e.opB),t.uniform1f(this.u.uLock,e.lock),t.uniform1fv(this.u.uB,e.b),t.uniform3fv(this.u.uLipC,e.lip),t.uniform3fv(this.u.uBlushC,e.blush),t.uniform3fv(this.u.uShadowC,e.shadow),t.uniform3fv(this.u.uHairC,e.hair),t.uniform3fv(this.u.uLensC,e.lens),t.uniform4fv(this.u.uBgC,e.bg),t.uniform3fv(this.u.uBgT,e.bgT??[.16,.42,1]),t.uniform1fv(this.u.uBgOff,e.bgOff??[0,0,0,0,0,0,0,0]),t.uniform2f(this.u.uStr,e.stretch[0],e.stretch[1]);const n=this.texH/s.h,l=e.skinR*n;t.uniform2f(this.u.uSkinR,l/this.texW,l/this.texH),t.uniform1f(this.u.uBgLod,Math.log2(Math.max(1,e.bgBlur*n*.5))),t.uniform2f(this.u.uBgR,e.bgBlur*n/this.texW,e.bgBlur*n/this.texH)}dispose(){this.gl.getExtension("WEBGL_lose_context")?.loseContext()}}const I0={rgb:[[0,0],[1,1]],r:[[0,0],[1,1]],g:[[0,0],[1,1]],b:[[0,0],[1,1]]},Ue=5e7;async function _0(a){const e=a.name.replace(/\.[^.]+$/,"")||"joji";let s;try{s=await createImageBitmap(a,{imageOrientation:"from-image"})}catch{s=await new Promise((n,l)=>{const r=new Image;r.onload=()=>n(r),r.onerror=()=>l(new Error("decode")),r.src=URL.createObjectURL(a)})}let t="naturalWidth"in s?s.naturalWidth:s.width,o="naturalHeight"in s?s.naturalHeight:s.height;if(!t||!o)throw new Error("decode");if(t*o>Ue){const n=Math.sqrt(Ue/(t*o)),l=Math.round(t*n),r=Math.round(o*n),i=await createImageBitmap(s,{resizeWidth:l,resizeHeight:r,resizeQuality:"high"});"close"in s&&s.close(),s=i,t=l,o=r}return{src:s,w:t,h:o,name:e}}function we(a,e,s){return s%2?{w:e,h:a}:{w:a,h:e}}function Ye(a,e,s,t,o){o&&(a.translate(e,0),a.scale(-1,1)),t===1?(a.translate(e,0),a.rotate(Math.PI/2)):t===2?(a.translate(e,s),a.rotate(Math.PI)):t===3&&(a.translate(0,s),a.rotate(-Math.PI/2))}function le(a,e,s=!1){const t=document.createElement("canvas");t.width=a,t.height=e;const o=t.getContext("2d",{alpha:s});return o.imageSmoothingEnabled=!0,o.imageSmoothingQuality="high",{c:t,ctx:o}}function O0(a,e,s,t){const o=we(a.w,a.h,e),n=Math.min(1,t/Math.max(o.w,o.h)),l=Math.max(1,Math.round(o.w*n)),r=Math.max(1,Math.round(o.h*n)),{c:i,ctx:h}=le(l,r);return h.scale(n,n),Ye(h,o.w,o.h,e,s),h.drawImage(a.src,0,0),i}function na(a,e,s){const t=e.w*a.width,o=e.h*a.height,n=s/Math.min(t,o),{c:l,ctx:r}=le(s,s);return r.drawImage(a,e.x*a.width+(t-s/n)/2,e.y*a.height+(o-s/n)/2,s/n,s/n,0,0,s,s),l}function j0(a,e,s=1){const t=we(a.w,a.h,e.rot);return{w:Math.max(1,Math.round(e.crop.w*t.w)),h:Math.max(1,Math.round(e.crop.h*t.h*s))}}async function G0(a,e,s,t,o){const n=we(a.w,a.h,e.rot),l=Oe(t),r=n.h*l,i=Math.round(e.crop.x*n.w),h=Math.round(e.crop.y*r),{w:f,h:k}=j0(a,e,l),N=Je(t),M=le(f,k,N),A=new U0(void 0,!0,N);try{let E=t?Math.round(Math.max(64,.07*Math.max(n.w,n.h))):48;const R=T0(He(s.fx,s.filter?.fx,s.filter?s.filterAmount:0).e);R&&(E=Math.max(E,Math.round(R*Math.min(f,k)))),s.ed?.margin&&(E=Math.max(E,s.ed.margin));const x=Math.max(256,Math.min(2048,A.maxTex-2*E)),p=[];for(let v=0;v<k;v+=x)for(let b=0;b<f;b+=x)p.push([b,v,Math.min(x,f-b),Math.min(x,k-v)]);const g=le(x+2*E,x+2*E);for(let v=0;v<p.length;v++){const[b,F,P,I]=p[v],L=i+b,C=h+F,O=Be(C/r,t)*n.h,_=Be((C+I)/r,t)*n.h,j=Math.max(0,L-E),z=Math.max(0,Math.floor(O)-E),D=Math.min(n.w,L+P+E),c=Math.min(n.h,Math.ceil(_)+E),m=D-j,u=c-z;(g.c.width!==m||g.c.height!==u)&&(g.c.width=m,g.c.height=u);const d=g.ctx;d.setTransform(1,0,0,1,0,0),d.translate(-j,-z),Ye(d,n.w,n.h,e.rot,e.flip),d.drawImage(a.src,0,0),s.pre&&(d.setTransform(1,0,0,1,0,0),s.pre(d,j,z,m,u)),A.setImage(g.c),A.canvas.width=P,A.canvas.height=I,A.draw(s,{src:{x:L/n.w,y:C/r,w:P/n.w,h:I/r},texFull:{x:j/n.w,y:z/n.h,w:m/n.w,h:u/n.h},aspect:n.w/n.h,beauty:t,tileOrigin:[b,F],tileSize:[P,I],outSize:[f,k]}),M.ctx.drawImage(A.canvas,b,F),o((v+1)/p.length),await new Promise(y=>setTimeout(y,0))}}finally{A.dispose()}return M.c}const Je=a=>!!a&&a.b[15]>0&&a.bg[3]<.5;function z0(a,e,s){return new Promise((t,o)=>a.toBlob(n=>n?t(n):o(new Error("encode")),e,s))}function H0(a,e){const t=e.w*a.width,o=e.h*a.height,n=Math.min(1,256/Math.max(t,o)),l=Math.max(1,Math.round(t*n)),r=Math.max(1,Math.round(o*n)),i=document.createElement("canvas");i.width=l,i.height=r;const h=i.getContext("2d",{willReadFrequently:!0});h.drawImage(a,e.x*a.width,e.y*a.height,t,o,0,0,l,r);const f=h.getImageData(0,0,l,r).data,k=new Uint32Array(256);let N=0,M=0,A=0,E=0,R=0,x=0,p=0,g=0,v=0;for(let c=0;c<f.length;c+=4){const m=f[c]/255,u=f[c+1]/255,d=f[c+2]/255,y=.2126*m+.7152*u+.0722*d;k[Math.min(255,Math.round(y*255))]++,N++,M+=y,A+=y*y,y<.12&&g++,y>.96&&v++,y>.15&&y<.85&&(E+=m,R+=u,x+=d,p++)}const b=c=>{let m=0;for(let u=0;u<256;u++)if(m+=k[u],m>=c*N)return u/255;return 1},F=b(.01),P=b(.5),I=b(.99),L=M/N,C=Math.sqrt(Math.max(0,A/N-L*L)),O=(c,m,u)=>Math.min(u,Math.max(m,c)),_=xe(),j=Math.log2(.46/Math.max(.04,(P+L)/2));_.exposure=O(j*.4,-.35,.45),F>.04&&(_.blacks=-O((F-.02)*4,0,.5)),I<.94&&(_.whites=O((.98-I)*3.2,0,.5));const z=v/N,D=g/N;if(z>.01?_.highlights=-O(z*8+.15,0,.6):_.highlights=-.12,D>.08?_.shadows=O(D*1.3+.1,0,.55):_.shadows=.1,_.contrast=O((.22-C)*1.6,-.1,.3),_.clarity=.16,_.sharpness=.12,_.vibrance=.22,p>N*.1){const c=E/p,m=R/p,u=x/p;_.temperature=O((u-c)*2.2,-.35,.35),_.tint=O((m-(c+u)/2)*2.5,-.3,.3)}for(const c of Object.keys(_))_[c]=Math.round(_[c]*100)/100;return _}const Ke="joji.presets";function ra(){try{return JSON.parse(localStorage.getItem(Ke)||"[]")}catch{return[]}}function la(a){try{return localStorage.setItem(Ke,JSON.stringify(a.slice(0,40))),!0}catch{return!1}}const q0=a=>Object.entries(a.beauty.v).some(([e,s])=>e!=="reshape"&&Math.abs(s)>.004),ca=a=>Gt.some(e=>Math.abs(a.params[e])>.004)||!!a.filterId||JSON.stringify(a.curves)!==JSON.stringify(ee().curves)||JSON.stringify(a.fx)!==JSON.stringify(ee().fx)||a.auto;function ua(a,e,s,t,o){const n=Ot(a.params);if(a.auto&&o)for(const r of Gt)n[r]-=o[r]*a.autoAmt;const l={id:`p${Date.now()}`,name:e,thumb:s,auto:a.auto&&!!o,st:{params:n,curves:Ot(a.curves),filterId:a.filterId,filterAmount:a.filterAmount,fx:Ot(a.fx)}};if(t&&q0(a)){const r=a.beauty;l.beauty={v:Object.fromEntries(Object.entries(r.v).filter(([i])=>i!=="reshape")),lip:r.lip,blush:r.blush,shadow:r.shadow,hair:r.hair,lens:r.lens,gender:r.gender}}return l}function We(a,e,s){const t=Ot(a);if(t.params={...xe(),...Ot(e.st.params)},t.curves=Ot(e.st.curves),t.filterId=e.st.filterId&&ve(e.st.filterId)?e.st.filterId:null,t.filterAmount=e.st.filterAmount,t.fx=Ot(e.st.fx),t.auto=!1,t.autoAmt=1,e.auto&&s){const o=H0(s,t.crop);for(const n of Gt)t.params[n]=Math.max(-1,Math.min(1,t.params[n]+o[n]));t.auto=!0}for(const o of Gt)t.params[o]=Math.max(E0.has(o)?0:-1,Math.min(1,t.params[o]));return e.beauty&&(t.beauty={...t.beauty,...Ot(e.beauty),v:{...Ot(e.beauty.v)},gender:t.beauty.gender??e.beauty.gender}),t}function ha(a,e,s,t){const o=We(ee(),{...s,beauty:void 0},e);a.setImage(e),a.canvas.width=t.width,a.canvas.height=t.height,a.draw({params:o.params,curves:o.curves,filter:ve(o.filterId),filterAmount:o.filterAmount,fx:o.fx},{src:{x:0,y:0,w:1,h:1},outShortPx:1200}),t.getContext("2d").drawImage(a.canvas,0,0,t.width,t.height)}async function ma(a,e,s){const t=await _0(a);try{const o=O0(t,0,!1,1600);let n=ee();try{const k=localStorage.getItem("joji.gender");(k==="m"||k==="f")&&(n.beauty.gender=k)}catch{}n=We(n,e,o);let l=null;if(e.beauty)try{const k=await ce(()=>import("./detect-C7pwrWYL.js"),__vite__mapDeps([0,1,2]),import.meta.url),N=Math.min(1,1280/Math.max(o.width,o.height)),M=document.createElement("canvas");M.width=Math.round(o.width*N),M.height=Math.round(o.height*N),M.getContext("2d").drawImage(o,0,0,M.width,M.height);const A=await k.analyze(M,o),{buildMasks:E}=await ce(async()=>{const{buildMasks:g}=await import("./masks-CHHfB90x.js");return{buildMasks:g}},__vite__mapDeps([3,1,2,0]),import.meta.url),R=A.faces.length?E(A,0,o):null,x=n.beauty.v,p=n.beauty.lock&&["bodySlim","waist","hips","shoulders","arms","legs","height"].some(g=>Math.abs(x[g]??0)>.004)?await ce(()=>import("./plate-Co9xVqa6.js"),__vite__mapDeps([4,1,2]),import.meta.url).then(g=>g.makePlate(o,A)).catch(()=>null):null;l=y0(n.beauty,A,R,1,!!p),l&&p&&(l.plate={c:p,v:1})}catch(k){console.warn("batch beauty",k)}s(.3);const r={params:n.params,curves:n.curves,filter:ve(n.filterId),filterAmount:n.filterAmount,fx:n.fx},i=await G0(t,n,r,l,k=>s(.3+k*.6)),h=Je(l),f=await z0(i,h?"image/png":"image/jpeg",.94);return i.width=i.height=0,s(1),{blob:f,name:`joji-${t.name.replace(/\.[a-z0-9]+$/i,"")}`.replace(/[^A-Za-z0-9_-]+/g,"-").replace(/-+/g,"-").replace(/-$/,"")}}finally{"close"in t.src&&t.src.close()}}export{We as A,$0 as B,ca as C,q0 as D,M0 as E,sa as F,oa as G,ea as H,ua as I,la as J,K0 as K,Q0 as L,h0 as M,j0 as N,G0 as O,Gt as P,z0 as Q,U0 as R,Y0 as S,_e as T,W0 as U,E0 as V,ma as W,l0 as X,ee as a,Oe as b,Ot as c,ve as d,k0 as e,ze as f,Je as g,H0 as h,ta as i,Z0 as j,y0 as k,_0 as l,O0 as m,D0 as n,we as o,Le as p,na as q,ia as r,ae as s,J0 as t,Be as u,aa as v,v0 as w,ra as x,ha as y,xe as z};
