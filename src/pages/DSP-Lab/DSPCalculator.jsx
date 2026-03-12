/**
 * DSPCalculator
 * -------------
 * Interactive DSP playground for fixed-point (Q15 / Qm.n) and IEEE-754 conversions.
 *
 * Notes:
 * - This module intentionally keeps all helpers in one file because each tab reuses
 *   the same math utilities and visual primitives.
 * - Layout/styling uses inline styles to preserve the original neon terminal theme.
 */

import { useState, useRef, useEffect } from "react";

const Q15_MAX = 32767,
  Q15_MIN = -32768,
  Q15_SCALE = 32768.0;
const q15Sat = (x) => Math.max(Q15_MIN, Math.min(Q15_MAX, Math.round(x)));
const bankersRound = (x) => {
  const fl = Math.floor(x),
    d = x - fl;
  if (d < 0.5) return fl;
  if (d > 0.5) return fl + 1;
  return fl % 2 === 0 ? fl : fl + 1;
};
const floatToQ15 = (f) => {
  f = Math.max(-1, Math.min(1 - 1 / Q15_SCALE, f));
  return q15Sat(bankersRound(f * Q15_SCALE));
};
const q15ToFloat = (q) => q / Q15_SCALE;
const q15Mul = (a, b) => q15Sat((a * b + 0x4000) >> 15);
const toHex = (q, bytes = 2) =>
  "0x" +
  ((q & (bytes === 4 ? 0xffffffff : 0xffff)) >>> 0)
    .toString(16)
    .toUpperCase()
    .padStart(bytes * 2, "0");
const toBin = (q, bits = 16) =>
  ((q & (bits < 32 ? (1 << bits) - 1 : 0xffffffff)) >>> 0)
    .toString(2)
    .padStart(bits, "0");
const fmtE = (e) => (Math.abs(e) < 1e-12 ? "0.000000" : e.toExponential(4));
const genSine = (fHz, fs, amp, n) =>
  Array.from({ length: n }, (_, i) =>
    parseFloat((amp * Math.sin(((2 * Math.PI * fHz) / fs) * i)).toFixed(6)),
  );
const snr = (ref, apx) => {
  let s = 0,
    e = 0;
  ref.forEach((v, i) => {
    s += v * v;
    e += (v - apx[i]) ** 2;
  });
  return e === 0 ? Infinity : 10 * Math.log10(s / e);
};
const mae = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
const bankR = bankersRound;

// Batch runners
const runA1 = ({ freqHz, fsHz, amplitude, nSamples }) => {
  const f = genSine(freqHz, fsHz, amplitude, nSamples),
    q = f.map(floatToQ15),
    r = q.map(q15ToFloat);
  return {
    rows: f.map((v, i) => ({
      n: i,
      orig: v,
      q15: q[i],
      hex: toHex(q[i]),
      bin: toBin(q[i]),
      recon: r[i],
      err: v - r[i],
    })),
    snr: snr(f, r),
    mae: mae(f, r),
    pass: mae(f, r) <= 0.5 / Q15_SCALE + 1e-12,
  };
};
const runA2 = ({ freqHz, fsHz, amplitude, nSamples, gain }) => {
  const f = genSine(freqHz, fsHz, amplitude, nSamples),
    gQ14 = Math.round(gain * (1 << 14)),
    fG = f.map((v) => Math.max(-1, Math.min(1, v * gain))),
    qIn = f.map(floatToQ15),
    qOut = qIn.map((x) => q15Sat((x * gQ14 + (1 << 13)) >> 14)),
    r = qOut.map(q15ToFloat);
  return {
    rows: f.map((v, i) => ({
      n: i,
      input: v,
      floatG: fG[i],
      q15In: qIn[i],
      q15Out: qOut[i],
      recon: r[i],
      err: fG[i] - r[i],
    })),
    snr: snr(fG, r),
    mae: mae(fG, r),
    pass: mae(fG, r) < 2 / Q15_SCALE,
    gainQ14: gQ14,
  };
};
const runA3 = ({ freqHz, fsHz, nSamples, clipLevel }) => {
  const f = genSine(freqHz, fsHz, 1.0, nSamples),
    cP = Math.round(clipLevel * Q15_SCALE + 0.5),
    cN = Math.round(-clipLevel * Q15_SCALE - 0.5),
    fC = f.map((v) => Math.max(-clipLevel, Math.min(clipLevel, v))),
    qIn = f.map(floatToQ15),
    qC = qIn.map((x) => Math.max(cN, Math.min(cP, x))),
    r = qC.map(q15ToFloat);
  return {
    rows: f.map((v, i) => ({
      n: i,
      orig: v,
      clippedF: fC[i],
      q15In: qIn[i],
      q15Clip: qC[i],
      recon: r[i],
      err: fC[i] - r[i],
    })),
    mae: mae(fC, r),
    pass: mae(fC, r) < 2 / Q15_SCALE,
    clipPos: cP,
    clipNeg: cN,
  };
};
const runA4 = ({ freqHz, fsHz, amplitude, nSamples, B0, B1, A1 }) => {
  const f = genSine(freqHz, fsHz, amplitude, nSamples);
  let x1f = 0,
    y1f = 0;
  const fOut = f.map((x) => {
    const y = B0 * x + B1 * x1f - A1 * y1f;
    x1f = x;
    y1f = y;
    return y;
  });
  const B0q = floatToQ15(B0),
    B1q = floatToQ15(B1),
    A1q = floatToQ15(-A1);
  let x1q = 0,
    y1q = 0;
  const qOut = [],
    qF = [];
  f.forEach((v) => {
    const xq = floatToQ15(v),
      yq = q15Sat(q15Mul(B0q, xq) + q15Mul(B1q, x1q) + q15Mul(A1q, y1q));
    qOut.push(yq);
    qF.push(q15ToFloat(yq));
    x1q = xq;
    y1q = yq;
  });
  return {
    rows: f.map((v, i) => ({
      n: i,
      x: v,
      yFloat: fOut[i],
      q15In: floatToQ15(v),
      q15Out: qOut[i],
      yQ15: qF[i],
      err: fOut[i] - qF[i],
    })),
    snr: snr(fOut, qF),
    mae: mae(fOut, qF),
    pass: snr(fOut, qF) > 60,
    B0q,
    B1q,
    A1q: floatToQ15(A1),
  };
};

// Single calculators
const sA1 = (r) => {
  const f = parseFloat(r);
  if (isNaN(f)) return null;
  const q = floatToQ15(f),
    rec = q15ToFloat(q),
    err = f - rec;
  return {
    f,
    q,
    hex: toHex(q),
    bin: toBin(q),
    rec,
    err,
    errLsb: err / (1 / Q15_SCALE),
    pass: Math.abs(err) <= 0.5 / Q15_SCALE + 1e-12,
  };
};
const sA2 = (r, g) => {
  const f = parseFloat(r),
    gv = parseFloat(g);
  if (isNaN(f) || isNaN(gv)) return null;
  const gQ14 = Math.round(gv * (1 << 14)),
    fG = Math.max(-1, Math.min(1, f * gv)),
    qIn = floatToQ15(f),
    qOut = q15Sat((qIn * gQ14 + (1 << 13)) >> 14),
    rec = q15ToFloat(qOut);
  return {
    f,
    g: gv,
    gQ14,
    fG,
    qIn,
    hexIn: toHex(qIn),
    qOut,
    hexOut: toHex(qOut),
    rec,
    err: fG - rec,
  };
};
const sA3 = (r, c) => {
  const f = parseFloat(r),
    cl = parseFloat(c);
  if (isNaN(f) || isNaN(cl)) return null;
  const cP = Math.round(cl * Q15_SCALE + 0.5),
    cN = Math.round(-cl * Q15_SCALE - 0.5),
    fC = Math.max(-cl, Math.min(cl, f)),
    qIn = floatToQ15(f),
    qC = Math.max(cN, Math.min(cP, qIn)),
    rec = q15ToFloat(qC);
  return {
    f,
    cl,
    fC,
    qIn,
    hexIn: toHex(qIn),
    cP,
    cN,
    qC,
    hexClip: toHex(qC),
    rec,
    err: fC - rec,
    clipped: Math.abs(f) > cl,
  };
};
const sA4 = (r, b0r, b1r, a1r, x1r, y1r) => {
  const f = parseFloat(r),
    b0 = parseFloat(b0r),
    b1 = parseFloat(b1r),
    a1 = parseFloat(a1r),
    px = parseFloat(x1r),
    py = parseFloat(y1r);
  if ([f, b0, b1, a1, px, py].some(isNaN)) return null;
  const yF = b0 * f + b1 * px - a1 * py,
    B0q = floatToQ15(b0),
    B1q = floatToQ15(b1),
    A1q = floatToQ15(-a1),
    xq = floatToQ15(f),
    x1q = floatToQ15(px),
    y1q = floatToQ15(py),
    yq = q15Sat(q15Mul(B0q, xq) + q15Mul(B1q, x1q) + q15Mul(A1q, y1q));
  return {
    f,
    yF,
    xq,
    hexXq: toHex(xq),
    B0q,
    B1q,
    A1q: floatToQ15(a1),
    yq,
    hexYq: toHex(yq),
    yQ15: q15ToFloat(yq),
    err: yF - q15ToFloat(yq),
  };
};

// IEEE-754
const IPAR = {
  16: { eB: 5, mB: 10, bias: 15, name: "Half Precision" },
  24: { eB: 8, mB: 15, bias: 127, name: "Audio Extended" },
  32: { eB: 8, mB: 23, bias: 127, name: "Single Precision" },
};
const calcIEEE = (rawVal, bits) => {
  const num = parseFloat(rawVal);
  if (isNaN(num)) return null;
  const { eB, mB, bias, name } = IPAR[bits],
    total = 1 + eB + mB,
    mScale = Math.pow(2, mB);
  if (num === 0) {
    const full = "0".repeat(total);
    return {
      num,
      bits,
      total,
      name,
      sign: 0,
      sExp: 0,
      mInt: 0,
      eB,
      mB,
      bias,
      full,
      hexStr: buildHex(full),
      recon: 0,
      error: 0,
      relError: 0,
      signBit: "0",
      expStr: "0".repeat(eB),
      mantStr: "0".repeat(mB),
      binGroups: mkGroups(full),
      actualExp: 0,
      mantF: 0,
      intBin: "0",
      fracBin: "0",
      intPart: 0,
      fracPart: 0,
      intBinSteps: [{ n: 0, q: 0, rem: 0 }],
      fracSteps: [],
      normalizedStr: "0",
    };
  }
  const sign = num < 0 ? 1 : 0,
    absVal = Math.abs(num);
  let e = Math.floor(Math.log2(absVal));
  let mantF = absVal / Math.pow(2, e) - 1.0;
  let mInt = bankersRound(mantF * mScale);
  if (mInt >= mScale) {
    mInt = 0;
    e += 1;
  }
  const maxE = (1 << eB) - 2;
  let sExp;
  if (e + bias > maxE) {
    sExp = maxE;
    mInt = mScale - 1;
  } else if (e + bias <= 0) {
    sExp = 0;
    mInt = Math.min(
      bankersRound((absVal / Math.pow(2, 1 - bias)) * mScale),
      mScale - 1,
    );
  } else {
    sExp = e + bias;
  }
  const signBit = String(sign),
    expStr = sExp.toString(2).padStart(eB, "0"),
    mantStr = mInt.toString(2).padStart(mB, "0"),
    full = signBit + expStr + mantStr;
  let recon;
  if (sExp === 0)
    recon = (((sign ? -1 : 1) * mInt) / mScale) * Math.pow(2, 1 - bias);
  else recon = (sign ? -1 : 1) * (1 + mInt / mScale) * Math.pow(2, sExp - bias);
  const intP = Math.floor(absVal),
    fracP = absVal - intP;
  const intBinSteps = [];
  let ni = intP;
  if (ni === 0) intBinSteps.push({ n: 0, q: 0, rem: 0 });
  else {
    while (ni > 0) {
      intBinSteps.unshift({ n: ni, q: Math.floor(ni / 2), rem: ni % 2 });
      ni = Math.floor(ni / 2);
    }
  }
  const fracSteps = [];
  let fr = fracP;
  for (let i = 0; i < mB + 2 && fr > 0; i++) {
    fr *= 2;
    const b = Math.floor(fr);
    fracSteps.push({
      calc: `${(fr / 2).toFixed(4)} × 2 = ${fr.toFixed(4)}`,
      bit: b,
    });
    fr -= b;
  }
  const hexStr = buildHex(full);
  const normalizedStr = e !== 0 ? `1.${mantStr} × 2^${e}` : "1.0 × 2^0";
  return {
    num,
    bits,
    total,
    name,
    sign,
    sExp,
    mInt,
    eB,
    mB,
    bias,
    full,
    hexStr,
    recon,
    error: num - recon,
    relError: num !== 0 ? Math.abs((num - recon) / num) * 100 : 0,
    signBit,
    expStr,
    mantStr,
    binGroups: mkGroups(full),
    actualExp: e,
    mantF,
    intBin: intP.toString(2) || "0",
    fracBin: (() => {
      let fr2 = fracP,
        s = "";
      for (let i = 0; i < mB + 4 && fr2 > 0; i++) {
        fr2 *= 2;
        s += Math.floor(fr2);
        fr2 -= Math.floor(fr2);
      }
      return s || "0";
    })(),
    intPart: intP,
    fracPart: fracP,
    intBinSteps,
    fracSteps,
    normalizedStr,
  };
};
const buildHex = (full) => {
  let s = full;
  while (s.length % 4) s = "0" + s;
  let h = "";
  for (let i = 0; i < s.length; i += 4)
    h += parseInt(s.slice(i, i + 4), 2)
      .toString(16)
      .toUpperCase();
  return "0x" + h;
};
const mkGroups = (full) => {
  let s = full;
  while (s.length % 4) s = "0" + s;
  const g = [];
  for (let i = 0; i < s.length; i += 4)
    g.push({
      bin: s.slice(i, i + 4),
      hex: parseInt(s.slice(i, i + 4), 2)
        .toString(16)
        .toUpperCase(),
    });
  return g;
};

// Qm.n
const calcQmn = (rawVal, mStr, nStr) => {
  const f = parseFloat(rawVal),
    m = parseInt(mStr),
    n = parseInt(nStr);
  if (
    isNaN(f) ||
    isNaN(m) ||
    isNaN(n) ||
    m < 0 ||
    n < 1 ||
    m + n < 2 ||
    m + n > 32
  )
    return null;
  const total = m + n,
    scale = Math.pow(2, n),
    res = 1 / scale,
    minInt = -(1 << (total - 1)),
    maxInt = (1 << (total - 1)) - 1,
    minFlt = minInt / scale,
    maxFlt = maxInt / scale;
  const inRange = f >= minFlt && f <= maxFlt,
    scaled = f * scale,
    rounded = bankersRound(scaled),
    stored = Math.max(minInt, Math.min(maxInt, rounded));
  const recon = stored / scale,
    error = f - recon,
    errLsb = error / res;
  const binStr = (() => {
    if (stored >= 0) return stored.toString(2).padStart(total, "0");
    const t = (1 << total) + stored;
    return t.toString(2).padStart(total, "0");
  })();
  const hexStr = (() => {
    const bytes = Math.ceil(total / 8),
      uVal = stored >= 0 ? stored : (1 << total) + stored;
    return (
      "0x" +
      uVal
        .toString(16)
        .toUpperCase()
        .padStart(bytes * 2, "0")
    );
  })();
  return {
    f,
    m,
    n,
    total,
    scale,
    res,
    minInt,
    maxInt,
    minFlt,
    maxFlt,
    inRange,
    scaled,
    rounded,
    stored,
    recon,
    error,
    errLsb,
    binStr,
    hexStr,
    signPart: binStr.slice(0, 1),
    intPart: m > 1 ? binStr.slice(1, m) : "",
    fracPart: binStr.slice(m),
    pass: Math.abs(error) <= res / 2 + 1e-12,
    steps: [
      {
        s: "1",
        d: `Multiply by scale factor (2^${n} = ${scale})`,
        c: `${f} × ${scale} = ${scaled.toFixed(6)}`,
      },
      {
        s: "2",
        d: "Round — Banker's rounding (round-half-to-even)",
        c: `round(${scaled.toFixed(6)}) = ${rounded}`,
      },
      {
        s: "3",
        d: `Saturate to Q${m}.${n} range [${minInt}, ${maxInt}]`,
        c: `${stored}  (${inRange ? "within range" : "CLAMPED ⚠"})`,
      },
      { s: "4", d: `${total}-bit two's complement binary`, c: binStr },
      {
        s: "5",
        d: "Reconstruct (stored ÷ scale)",
        c: `${stored} ÷ ${scale} = ${recon.toFixed(8)}`,
      },
    ],
  };
};
const batchQmn = (raw, m, n) =>
  raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseFloat)
    .filter((v) => !isNaN(v))
    .map((f) => calcQmn(f, m, n))
    .filter(Boolean);

// Design tokens
const C = {
  bg: "#030a05",
  panel: "#06100a",
  border: "#0f2416",
  accent: "#00ff80",
  dim: "#1f4a2c",
  muted: "#3a7a50",
  text: "#a8e8c0",
  err: "#ff6b6b",
  warn: "#ffb347",
  info: "#38bdf8",
  orange: "#ff6b35",
  gold: "#facc15",
};
const mono = "'Space Mono', monospace",
  orb = "'Orbitron', monospace";

// Primitives
const Lbl = ({ c, children }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 9,
      color: c || C.muted,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 4,
    }}
  >
    {children}
  </div>
);
const TxtIn = ({ value, onChange, ph }) => (
  <input
    type="text"
    value={value}
    placeholder={ph}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "#030805",
      border: `1px solid ${C.border}`,
      color: C.accent,
      fontFamily: mono,
      fontSize: 12,
      padding: "7px 10px",
      borderRadius: 4,
      width: "100%",
      outline: "none",
      boxSizing: "border-box",
    }}
  />
);
const NumIn = ({ value, onChange, min, max, step, ph }) => (
  <input
    type="number"
    value={value}
    placeholder={ph}
    onChange={(e) => onChange(e.target.value)}
    min={min}
    max={max}
    step={step ?? "any"}
    style={{
      background: "#030805",
      border: `1px solid ${C.border}`,
      color: C.accent,
      fontFamily: mono,
      fontSize: 12,
      padding: "7px 10px",
      borderRadius: 4,
      width: "100%",
      outline: "none",
      boxSizing: "border-box",
    }}
  />
);
const TxtArea = ({ value, onChange, ph, rows = 4 }) => (
  <textarea
    value={value}
    placeholder={ph}
    rows={rows}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "#030805",
      border: `1px solid ${C.border}`,
      color: C.accent,
      fontFamily: mono,
      fontSize: 11,
      padding: "7px 10px",
      borderRadius: 4,
      width: "100%",
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",
    }}
  />
);
const Field = ({ label, value, onChange, min, max, step }) => (
  <div style={{ marginBottom: 10 }}>
    <Lbl>{label}</Lbl>
    <NumIn
      value={value}
      onChange={(v) => onChange(parseFloat(v))}
      min={min}
      max={max}
      step={step}
    />
  </div>
);
const RunBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: `linear-gradient(135deg,${C.accent},#00b058)`,
      color: "#000",
      fontFamily: mono,
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: "uppercase",
      border: "none",
      padding: "9px 0",
      borderRadius: 4,
      cursor: "pointer",
      width: "100%",
      marginTop: 6,
    }}
  >
    ▶ Run Batch
  </button>
);
const CalcBtn = ({ onClick, label = "⟹  Calculate", col }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      color: col || C.accent,
      fontFamily: mono,
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: "uppercase",
      border: `1px solid ${(col || C.accent) + "44"}`,
      padding: "9px 0",
      borderRadius: 4,
      cursor: "pointer",
      width: "100%",
      marginTop: 6,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = col || C.accent)}
    onMouseLeave={(e) =>
      (e.currentTarget.style.borderColor = (col || C.accent) + "44")
    }
  >
    {label}
  </button>
);
const Badge = ({ pass }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 12px",
      borderRadius: 999,
      fontSize: 10,
      fontFamily: mono,
      fontWeight: 700,
      letterSpacing: 1,
      background: pass ? "#00ff8015" : "#ff4a4a15",
      color: pass ? C.accent : C.err,
      border: `1px solid ${pass ? C.accent + "44" : C.err + "44"}`,
    }}
  >
    {pass ? "PASS ✓" : "FAIL ✗"}
  </span>
);
const Chip = ({ label, value, color }) => (
  <div
    style={{
      background: "#040b06",
      border: `1px solid ${C.border}`,
      borderRadius: 5,
      padding: "8px 12px",
      flex: 1,
      minWidth: 100,
    }}
  >
    <div
      style={{
        fontFamily: mono,
        fontSize: 8,
        color: C.muted,
        letterSpacing: 2,
        marginBottom: 3,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: mono,
        fontSize: 12,
        color: color || C.accent,
        wordBreak: "break-all",
      }}
    >
      {value}
    </div>
  </div>
);
const Panel = ({ children, style }) => (
  <div
    style={{
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 7,
      padding: 16,
      ...style,
    }}
  >
    {children}
  </div>
);
const SecTitle = ({ children, color }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 9,
      color: color || C.muted,
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 12,
      borderLeft: `2px solid ${color || C.accent}`,
      paddingLeft: 8,
    }}
  >
    {children}
  </div>
);
const RRow = ({ label, value, color, small }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${C.border}`,
      padding: "6px 0",
      gap: 8,
    }}
  >
    <span
      style={{
        fontFamily: mono,
        fontSize: 9,
        color: C.muted,
        letterSpacing: 1,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: mono,
        fontSize: small ? 9 : 12,
        color: color || C.accent,
        textAlign: "right",
        wordBreak: "break-all",
      }}
    >
      {value}
    </span>
  </div>
);
const Hr = () => (
  <div style={{ borderTop: `1px solid ${C.border}`, margin: "10px 0" }} />
);
const Table = ({ cols, rows, maxRows = 24 }) => (
  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: mono,
        fontSize: 10,
      }}
    >
      <thead>
        <tr>
          {cols.map((c) => (
            <th
              key={c}
              style={{
                padding: "5px 8px",
                textAlign: "right",
                color: C.muted,
                fontSize: 8,
                letterSpacing: 1,
                textTransform: "uppercase",
                borderBottom: `1px solid ${C.border}`,
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, maxRows).map((r, i) => (
          <tr
            key={i}
            style={{ background: i % 2 === 0 ? "#030805" : "transparent" }}
          >
            {Object.values(r).map((v, j) => (
              <td
                key={j}
                style={{
                  padding: "4px 8px",
                  textAlign: "right",
                  color: "#88d0a0",
                  borderBottom: `1px solid #070e09`,
                  whiteSpace: "nowrap",
                }}
              >
                {typeof v === "number"
                  ? Number.isInteger(v)
                    ? v
                    : Math.abs(v) < 0.0001 && v !== 0
                      ? v.toExponential(3)
                      : v.toFixed(6)
                  : v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length > maxRows && (
      <div
        style={{
          textAlign: "center",
          color: C.dim,
          fontSize: 9,
          padding: 6,
          fontFamily: mono,
        }}
      >
        …{rows.length - maxRows} more rows
      </div>
    )}
  </div>
);

const WaveChart = ({ series, height = 88 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !series.length) return;
    const ctx = cv.getContext("2d"),
      W = cv.width,
      H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(0,255,128,0.06)";
    ctx.lineWidth = 1;
    [0, 1, 2, 3, 4].forEach((i) => {
      const y = (i / 4) * H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    });
    ctx.strokeStyle = "rgba(0,255,128,0.18)";
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    const all = series.flatMap((s) => s.data || []);
    const mn = Math.min(...all),
      mx = Math.max(...all),
      rng = mx - mn || 1;
    const pal = ["#00ff80", "#ff6b35", "#38bdf8", "#facc15"];
    series.forEach(({ data, color }, si) => {
      if (!data?.length) return;
      ctx.strokeStyle = color || pal[si % 4];
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * W,
          y = H - ((v - mn) / rng) * (H * 0.86) - H * 0.07;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [series, height]);
  return (
    <canvas
      ref={ref}
      width={520}
      height={height}
      style={{ width: "100%", height, display: "block", borderRadius: 3 }}
    />
  );
};

// Manual panels A1-A4
const ManualA1 = () => {
  const [sv, setSv] = useState(""),
    [mv, setMv] = useState(""),
    [res, setRes] = useState(null),
    [mres, setMres] = useState(null);
  const doS = () => {
    setRes(sA1(sv));
    setMres(null);
  };
  const doM = () => {
    const ns = mv
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(parseFloat)
      .filter((v) => !isNaN(v));
    if (!ns.length) return;
    setMres(
      ns.map((f) => {
        const q = floatToQ15(f),
          rec = q15ToFloat(q),
          err = f - rec;
        return {
          float: f,
          q15: q,
          hex: toHex(q),
          recon: rec,
          error: err,
          lsb: (err / (1 / Q15_SCALE)).toFixed(3),
        };
      }),
    );
    setRes(null);
  };
  return (
    <Panel style={{ borderColor: `${C.accent}22` }}>
      <SecTitle color={C.accent}>Manual Value Calculator</SecTitle>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Lbl c={C.accent}>Single Float (−1 to +1)</Lbl>
          <TxtIn value={sv} onChange={setSv} ph="e.g. 0.707107" />
          <CalcBtn onClick={doS} />
          {res && (
            <div style={{ marginTop: 14 }}>
              <RRow label="Input Float" value={res.f.toFixed(8)} />
              <RRow label="→ Q15 Dec" value={res.q} />
              <RRow label="→ Q15 Hex" value={res.hex} />
              <RRow label="→ Binary" value={res.bin} small />
              <RRow label="→ Reconstructed" value={res.rec.toFixed(8)} />
              <Hr />
              <RRow
                label="Abs Error"
                value={fmtE(res.err)}
                color={Math.abs(res.err) < 1e-9 ? C.accent : C.warn}
              />
              <RRow
                label="Error (LSBs)"
                value={res.errLsb.toFixed(4)}
                color={Math.abs(res.errLsb) <= 0.5 ? C.accent : C.err}
              />
              <RRow
                label="½ LSB Tol."
                value={(0.5 / Q15_SCALE).toExponential(4)}
                color={C.muted}
              />
              <div style={{ marginTop: 10 }}>
                <Badge pass={res.pass} />
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Lbl c={C.accent}>Multiple Values</Lbl>
          <TxtArea value={mv} onChange={setMv} ph="0.5, -0.3, 0.707" />
          <CalcBtn onClick={doM} />
          {mres && (
            <div style={{ marginTop: 12 }}>
              <Table
                cols={["Float", "Q15", "Hex", "Recon", "Error", "LSBs"]}
                rows={mres}
              />
              <div
                style={{
                  marginTop: 8,
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.muted,
                }}
              >
                Max |error|:{" "}
                {Math.max(...mres.map((r) => Math.abs(r.error))).toExponential(
                  4,
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};
const ManualA2 = () => {
  const [sv, setSv] = useState(""),
    [gain, setGain] = useState("1.5"),
    [mv, setMv] = useState(""),
    [res, setRes] = useState(null),
    [mres, setMres] = useState(null);
  const doS = () => {
    setRes(sA2(sv, gain));
    setMres(null);
  };
  const doM = () => {
    const ns = mv
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(parseFloat)
      .filter((v) => !isNaN(v));
    if (!ns.length) return;
    const g = parseFloat(gain);
    setMres(
      ns.map((f) => {
        const r = sA2(f, g);
        return {
          float: f,
          q15In: r.qIn,
          floatG: r.fG,
          q15Out: r.qOut,
          recon: r.rec,
          error: r.err,
        };
      }),
    );
    setRes(null);
  };
  return (
    <Panel style={{ borderColor: `${C.accent}22` }}>
      <SecTitle color={C.accent}>Manual Value Calculator</SecTitle>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: 10 }}>
            <Lbl c={C.accent}>Gain</Lbl>
            <TxtIn value={gain} onChange={setGain} ph="1.5" />
          </div>
          <Lbl c={C.accent}>Single Float Input</Lbl>
          <TxtIn value={sv} onChange={setSv} ph="e.g. 0.6" />
          <CalcBtn onClick={doS} />
          {res && (
            <div style={{ marginTop: 14 }}>
              <RRow label="Input Float" value={res.f.toFixed(8)} />
              <RRow label="Q15 Input" value={`${res.qIn}  ${res.hexIn}`} />
              <RRow label="Gain" value={`${res.g} → Q14=${res.gQ14}`} />
              <RRow
                label="Float×Gain"
                value={res.fG.toFixed(8)}
                color={C.orange}
              />
              <RRow label="→ Q15 Output" value={`${res.qOut}  ${res.hexOut}`} />
              <RRow
                label="→ Reconstructed"
                value={res.rec.toFixed(8)}
                color={C.info}
              />
              <Hr />
              <RRow
                label="Abs Error"
                value={fmtE(res.err)}
                color={Math.abs(res.err) < 2 / Q15_SCALE ? C.accent : C.warn}
              />
              <div style={{ marginTop: 10 }}>
                <Badge pass={Math.abs(res.err) < 2 / Q15_SCALE} />
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Lbl c={C.accent}>Multiple Values</Lbl>
          <TxtArea value={mv} onChange={setMv} ph="0.4, -0.3, 0.6" />
          <CalcBtn onClick={doM} />
          {mres && (
            <div style={{ marginTop: 12 }}>
              <Table
                cols={["Float", "Q15In", "FloatG", "Q15Out", "Recon", "Error"]}
                rows={mres}
              />
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};
const ManualA3 = () => {
  const [sv, setSv] = useState(""),
    [clip, setClip] = useState("0.8"),
    [mv, setMv] = useState(""),
    [res, setRes] = useState(null),
    [mres, setMres] = useState(null);
  const doS = () => {
    setRes(sA3(sv, clip));
    setMres(null);
  };
  const doM = () => {
    const ns = mv
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(parseFloat)
      .filter((v) => !isNaN(v));
    if (!ns.length) return;
    const cl = parseFloat(clip);
    setMres(
      ns.map((f) => {
        const r = sA3(f, cl);
        return {
          float: f,
          clippedF: r.fC,
          q15In: r.qIn,
          q15Clip: r.qC,
          recon: r.rec,
          err: r.err,
          clipped: r.clipped ? "YES" : "—",
        };
      }),
    );
    setRes(null);
  };
  return (
    <Panel style={{ borderColor: `${C.accent}22` }}>
      <SecTitle color={C.accent}>Manual Value Calculator</SecTitle>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: 10 }}>
            <Lbl c={C.accent}>Clip Level (0–1)</Lbl>
            <TxtIn value={clip} onChange={setClip} ph="0.8" />
          </div>
          <Lbl c={C.accent}>Float Input (any amplitude)</Lbl>
          <TxtIn value={sv} onChange={setSv} ph="e.g. 1.0" />
          <CalcBtn onClick={doS} />
          {res && (
            <div style={{ marginTop: 14 }}>
              <RRow label="Input Float" value={res.f.toFixed(8)} />
              <RRow label="Clip ±" value={`${res.cl}  (Q15 ±${res.cP})`} />
              <RRow
                label="Clipped?"
                value={res.clipped ? "YES ⚠" : "NO"}
                color={res.clipped ? C.warn : C.accent}
              />
              <RRow
                label="Float Clipped"
                value={res.fC.toFixed(8)}
                color={C.orange}
              />
              <RRow label="Q15 Input" value={`${res.qIn}  ${res.hexIn}`} />
              <RRow label="→ Q15 Clip" value={`${res.qC}  ${res.hexClip}`} />
              <RRow
                label="→ Reconstructed"
                value={res.rec.toFixed(8)}
                color={C.info}
              />
              <Hr />
              <RRow
                label="Abs Error"
                value={fmtE(res.err)}
                color={Math.abs(res.err) < 2 / Q15_SCALE ? C.accent : C.warn}
              />
              <div style={{ marginTop: 10 }}>
                <Badge pass={Math.abs(res.err) < 2 / Q15_SCALE} />
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Lbl c={C.accent}>Multiple Values</Lbl>
          <TxtArea value={mv} onChange={setMv} ph="1.0, 0.8, 0.5, -1.0" />
          <CalcBtn onClick={doM} />
          {mres && (
            <div style={{ marginTop: 12 }}>
              <Table
                cols={[
                  "Float",
                  "Clip(f)",
                  "Q15In",
                  "Q15Clip",
                  "Recon",
                  "Error",
                  "Clip?",
                ]}
                rows={mres}
              />
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};
const ManualA4 = () => {
  const [xn, setXn] = useState(""),
    [b0, setB0] = useState("0.2929"),
    [b1, setB1] = useState("0.2929"),
    [a1, setA1] = useState("-0.4142"),
    [x1, setX1] = useState("0.0"),
    [y1, setY1] = useState("0.0"),
    [res, setRes] = useState(null);
  return (
    <Panel style={{ borderColor: `${C.accent}22` }}>
      <SecTitle color={C.accent}>Manual Single-Sample Calculator</SecTitle>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9,
          color: C.muted,
          marginBottom: 12,
        }}
      >
        y[n] = B0·x[n] + B1·x[n−1] − A1·y[n−1]
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[
              ["B0", b0, setB0],
              ["B1", b1, setB1],
              ["A1", a1, setA1],
              ["x[n]", xn, setXn],
              ["x[n−1]", x1, setX1],
              ["y[n−1]", y1, setY1],
            ].map(([l, v, sv]) => (
              <div key={l}>
                <Lbl c={C.accent}>{l}</Lbl>
                <TxtIn value={v} onChange={sv} ph="0.0" />
              </div>
            ))}
          </div>
          <CalcBtn onClick={() => setRes(sA4(xn, b0, b1, a1, x1, y1))} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {res ? (
            <div>
              <RRow label="x[n]" value={res.f.toFixed(8)} />
              <RRow label="x[n]→Q15" value={`${res.xq}  ${res.hexXq}`} />
              <Hr />
              <RRow label="B0q" value={`${res.B0q}  ${toHex(res.B0q)}`} />
              <RRow label="B1q" value={`${res.B1q}  ${toHex(res.B1q)}`} />
              <RRow label="A1q" value={`${res.A1q}  ${toHex(res.A1q)}`} />
              <Hr />
              <RRow
                label="y[n] Float"
                value={res.yF.toFixed(8)}
                color={C.orange}
              />
              <RRow label="y[n] Q15" value={`${res.yq}  ${res.hexYq}`} />
              <RRow
                label="y[n] Float←Q15"
                value={res.yQ15.toFixed(8)}
                color={C.info}
              />
              <Hr />
              <RRow
                label="Error"
                value={fmtE(res.err)}
                color={Math.abs(res.err) < 2 / Q15_SCALE ? C.accent : C.warn}
              />
              <div
                style={{
                  marginTop: 10,
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.dim,
                }}
              >
                Next: x[n−1]←{res.f.toFixed(6)} · y[n−1]←{res.yQ15.toFixed(6)}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 140,
                color: C.dim,
                fontFamily: mono,
                fontSize: 11,
              }}
            >
              Fill in values and press Calculate
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};

// A1-A4 batch views
const A1View = () => {
  const [p, setP] = useState({
      freqHz: 1000,
      fsHz: 8000,
      amplitude: 0.9,
      nSamples: 10,
    }),
    [res, setRes] = useState(null);
  const set = (k) => (v) => setP((prev) => ({ ...prev, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Panel style={{ flex: "0 0 208px" }}>
          <SecTitle>Signal Parameters</SecTitle>
          <Field
            label="Frequency (Hz)"
            value={p.freqHz}
            onChange={set("freqHz")}
            min={10}
            max={20000}
            step={10}
          />
          <Field
            label="Sample Rate (Hz)"
            value={p.fsHz}
            onChange={set("fsHz")}
            min={8000}
            max={96000}
            step={1000}
          />
          <Field
            label="Amplitude (0−1)"
            value={p.amplitude}
            onChange={set("amplitude")}
            min={0.01}
            max={1}
            step={0.01}
          />
          <Field
            label="Samples"
            value={p.nSamples}
            onChange={set("nSamples")}
            min={4}
            max={64}
            step={1}
          />
          <RunBtn onClick={() => setRes(runA1(p))} />
        </Panel>
        <div
          style={{
            flex: 1,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {res ? (
            <>
              <Panel>
                <SecTitle>Waveform</SecTitle>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 6,
                    fontFamily: mono,
                    fontSize: 9,
                  }}
                >
                  <span style={{ color: C.accent }}>■ Original</span>
                  <span style={{ color: C.orange }}>■ Reconstructed</span>
                </div>
                <WaveChart
                  series={[
                    { data: res.rows.map((r) => r.orig), color: C.accent },
                    { data: res.rows.map((r) => r.recon), color: C.orange },
                  ]}
                />
              </Panel>
              <Panel>
                <SecTitle>Metrics</SecTitle>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip
                    label="SNR"
                    value={isFinite(res.snr) ? res.snr.toFixed(2) + " dB" : "∞"}
                  />
                  <Chip label="Max Error" value={res.mae.toExponential(4)} />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Badge pass={res.pass} />
                  </div>
                </div>
              </Panel>
              <Panel>
                <SecTitle>Table</SecTitle>
                <Table
                  cols={["n", "Orig", "Q15", "Hex", "Bin", "Recon", "Err"]}
                  rows={res.rows.map((r) => ({
                    n: r.n,
                    orig: r.orig,
                    q15: r.q15,
                    hex: r.hex,
                    bin: r.bin,
                    recon: r.recon,
                    err: r.err,
                  }))}
                />
              </Panel>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 160,
                color: C.dim,
                fontFamily: mono,
                fontSize: 11,
                border: `1px solid ${C.border}`,
                borderRadius: 7,
              }}
            >
              Set parameters and press Run
            </div>
          )}
        </div>
      </div>
      <ManualA1 />
    </div>
  );
};
const A2View = () => {
  const [p, setP] = useState({
      freqHz: 1000,
      fsHz: 8000,
      amplitude: 0.6,
      nSamples: 10,
      gain: 1.5,
    }),
    [res, setRes] = useState(null);
  const set = (k) => (v) => setP((prev) => ({ ...prev, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Panel style={{ flex: "0 0 208px" }}>
          <SecTitle>Signal Parameters</SecTitle>
          <Field
            label="Frequency (Hz)"
            value={p.freqHz}
            onChange={set("freqHz")}
            min={10}
            max={20000}
            step={10}
          />
          <Field
            label="Sample Rate (Hz)"
            value={p.fsHz}
            onChange={set("fsHz")}
            min={8000}
            max={96000}
            step={1000}
          />
          <Field
            label="Amplitude (≤0.8)"
            value={p.amplitude}
            onChange={set("amplitude")}
            min={0.01}
            max={0.8}
            step={0.01}
          />
          <Field
            label="Samples"
            value={p.nSamples}
            onChange={set("nSamples")}
            min={4}
            max={64}
            step={1}
          />
          <Field
            label="Gain"
            value={p.gain}
            onChange={set("gain")}
            min={0.1}
            max={2.0}
            step={0.01}
          />
          <RunBtn onClick={() => setRes(runA2(p))} />
        </Panel>
        <div
          style={{
            flex: 1,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {res ? (
            <>
              <Panel>
                <SecTitle>Waveform</SecTitle>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 6,
                    fontFamily: mono,
                    fontSize: 9,
                  }}
                >
                  <span style={{ color: C.accent }}>■ Input</span>
                  <span style={{ color: C.orange }}>■ Float×G</span>
                  <span style={{ color: C.info }}>■ Q15 Out</span>
                </div>
                <WaveChart
                  series={[
                    { data: res.rows.map((r) => r.input), color: C.accent },
                    { data: res.rows.map((r) => r.floatG), color: C.orange },
                    { data: res.rows.map((r) => r.recon), color: C.info },
                  ]}
                />
              </Panel>
              <Panel>
                <SecTitle>Metrics</SecTitle>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip label="Q14 Coeff" value={res.gainQ14} />
                  <Chip label="SNR" value={res.snr.toFixed(2) + " dB"} />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Badge pass={res.pass} />
                  </div>
                </div>
              </Panel>
              <Panel>
                <SecTitle>Table</SecTitle>
                <Table
                  cols={[
                    "n",
                    "In",
                    "FloatG",
                    "Q15In",
                    "Q15Out",
                    "Recon",
                    "Err",
                  ]}
                  rows={res.rows.map((r) => ({
                    n: r.n,
                    input: r.input,
                    floatG: r.floatG,
                    q15In: r.q15In,
                    q15Out: r.q15Out,
                    recon: r.recon,
                    err: r.err,
                  }))}
                />
              </Panel>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 160,
                color: C.dim,
                fontFamily: mono,
                fontSize: 11,
                border: `1px solid ${C.border}`,
                borderRadius: 7,
              }}
            >
              Set parameters and press Run
            </div>
          )}
        </div>
      </div>
      <ManualA2 />
    </div>
  );
};
const A3View = () => {
  const [p, setP] = useState({
      freqHz: 1000,
      fsHz: 8000,
      nSamples: 20,
      clipLevel: 0.8,
    }),
    [res, setRes] = useState(null);
  const set = (k) => (v) => setP((prev) => ({ ...prev, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Panel style={{ flex: "0 0 208px" }}>
          <SecTitle>Signal Parameters</SecTitle>
          <Field
            label="Frequency (Hz)"
            value={p.freqHz}
            onChange={set("freqHz")}
            min={10}
            max={20000}
            step={10}
          />
          <Field
            label="Sample Rate (Hz)"
            value={p.fsHz}
            onChange={set("fsHz")}
            min={8000}
            max={96000}
            step={1000}
          />
          <Field
            label="Samples"
            value={p.nSamples}
            onChange={set("nSamples")}
            min={8}
            max={64}
            step={1}
          />
          <Field
            label="Clip Level (0−1)"
            value={p.clipLevel}
            onChange={set("clipLevel")}
            min={0.1}
            max={0.99}
            step={0.01}
          />
          <RunBtn onClick={() => setRes(runA3(p))} />
        </Panel>
        <div
          style={{
            flex: 1,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {res ? (
            <>
              <Panel>
                <SecTitle>Waveform</SecTitle>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 6,
                    fontFamily: mono,
                    fontSize: 9,
                  }}
                >
                  <span style={{ color: C.accent }}>■ Orig</span>
                  <span style={{ color: C.orange }}>■ Float Clip</span>
                  <span style={{ color: C.info }}>■ Q15 Clip</span>
                </div>
                <WaveChart
                  height={100}
                  series={[
                    { data: res.rows.map((r) => r.orig), color: C.accent },
                    { data: res.rows.map((r) => r.clippedF), color: C.orange },
                    { data: res.rows.map((r) => r.recon), color: C.info },
                  ]}
                />
              </Panel>
              <Panel>
                <SecTitle>Metrics</SecTitle>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip label="Q15 Clip +" value={res.clipPos} />
                  <Chip label="Q15 Clip −" value={res.clipNeg} />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Badge pass={res.pass} />
                  </div>
                </div>
              </Panel>
              <Panel>
                <SecTitle>Table</SecTitle>
                <Table
                  cols={[
                    "n",
                    "Orig",
                    "ClipF",
                    "Q15In",
                    "Q15Clip",
                    "Recon",
                    "Err",
                  ]}
                  rows={res.rows.map((r) => ({
                    n: r.n,
                    orig: r.orig,
                    clippedF: r.clippedF,
                    q15In: r.q15In,
                    q15Clip: r.q15Clip,
                    recon: r.recon,
                    err: r.err,
                  }))}
                />
              </Panel>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 160,
                color: C.dim,
                fontFamily: mono,
                fontSize: 11,
                border: `1px solid ${C.border}`,
                borderRadius: 7,
              }}
            >
              Set parameters and press Run
            </div>
          )}
        </div>
      </div>
      <ManualA3 />
    </div>
  );
};
const A4View = () => {
  const [p, setP] = useState({
      freqHz: 1000,
      fsHz: 8000,
      amplitude: 0.9,
      nSamples: 30,
      B0: 0.2929,
      B1: 0.2929,
      A1: -0.4142,
    }),
    [res, setRes] = useState(null);
  const set = (k) => (v) => setP((prev) => ({ ...prev, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div
          style={{
            flex: "0 0 208px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Panel>
            <SecTitle>Signal</SecTitle>
            <Field
              label="Frequency (Hz)"
              value={p.freqHz}
              onChange={set("freqHz")}
              min={10}
              max={20000}
              step={10}
            />
            <Field
              label="Sample Rate (Hz)"
              value={p.fsHz}
              onChange={set("fsHz")}
              min={8000}
              max={96000}
              step={1000}
            />
            <Field
              label="Amplitude (0−1)"
              value={p.amplitude}
              onChange={set("amplitude")}
              min={0.01}
              max={1}
              step={0.01}
            />
            <Field
              label="Samples"
              value={p.nSamples}
              onChange={set("nSamples")}
              min={8}
              max={64}
              step={1}
            />
          </Panel>
          <Panel>
            <SecTitle>IIR Coefficients</SecTitle>
            <Field
              label="B0"
              value={p.B0}
              onChange={set("B0")}
              min={-1}
              max={1}
              step={0.0001}
            />
            <Field
              label="B1"
              value={p.B1}
              onChange={set("B1")}
              min={-1}
              max={1}
              step={0.0001}
            />
            <Field
              label="A1 (negative)"
              value={p.A1}
              onChange={set("A1")}
              min={-1}
              max={1}
              step={0.0001}
            />
            <RunBtn onClick={() => setRes(runA4(p))} />
          </Panel>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {res ? (
            <>
              <Panel>
                <SecTitle>Waveform</SecTitle>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 6,
                    fontFamily: mono,
                    fontSize: 9,
                  }}
                >
                  <span style={{ color: C.accent }}>■ Input</span>
                  <span style={{ color: C.orange }}>■ Float IIR</span>
                  <span style={{ color: C.info }}>■ Q15 IIR</span>
                </div>
                <WaveChart
                  height={100}
                  series={[
                    { data: res.rows.map((r) => r.x), color: C.accent },
                    { data: res.rows.map((r) => r.yFloat), color: C.orange },
                    { data: res.rows.map((r) => r.yQ15), color: C.info },
                  ]}
                />
              </Panel>
              <Panel>
                <SecTitle>Q15 Coefficients</SecTitle>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip label="B0q" value={`${res.B0q}  ${toHex(res.B0q)}`} />
                  <Chip label="B1q" value={`${res.B1q}  ${toHex(res.B1q)}`} />
                  <Chip label="A1q" value={`${res.A1q}  ${toHex(res.A1q)}`} />
                </div>
              </Panel>
              <Panel>
                <SecTitle>Metrics</SecTitle>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip
                    label="SNR"
                    value={isFinite(res.snr) ? res.snr.toFixed(2) + " dB" : "∞"}
                  />
                  <Chip label="Max Error" value={res.mae.toExponential(4)} />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Badge pass={res.pass} />
                  </div>
                </div>
              </Panel>
              <Panel>
                <SecTitle>Table</SecTitle>
                <Table
                  cols={["n", "x", "yFloat", "Q15In", "Q15Out", "yQ15", "Err"]}
                  rows={res.rows.map((r) => ({
                    n: r.n,
                    x: r.x,
                    yFloat: r.yFloat,
                    q15In: r.q15In,
                    q15Out: r.q15Out,
                    yQ15: r.yQ15,
                    err: r.err,
                  }))}
                />
              </Panel>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 160,
                color: C.dim,
                fontFamily: mono,
                fontSize: 11,
                border: `1px solid ${C.border}`,
                borderRadius: 7,
              }}
            >
              Set parameters and press Run
            </div>
          )}
        </div>
      </div>
      <ManualA4 />
    </div>
  );
};

// A5 – IEEE-754
const BitViz = ({ signBit, expStr, mantStr, eB, mB }) => {
  const parts = [
    { bits: signBit.split(""), label: "Sign", color: "#ff6b35" },
    { bits: expStr.split(""), label: `Exp (${eB}b)`, color: "#38bdf8" },
    { bits: mantStr.split(""), label: `Mantissa (${mB}b)`, color: "#00ff80" },
  ];
  return (
    <div>
      <div
        style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 8 }}
      >
        {parts.map(({ bits, label, color }) =>
          bits.map((b, i) => (
            <div
              key={label + i}
              style={{
                background: color + "22",
                border: `1px solid ${color}44`,
                borderRadius: 3,
                width: 22,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: 11,
                color,
              }}
            >
              {b}
            </div>
          )),
        )}
      </div>
      <div style={{ display: "flex", gap: 14, fontFamily: mono, fontSize: 9 }}>
        <span style={{ color: "#ff6b35" }}>■ Sign</span>
        <span style={{ color: "#38bdf8" }}>■ Exponent ({eB}b)</span>
        <span style={{ color: "#00ff80" }}>■ Mantissa ({mB}b)</span>
      </div>
    </div>
  );
};

const A5View = () => {
  const [val, setVal] = useState("5.75"),
    [bits, setBits] = useState(32),
    [res, setRes] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel style={{ borderColor: `${C.gold}22` }}>
        <SecTitle color={C.gold}>IEEE-754 Floating Point Calculator</SecTitle>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: C.muted,
            marginBottom: 16,
          }}
        >
          Enter any decimal · select bit-width · see full encoding with
          step-by-step breakdown
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 240px" }}>
            <Lbl c={C.gold}>Decimal Value</Lbl>
            <TxtIn value={val} onChange={setVal} ph="e.g. 5.75 or -3.14159" />
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <Lbl c={C.gold}>Bit Width</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                {[16, 24, 32].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBits(b)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      fontFamily: mono,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      border: `1px solid ${bits === b ? C.gold : C.border}`,
                      borderRadius: 4,
                      cursor: "pointer",
                      background: bits === b ? `${C.gold}22` : "transparent",
                      color: bits === b ? C.gold : C.muted,
                      transition: "all .12s",
                    }}
                  >
                    {b}-bit
                  </button>
                ))}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.dim,
                  marginTop: 5,
                }}
              >
                {bits === 16 && "Half · 1s+5e+10m · bias=15"}
                {bits === 24 && "Audio Extended · 1s+8e+15m · bias=127"}
                {bits === 32 && "Single · 1s+8e+23m · bias=127"}
              </div>
            </div>
            <CalcBtn
              onClick={() => setRes(calcIEEE(val, bits))}
              label="⟹  Encode IEEE-754"
              col={C.gold}
            />
          </div>
          {res && (
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.gold,
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                BIT FIELD LAYOUT
              </div>
              <BitViz
                signBit={res.signBit}
                expStr={res.expStr}
                mantStr={res.mantStr}
                eB={res.eB}
                mB={res.mB}
              />
              <div style={{ height: 10 }} />
              <RRow
                label={`${res.total}-bit Binary`}
                value={
                  <span
                    style={{
                      fontSize: 8,
                      letterSpacing: 1,
                      wordBreak: "break-all",
                    }}
                  >
                    {res.full}
                  </span>
                }
                small
              />
              <RRow label="Hexadecimal" value={res.hexStr} color={C.gold} />
              <Hr />
              <RRow
                label="Sign Bit"
                value={`${res.signBit}  (${res.num < 0 ? "Negative" : "Positive"})`}
                color="#ff6b35"
              />
              <RRow
                label="Stored Exp (dec)"
                value={`${res.sExp}  = ${res.actualExp} + bias ${res.bias}`}
                color="#38bdf8"
              />
              <RRow
                label="Stored Exp (bin)"
                value={res.expStr}
                color="#38bdf8"
                small
              />
              <RRow label="Mantissa (int)" value={res.mInt} color={C.accent} />
              <RRow
                label="Mantissa (bin)"
                value={res.mantStr}
                color={C.accent}
                small
              />
              <Hr />
              <RRow
                label="Reconstructed"
                value={res.recon.toFixed(8)}
                color={C.info}
              />
              <RRow
                label="Abs Error"
                value={fmtE(res.error)}
                color={Math.abs(res.error) < 1e-6 ? C.accent : C.warn}
              />
              <RRow
                label="Rel Error"
                value={`${res.relError.toExponential(4)} %`}
                color={C.muted}
              />
            </div>
          )}
        </div>
      </Panel>
      {res && (
        <Panel style={{ borderColor: `${C.gold}22` }}>
          <SecTitle color={C.gold}>Step-by-Step Breakdown</SecTitle>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.gold,
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                STEP 1 — INTEGER → BINARY
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: C.text,
                  marginBottom: 8,
                }}
              >
                {res.intPart}
                <sub style={{ fontSize: 9 }}>10</sub> = {res.intBin}
                <sub style={{ fontSize: 9 }}>2</sub>
              </div>
              <Table
                cols={["n", "÷2 (q)", "Rem"]}
                rows={res.intBinSteps.map((s) => ({
                  n: s.n,
                  q: s.q,
                  rem: s.rem,
                }))}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.gold,
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                STEP 2 — FRACTION → BINARY
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: C.text,
                  marginBottom: 8,
                }}
              >
                0.{String(res.fracPart.toFixed(8)).slice(2)}
                <sub style={{ fontSize: 9 }}>10</sub> = 0.{res.fracBin}
                <sub style={{ fontSize: 9 }}>2</sub>
              </div>
              {res.fracSteps.length > 0 && (
                <Table
                  cols={["Calculation", "Bit"]}
                  rows={res.fracSteps
                    .slice(0, 10)
                    .map((s) => ({ calc: s.calc, bit: s.bit }))}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.gold,
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                STEPS 3–5 — NORMALISE & ENCODE
              </div>
              {[
                {
                  s: "3",
                  d: "Combined binary",
                  v: `${res.intBin}.${res.fracBin}`,
                },
                { s: "4", d: "Normalised form", v: res.normalizedStr },
                { s: "5", d: "Actual exponent E", v: String(res.actualExp) },
                { s: "6", d: `Bias = 2^(${res.eB}-1)−1`, v: String(res.bias) },
                {
                  s: "7",
                  d: "Stored = E + Bias",
                  v: `${res.actualExp}+${res.bias}=${res.sExp}`,
                },
                { s: "8", d: `Exp → ${res.eB}-bit binary`, v: res.expStr },
                {
                  s: "9",
                  d: `Mantissa (${res.mB}-bit, no leading 1)`,
                  v: res.mantStr,
                },
              ].map(({ s, d, v }) => (
                <div
                  key={s}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    padding: "7px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        color: C.gold,
                        marginRight: 8,
                      }}
                    >
                      {s}.
                    </span>
                    <span
                      style={{ fontFamily: mono, fontSize: 9, color: C.muted }}
                    >
                      {d}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: C.accent,
                      flexShrink: 0,
                      wordBreak: "break-all",
                      textAlign: "right",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 12,
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.gold,
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                HEX GROUPS
              </div>
              <Table cols={["4-bit", "Hex"]} rows={res.binGroups} />
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              background: "#040c06",
              border: `1px solid ${C.gold}44`,
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 9,
                color: C.gold,
                letterSpacing: 3,
                marginBottom: 8,
              }}
            >
              FINAL ANSWER
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: C.text,
                lineHeight: 1.9,
              }}
            >
              <div>
                {res.num}
                <sub style={{ fontSize: 9 }}>10</sub> ={" "}
                <span style={{ color: C.accent }}>{res.full}</span>
                <sub style={{ fontSize: 9 }}>2</sub>
              </div>
              <div style={{ marginTop: 4 }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;={" "}
                <span style={{ color: C.gold, fontSize: 14 }}>
                  {res.hexStr}
                </span>
              </div>
              <div style={{ marginTop: 4, color: C.muted, fontSize: 9 }}>
                Recon: {res.recon.toFixed(8)} · Error: {fmtE(res.error)} ·
                Format: {res.name}
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
};

// A6 – Qm.n
const PRESETS = [
  { l: "Q0.8", m: 0, n: 8 },
  { l: "Q1.7", m: 1, n: 7 },
  { l: "Q1.15", m: 1, n: 15 },
  { l: "Q8.8", m: 8, n: 8 },
  { l: "Q1.31", m: 1, n: 31 },
];
const BinAnno = ({ signPart, intPart, fracPart, m, n }) => {
  const parts = [
    { bits: signPart.split(""), label: "Sign", color: "#ff6b35" },
    ...(intPart
      ? [{ bits: intPart.split(""), label: `Int(${m - 1}b)`, color: "#facc15" }]
      : []),
    { bits: fracPart.split(""), label: `Frac(${n}b)`, color: "#00ff80" },
  ];
  return (
    <div>
      <div
        style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 6 }}
      >
        {parts.map(({ bits, label, color }) =>
          bits.map((b, i) => (
            <div
              key={label + i}
              style={{
                background: color + "22",
                border: `1px solid ${color}44`,
                borderRadius: 3,
                width: 22,
                height: 29,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: 10,
                color,
              }}
            >
              {b}
            </div>
          )),
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          fontFamily: mono,
          fontSize: 9,
        }}
      >
        <span style={{ color: "#ff6b35" }}>■ Sign</span>
        {intPart && <span style={{ color: "#facc15" }}>■ Int({m - 1}b)</span>}
        <span style={{ color: "#00ff80" }}>■ Frac({n}b)</span>
      </div>
    </div>
  );
};

const A6View = () => {
  const [val, setVal] = useState("0.75"),
    [mV, setMV] = useState("1"),
    [nV, setNV] = useState("7"),
    [mv, setMv] = useState(""),
    [res, setRes] = useState(null),
    [mres, setMres] = useState(null);
  const doCalc = () => {
    setRes(calcQmn(val, mV, nV));
    setMres(null);
  };
  const doMulti = () => {
    const rs = batchQmn(mv, mV, nV);
    if (!rs.length) return;
    setMres(rs);
    setRes(null);
  };
  const total = parseInt(mV || 0) + parseInt(nV || 0),
    sc = Math.pow(2, parseInt(nV || 1));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel style={{ borderColor: `${C.info}22` }}>
        <SecTitle color={C.info}>Qm.n Fixed-Point Format Calculator</SecTitle>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: C.muted,
            marginBottom: 14,
          }}
        >
          Qm.n: m=integer bits (incl. sign) · n=fractional bits · scale=2ⁿ ·
          two's complement
        </div>
        <div style={{ marginBottom: 14 }}>
          <Lbl c={C.info}>Quick Presets</Lbl>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button
                key={p.l}
                onClick={() => {
                  setMV(String(p.m));
                  setNV(String(p.n));
                  setRes(null);
                  setMres(null);
                }}
                style={{
                  padding: "5px 12px",
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1,
                  border: `1px solid ${mV === String(p.m) && nV === String(p.n) ? C.info : C.border}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  background:
                    mV === String(p.m) && nV === String(p.n)
                      ? `${C.info}22`
                      : "transparent",
                  color:
                    mV === String(p.m) && nV === String(p.n) ? C.info : C.muted,
                  transition: "all .12s",
                }}
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 240px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div>
                <Lbl c={C.info}>m (int bits + sign)</Lbl>
                <NumIn
                  value={mV}
                  onChange={setMV}
                  min={0}
                  max={16}
                  step={1}
                  ph="1"
                />
              </div>
              <div>
                <Lbl c={C.info}>n (fractional bits)</Lbl>
                <NumIn
                  value={nV}
                  onChange={setNV}
                  min={1}
                  max={31}
                  step={1}
                  ph="7"
                />
              </div>
            </div>
            {total >= 2 && total <= 32 && (
              <div
                style={{
                  background: "#030805",
                  border: `1px solid ${C.border}`,
                  borderRadius: 5,
                  padding: 10,
                  marginBottom: 10,
                  fontFamily: mono,
                  fontSize: 9,
                }}
              >
                <div style={{ color: C.info, marginBottom: 3 }}>
                  Q{mV}.{nV} — {total}-bit
                </div>
                <div style={{ color: C.muted }}>
                  Scale: 2^{nV} = {sc.toFixed(0)}
                </div>
                <div style={{ color: C.muted }}>
                  Resolution: {(1 / sc).toFixed(8)}
                </div>
                <div style={{ color: C.muted }}>
                  Int range: [{-(1 << (total - 1))}, {(1 << (total - 1)) - 1}]
                </div>
                <div style={{ color: C.muted }}>
                  Float range: [{(-(1 << (total - 1)) / sc).toFixed(6)},{" "}
                  {(((1 << (total - 1)) - 1) / sc).toFixed(6)}]
                </div>
              </div>
            )}
            <Lbl c={C.info}>Float Value to Convert</Lbl>
            <TxtIn value={val} onChange={setVal} ph="e.g. 0.75" />
            <CalcBtn onClick={doCalc} label="⟹  Convert to Qm.n" col={C.info} />
          </div>
          {res && (
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: C.info,
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                BIT FIELD LAYOUT
              </div>
              <BinAnno
                signPart={res.signPart}
                intPart={res.intPart}
                fracPart={res.fracPart}
                m={res.m}
                n={res.n}
              />
              <div style={{ height: 10 }} />
              <RRow label="Input Float" value={res.f.toFixed(8)} />
              <RRow
                label="Format"
                value={`Q${res.m}.${res.n}  (${res.total}-bit)`}
                color={C.info}
              />
              <RRow
                label="Scale / Resolution"
                value={`${res.scale}  ·  ${res.res.toFixed(8)}`}
                color={C.muted}
              />
              <Hr />
              <RRow label="× Scale" value={res.scaled.toFixed(6)} />
              <RRow label="Rounded (Banker's)" value={res.rounded} />
              <RRow label="Stored Integer" value={res.stored} color={C.info} />
              <RRow
                label="Binary (2's comp)"
                value={
                  <span style={{ fontSize: 9, letterSpacing: 1 }}>
                    {res.binStr}
                  </span>
                }
                small
              />
              <RRow label="Hex" value={res.hexStr} color={C.gold} />
              <Hr />
              <RRow
                label="Reconstructed"
                value={res.recon.toFixed(8)}
                color={C.accent}
              />
              <RRow
                label="Abs Error"
                value={fmtE(res.error)}
                color={
                  Math.abs(res.error) <= res.res / 2 + 1e-12 ? C.accent : C.warn
                }
              />
              <RRow
                label="Error (LSBs)"
                value={res.errLsb.toFixed(4)}
                color={Math.abs(res.errLsb) <= 0.5 ? C.accent : C.err}
              />
              <RRow
                label="In Range?"
                value={res.inRange ? "YES" : "CLAMPED ⚠"}
                color={res.inRange ? C.accent : C.err}
              />
              <div style={{ marginTop: 10 }}>
                <Badge pass={res.pass} />
              </div>
            </div>
          )}
        </div>
      </Panel>
      {res && (
        <Panel style={{ borderColor: `${C.info}22` }}>
          <SecTitle color={C.info}>Step-by-Step Conversion</SecTitle>
          {res.steps.map(({ s, d, c }) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                borderBottom: `1px solid ${C.border}`,
                padding: "10px 0",
              }}
            >
              <div
                style={{
                  background: `${C.info}22`,
                  border: `1px solid ${C.info}44`,
                  borderRadius: 4,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                  fontSize: 10,
                  color: C.info,
                  flexShrink: 0,
                }}
              >
                {s}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    color: C.muted,
                    marginBottom: 3,
                  }}
                >
                  {d}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 12,
                    color: C.accent,
                    wordBreak: "break-all",
                  }}
                >
                  {c}
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 14,
              fontFamily: mono,
              fontSize: 9,
              color: C.info,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            Q FORMAT COMPARISON
          </div>
          <Table
            cols={[
              "Format",
              "FracBits",
              "Scale",
              "MinFloat",
              "MaxFloat",
              "StepSize",
            ]}
            rows={[
              {
                fmt: "Q0.8",
                n: 8,
                scale: 256,
                min: -0.5,
                max: 0.496094,
                step: 0.003906,
              },
              {
                fmt: "Q1.7",
                n: 7,
                scale: 128,
                min: -1.0,
                max: 0.992188,
                step: 0.007813,
              },
              {
                fmt: "Q1.15",
                n: 15,
                scale: 32768,
                min: -1.0,
                max: 0.999969,
                step: 0.000031,
              },
              {
                fmt: `Q${res.m}.${res.n}`,
                n: res.n,
                scale: res.scale,
                min: parseFloat(res.minFlt.toFixed(6)),
                max: parseFloat(res.maxFlt.toFixed(6)),
                step: parseFloat(res.res.toFixed(8)),
              },
            ].filter((r, i, a) => a.findIndex((t) => t.fmt === r.fmt) === i)}
          />
        </Panel>
      )}
      <Panel style={{ borderColor: `${C.info}22` }}>
        <SecTitle color={C.info}>Batch Converter</SecTitle>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: C.muted,
            marginBottom: 10,
          }}
        >
          Uses Q{mV}.{nV} set above — enter multiple floats to batch-convert
        </div>
        <TxtArea
          value={mv}
          onChange={setMv}
          ph="0.75, 0.5, -0.25, 0.125"
          rows={3}
        />
        <div style={{ marginTop: 6 }}>
          <button
            onClick={doMulti}
            style={{
              background: "transparent",
              color: C.info,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              border: `1px solid ${C.info}44`,
              padding: "9px 24px",
              borderRadius: 4,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.info)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = `${C.info}44`)
            }
          >
            ⟹ Batch Convert
          </button>
        </div>
        {mres && (
          <div style={{ marginTop: 14 }}>
            <Table
              cols={[
                "Float",
                "Stored",
                "Binary",
                "Hex",
                "Recon",
                "Error",
                "LSBs",
                "Range",
              ]}
              rows={mres.map((r) => ({
                float: r.f,
                stored: r.stored,
                bin: r.binStr,
                hex: r.hexStr,
                recon: r.recon,
                err: r.error,
                lsb: r.errLsb.toFixed(3),
                range: r.inRange ? "OK" : "CLIP",
              }))}
            />
            <div
              style={{
                marginTop: 8,
                fontFamily: mono,
                fontSize: 9,
                color: C.muted,
                display: "flex",
                gap: 20,
              }}
            >
              <span>
                Max |error|:{" "}
                {Math.max(...mres.map((r) => Math.abs(r.error))).toExponential(
                  4,
                )}
              </span>
              <span>
                Clipped: {mres.filter((r) => !r.inRange).length}/{mres.length}
              </span>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
};

// Root tab controller and page shell
const TABS = [
  { id: 1, tag: "A1", title: "Float↔Q15", color: "#00ff80" },
  { id: 2, tag: "A2", title: "Gain×G", color: "#00ff80" },
  { id: 3, tag: "A3", title: "Hard Clip", color: "#00ff80" },
  { id: 4, tag: "A4", title: "IIR Filter", color: "#00ff80" },
  { id: 5, tag: "A5", title: "IEEE-754", color: "#facc15" },
  { id: 6, tag: "A6", title: "Qm.n Format", color: "#38bdf8" },
];
const SUB = {
  1: "Float → Q15 → Float  ·  ½ LSB error  ·  Banker's rounding",
  2: "y[n] = x[n]×G  ·  Q14 coefficient  ·  Q30 accumulator",
  3: "y[n] = clamp(x[n], −clip, +clip)  ·  float vs Q15",
  4: "y[n] = B0·x[n] + B1·x[n−1] − A1·y[n−1]  ·  SNR > 60 dB",
  5: "IEEE-754 encoding  ·  16-bit (Half) / 24-bit (Audio Extended) / 32-bit (Single)  ·  sign · exponent · mantissa · hex",
  6: "Qm.n fixed-point  ·  configurable integer & fractional bits  ·  two's complement  ·  range / resolution / error",
};

export default function DSPCalculator() {
  const [tab, setTab] = useState(1);
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#030a05;}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{opacity:.3;}::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:#040b06;}::-webkit-scrollbar-thumb{background:#0f2416;border-radius:3px;}textarea{resize:vertical;}`}</style>
      <div
        style={{ minHeight: "100vh", background: "#030a05", color: "#a8e8c0" }}
      >
        <div
          style={{ borderBottom: `1px solid #0f2416`, background: "#040b06" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
                paddingBottom: 10,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: orb,
                    fontWeight: 900,
                    fontSize: 19,
                    color: "#00ff80",
                    letterSpacing: 4,
                  }}
                >
                  DSP<span style={{ color: "#5fffa0" }}>·LAB</span>
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 8,
                    color: "#1f4a2c",
                    letterSpacing: 4,
                    marginTop: 2,
                  }}
                >
                  Q15 · IEEE-754 · Qm.n FIXED-POINT SUITE
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  fontFamily: mono,
                  fontSize: 8,
                  color: "#1f4a2c",
                }}
              >
                <span>Q15 SCALE=32768</span>
                <span>BANKER'S ROUNDING</span>
                <span>TWO'S COMPLEMENT</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: "8px 14px",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px 5px 0 0",
                    background: tab === t.id ? t.color : "transparent",
                    color: tab === t.id ? "#000" : "#3a7a50",
                    borderBottom:
                      tab === t.id
                        ? `2px solid ${t.color}`
                        : "2px solid transparent",
                    transition: "all .12s",
                  }}
                >
                  <span style={{ opacity: 0.5, fontSize: 8 }}>{t.tag} </span>
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            borderBottom: `1px solid #0f2416`,
            background: "#040d07",
            padding: "7px 20px",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              fontFamily: mono,
              fontSize: 9,
              color: "#1f4a2c",
              letterSpacing: 1,
            }}
          >
            {SUB[tab]}
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 20px" }}>
          {tab === 1 && <A1View />}
          {tab === 2 && <A2View />}
          {tab === 3 && <A3View />}
          {tab === 4 && <A4View />}
          {tab === 5 && <A5View />}
          {tab === 6 && <A6View />}
        </div>
        <div
          style={{
            borderTop: `1px solid #0f2416`,
            padding: "10px 20px",
            textAlign: "center",
            fontFamily: mono,
            fontSize: 7,
            color: "#1f4a2c",
            letterSpacing: 2,
          }}
        >
          DSP·LAB · Q15 · IEEE-754 · Qm.n · BANKER'S ROUNDING · ARITHMETIC
          SATURATION · TWO'S COMPLEMENT
        </div>
      </div>
    </>
  );
}
