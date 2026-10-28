// Builds the profile README art: black / white / dark-green vector animations.
//  - static art: hero, stack showcase, engineering notes, section headers, divider
//  - live data (GitHub API, with an HTML fallback): featured = newest real projects, latest repos, languages, push pulse, stats
// Usage: node scripts/build-profile.mjs [--mock]      (GITHUB_TOKEN optional; raises API limits)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const USER = "deekshith-b48";
const PROFILE_REPO = "deekshith-b48";
const MOCK = process.argv.includes("--mock");
const TOKEN = process.env.GITHUB_TOKEN || "";
const A = (f) => path.join(ROOT, "assets", f);
const G = (f) => path.join(ROOT, "assets", "generated", f);
fs.mkdirSync(path.join(ROOT, "assets", "generated"), { recursive: true });

/* ───────────── palette: neutral black / white with dark green as a small accent ───────────── */
const BG = "#050505", PANEL = "#0a0a0a", MUT = "#9a9a9a", DIM = "#5f5f5f";
const FG = "#f5f5f5";                 // text: white
const G3 = "#2fae63";                 // accent: green (dots, prompts, stars, peak bars, sweeps)
const G2 = "#d0d0d0";                 // borders and marks: light grey-white
const G1 = "#4a4a4a";                 // rules: mid grey
const G0 = "#1a1a1a";                 // faint fills: dark grey
const SHADES = [G3, G2, "#a3a3a3", G1, G0]; // language bars: green leader, then whites stepping down
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const SANS = "ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const write = (file, s) => { fs.writeFileSync(file, s); console.log("wrote", path.relative(ROOT, file), (s.length / 1024).toFixed(1) + " KB"); };
const svgDoc = (w, h, label, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<defs>${defs}</defs>
${body}
</svg>
`;
let seed = 11;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

/** Terminal window card: black panel, green edge, title bar with three dots. */
const win = (x, y, w, h, title, edge = G2) => `<g transform="translate(${x} ${y})">
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="8" fill="${PANEL}" stroke="${edge}" stroke-opacity="0.45"/>
<rect x="1" y="1" width="${w - 2}" height="28" rx="7" fill="${G0}" fill-opacity="0.35"/>
<line x1="1" y1="29" x2="${w - 1}" y2="29" stroke="${edge}" stroke-opacity="0.35"/>
<circle cx="18" cy="15" r="4.5" fill="${G3}"/><circle cx="34" cy="15" r="4.5" fill="${G2}"/><circle cx="50" cy="15" r="4.5" fill="${FG}" fill-opacity="0.8"/>
<text x="68" y="19" font-family="${MONO}" font-size="11.5" fill="${MUT}">${esc(title)}</text>
</g>`;

const reveal = (inner, delay = 0) => `<g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${delay}s" dur="0.6s" fill="freeze"/><animateTransform attributeName="transform" type="translate" from="0 10" to="0 0" begin="${delay}s" dur="0.6s" fill="freeze"/>${inner}</g>`;

/** Cover-reveal typewriter: text stays laid out, a bg-coloured rect slides right in steps. Loops. */
function typed({ text, x, y, fs, family, cw, start, end, dur, fill, weight, bg = PANEL, caret = FG }) {
  const n = text.length, w = n * cw;
  const times = [0], xs = [x], ws = [w], co = [0];
  for (let i = 1; i <= n; i++) {
    times.push(+(start + ((end - start) * i) / n).toFixed(5));
    xs.push(+(x + i * cw).toFixed(2)); ws.push(+(w - i * cw).toFixed(2)); co.push(i < n ? 1 : 0);
  }
  times.push(0.97, 1); xs.push(x, x); ws.push(w, w); co.push(0, 0);
  const kt = times.join(";");
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${fs}" textLength="${w}" lengthAdjust="spacing" fill="${fill}"${weight ? ` font-weight="${weight}"` : ""} xml:space="preserve">${esc(text)}</text>
<rect x="${x}" y="${y - fs}" width="${w}" height="${fs * 1.5}" fill="${bg}">
<animate attributeName="x" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" keyTimes="${kt}" values="${xs.join(";")}"/>
<animate attributeName="width" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" keyTimes="${kt}" values="${ws.join(";")}"/></rect>
<rect x="${x}" y="${y - fs + 2}" width="2" height="${fs}" fill="${caret}">
<animate attributeName="x" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" keyTimes="${kt}" values="${xs.join(";")}"/>
<animate attributeName="opacity" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" keyTimes="${kt}" values="${co.join(";")}"/></rect>`;
}

/* ═════════════════ static art ═════════════════ */
function buildHero() {
  const W = 900, H = 400, DUR = 16;
  const avatar = fs.readFileSync(A("avatar.png")).toString("base64");

  // falling code rain: one text per column, glyph tails fade, head is white
  let rain = "";
  const glyphs = "01{}<>/;=+*#$%&";
  for (let i = 0; i < 34; i++) {
    const x = 12 + i * 26.4, n = 9 + Math.floor(rnd() * 5), dur = (6 + rnd() * 7).toFixed(1), begin = -(rnd() * 10).toFixed(1);
    let ts = "";
    for (let k = 0; k < n; k++) {
      const head = k === n - 1;
      const op = head ? 0.9 : 0.08 + (k / n) * 0.32;
      ts += `<tspan x="${x.toFixed(1)}" dy="14" fill="${head ? FG : i % 4 ? G2 : G3}" fill-opacity="${op.toFixed(2)}">${esc(glyphs[Math.floor(rnd() * glyphs.length)])}</tspan>`;
    }
    rain += `<text font-family="${MONO}" font-size="12" y="0"><animateTransform attributeName="transform" type="translate" from="0 ${-n * 14 - 10}" to="0 ${H + 20}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${ts}</text>\n`;
  }
  // perspective grid floor
  let grid = "";
  for (let i = -9; i <= 9; i++) grid += `<line x1="450" y1="336" x2="${450 + i * 120}" y2="${H}" stroke="${G2}" stroke-opacity="0.35"/>`;
  [340, 348, 360, 376, 398].forEach((gy) => (grid += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${G1}" stroke-opacity="0.6"/>`));

  const lines = [
    ["$ ", "whoami", "deekshith-b48 · software engineer", 0.03, 0.14],
    ["$ ", "stack --focus", "ai/ml · full-stack · web3 · security", 0.16, 0.3],
    ["$ ", "now", "building local-first apps and ml pipelines", 0.32, 0.47],
  ];
  const term = lines
    .map(([prompt, cmd, out, s, e], i) => {
      const y = 206 + i * 40;
      return `<text x="66" y="${y}" font-family="${MONO}" font-size="16" fill="${G3}">${esc(prompt)}</text><text x="86" y="${y}" font-family="${MONO}" font-size="16" fill="${MUT}">${esc(cmd)}</text>
${typed({ text: out, x: 66, y: y + 20, fs: 16, family: MONO, cw: 9.6, start: s, end: e, dur: DUR, fill: FG, weight: 600 })}`;
    })
    .join("\n");

  const body = `<rect width="${W}" height="${H}" fill="${BG}"/>
${rain}
<rect width="${W}" height="${H}" fill="url(#shade)"/>
${grid}
<rect y="336" width="${W}" height="${H - 336}" fill="url(#floor)"/>
<!-- name -->
<text x="40" y="76" font-family="${MONO}" font-size="12" letter-spacing="4" fill="${G3}">// PROFILE</text>
<text x="40" y="132" font-family="${MONO}" font-size="52" font-weight="800" fill="${FG}" stroke="${BG}" stroke-width="8" paint-order="stroke" textLength="574" lengthAdjust="spacing">Deekshith B Gowda</text>
<rect x="40" y="146" width="574" height="3" fill="${G1}"/>
<rect x="40" y="146" width="0" height="3" fill="${G3}"><animate attributeName="width" values="0;574;574;0" keyTimes="0;0.35;0.8;1" dur="${DUR}s" repeatCount="indefinite"/></rect>
<!-- terminal -->
${win(40, 160, 580, 170, "~/deekshith — zsh", G2)}
${term}
<g font-family="${MONO}" font-size="12" fill="${MUT}">
<circle cx="46" cy="${H - 46}" r="4" fill="${G3}"><animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/></circle>
<text x="58" y="${H - 42}">Bengaluru, India  ·  B.E. CSE &#39;26  ·  github.com/deekshith-b48</text></g>
<!-- portrait -->
<rect x="672" y="64" width="176" height="200" fill="${G2}" opacity="0.22" filter="url(#blur)"/>
<rect x="660" y="52" width="200" height="224" rx="6" fill="${PANEL}" stroke="${G2}" stroke-opacity="0.8"/>
<image x="676" y="70" width="168" height="182" href="data:image/png;base64,${avatar}" filter="url(#duo)"/>
<rect x="660" y="52" width="200" height="224" rx="6" fill="url(#scan)" opacity="0.5"/>
<rect x="661" y="52" width="198" height="3" fill="${G3}" opacity="0.7"><animate attributeName="y" values="52;272;52" dur="4.5s" repeatCount="indefinite"/></rect>
<path d="M654 68V46h22M844 46h22v22M866 260v22h-22M676 282h-22v-22" fill="none" stroke="${G3}" stroke-width="2.5"/>
<text x="760" y="302" text-anchor="middle" font-family="${MONO}" font-size="10.5" letter-spacing="3" fill="${MUT}">ID // DEEKSHITH-B48</text>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${G1}"/>`;
  write(A("hero.svg"), svgDoc(W, H, "Deekshith B Gowda — software engineer", `<linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="${BG}" stop-opacity="0.82"/><stop offset="0.7" stop-color="${BG}" stop-opacity="0.35"/><stop offset="1" stop-color="${BG}" stop-opacity="0.15"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG}" stop-opacity="0"/><stop offset="1" stop-color="${BG}" stop-opacity="0.65"/></linearGradient>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.5" fill="#000" opacity="0.5"/></pattern>
<filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="duo" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"/>
<feComponentTransfer><feFuncR type="table" tableValues="0.02 0.62 0.96"/><feFuncG type="table" tableValues="0.02 0.64 0.97"/><feFuncB type="table" tableValues="0.02 0.62 0.96"/></feComponentTransfer></filter>`, body));
}

function buildStack() {
  const W = 900, cw = 282, ch = 132;
  const groups = [
    ["LANGUAGES", ["JavaScript", "TypeScript", "Python", "Java", "Solidity", "Shell"]],
    ["FRONTEND", ["React", "Next.js", "Vite", "Tailwind", "PDF.js"]],
    ["BACKEND & DATA", ["Node.js", "Express", "FastAPI", "GraphQL", "PostgreSQL", "MongoDB", "Supabase"]],
    ["AI / ML", ["scikit-learn", "spaCy", "Hugging Face", "OpenCV", "Streamlit", "LIME"]],
    ["WEB3", ["Ethereum", "Solidity", "Hardhat", "Web3.js", "Smart contracts"]],
    ["SECURITY & DEVOPS", ["Docker", "Git", "Packet analysis", "Threat detection", "PowerShell"]],
  ];
  const H = 30 + 24 + 2 * ch + 16 + 24;
  const cards = groups.map(([name, items], gi) => {
    const col = gi % 3, row = Math.floor(gi / 3);
    const x = 16 + col * 293, y = 46 + row * (ch + 16);
    let cx = 16, cy = 44;
    const chips = items.map((t, k) => {
      const w = Math.round(t.length * 6.8 + 20);
      if (cx + w > cw - 12) { cx = 16; cy += 30; }
      const g = `<g transform="translate(${cx} ${cy})"><rect width="${w}" height="22" rx="3" fill="${G0}" fill-opacity="0.45" stroke="${G2}" stroke-opacity="0.35"/><text x="${w / 2}" y="15" text-anchor="middle" font-family="${MONO}" font-size="11.5" fill="${FG}">${esc(t)}</text></g>`;
      cx += w + 8;
      return g;
    }).join("");
    return reveal(`<g transform="translate(${x} ${y})"><rect x="0.5" y="0.5" width="${cw}" height="${ch}" rx="6" fill="${BG}" stroke="${G1}"/>
<rect x="0.5" y="0.5" width="4" height="${ch}" fill="${G2}"/>
<text x="16" y="26" font-family="${MONO}" font-size="10.5" letter-spacing="3" fill="${G3}">${esc(name)}</text>
<text x="${cw - 12}" y="26" text-anchor="end" font-family="${MONO}" font-size="10.5" fill="${DIM}">${String(items.length).padStart(2, "0")}</text>${chips}</g>`, 0.1 + gi * 0.12);
  });
  write(A("stack.svg"), svgDoc(W, H, "Tech stack", `<linearGradient id="sw" x1="0" x2="1"><stop offset="0" stop-color="${G3}" stop-opacity="0"/><stop offset="0.5" stop-color="${G3}" stop-opacity="0.12"/><stop offset="1" stop-color="${G3}" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/stack — what I build with", G2)}
${cards.join("\n")}
<rect x="-160" y="30" width="160" height="${H - 30}" fill="url(#sw)"><animate attributeName="x" from="-160" to="${W}" dur="7s" repeatCount="indefinite"/></rect>`));
}

function buildNotes() {
  const W = 900, tw = 284, H = 214;
  const notes = [
    ["Local-first by design", "qivra / architecture", ["Data stays on the device: SQLite (FTS5)", "vault, plus a durable job queue that", "retries with backoff and resumes after", "crashes or offline."]],
    ["Tested and automated", "qivra / delivery", ["348 app and 131 server tests, GitHub", "Actions builds and a tagged v2.0.0", "release under AGPL-3.0."]],
    ["Measure, then optimise", "kroolo + poligap / performance", ["API latency down 40% with Redis caching", "and N+1 fixes; PDF processing 80% faster", "with page-limited extraction."]],
  ];
  const tiles = notes.map(([t, tag, d], i) => {
    const x = 16 + i * (tw + 10);
    return reveal(`<g transform="translate(${x} 46)"><rect x="0.5" y="0.5" width="${tw}" height="156" rx="6" fill="${BG}" stroke="${G1}"/>
<rect x="16" y="16" width="26" height="26" rx="4" fill="${G0}" fill-opacity="0.6" stroke="${G2}" stroke-opacity="0.7"/>
<path d="M23 29l4 4 8-9" fill="none" stroke="${G3}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<text x="54" y="34" font-family="${SANS}" font-size="14.5" font-weight="700" fill="${FG}">${esc(t)}</text>
<text x="16" y="62" font-family="${MONO}" font-size="10" letter-spacing="1.5" fill="${G3}">${esc(tag.toUpperCase())}</text>
${d.map((l, k) => `<text x="16" y="${84 + k * 17}" font-family="${SANS}" font-size="11.5" fill="${MUT}">${esc(l)}</text>`).join("")}</g>`, 0.1 + i * 0.15);
  });
  write(A("notes.svg"), svgDoc(W, H, "Engineering notes", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/engineering-notes.md", G2)}${tiles.join("\n")}`));
}

function buildChrome() {
  const W = 900;
  const hdr = (name, num, text, right) => write(A(`${name}.svg`), svgDoc(W, 40, text, `<linearGradient id="sw" x1="0" x2="1"><stop offset="0" stop-color="${G3}" stop-opacity="0"/><stop offset="0.5" stop-color="${G3}" stop-opacity="0.35"/><stop offset="1" stop-color="${G3}" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="40" fill="${BG}"/><rect x="0.5" y="0.5" width="${W - 1}" height="39" rx="6" fill="${PANEL}" stroke="${G1}"/>
<rect x="0.5" y="0.5" width="5" height="39" rx="2" fill="${G2}"/>
<text x="22" y="25" font-family="${MONO}" font-size="11" letter-spacing="3" fill="${G3}">${num}</text>
<text x="60" y="25" font-family="${MONO}" font-size="12" font-weight="700" letter-spacing="3" fill="${FG}">${esc(text.toUpperCase())}</text>
${right ? `<text x="${W - 20}" y="25" text-anchor="end" font-family="${MONO}" font-size="11" fill="${MUT}">${esc(right)}</text>` : ""}
<rect x="-160" y="37" width="160" height="2" fill="url(#sw)"><animate attributeName="x" from="-160" to="${W}" dur="4.5s" repeatCount="indefinite"/></rect>`));
  hdr("h-analytics", "01", "Analytics", "live from GitHub");
  hdr("h-stack", "02", "Stack", "what I build with");
  hdr("h-projects", "03", "Projects", "newest projects · auto-updated daily");
  hdr("h-repos", "04", "Latest repositories", "git log --since=recent");
  hdr("h-notes", "05", "Engineering notes", "how I build");
  hdr("h-connect", "06", "Elsewhere", "");
  write(A("divider.svg"), svgDoc(W, 22, "divider", `<linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${G2}" stop-opacity="0"/><stop offset="0.5" stop-color="${G2}"/><stop offset="1" stop-color="${G2}" stop-opacity="0"/></linearGradient>
<linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#2fae63" stop-opacity="0"/><stop offset="0.5" stop-color="#2fae63" stop-opacity="0.95"/><stop offset="1" stop-color="#2fae63" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="22" fill="${BG}"/><rect x="20" y="10" width="${W - 40}" height="2" fill="url(#g)"/>
<rect x="-120" y="10" width="120" height="2" fill="url(#s)"><animate attributeName="x" from="-120" to="${W}" dur="3.6s" repeatCount="indefinite"/></rect>
<path d="M450 3l8 8-8 8-8-8z" fill="${BG}" stroke="${G3}" stroke-width="1.5"/>`));
}

function buildBadges() {
  const items = [["PORTFOLIO", "its-deekshith.space"], ["GITHUB", "deekshith-b48"], ["LINKEDIN", "deekshithb48"], ["X", "@deekshith_b48"], ["LEETCODE", "deekshith_b48"], ["EMAIL", "bdeekshith41@gmail.com"]];
  for (const [k, v] of items) {
    const lw = k.length * 8.2 + 26, vw = v.length * 7.2 + 24, w = Math.round(lw + vw);
    write(A(`badge-${k.toLowerCase()}.svg`), svgDoc(w, 34, `${k}: ${v}`, "", `<rect x="0.5" y="0.5" width="${w - 1}" height="33" rx="4" fill="${PANEL}" stroke="${G2}" stroke-opacity="0.45"/>
<rect x="1" y="1" width="${lw.toFixed(0)}" height="32" rx="3" fill="#fff" fill-opacity="0.06"/>
<text x="13" y="21.5" font-family="${MONO}" font-size="10.5" font-weight="700" letter-spacing="2" fill="${G3}">${esc(k)}</text>
<text x="${(lw + 12).toFixed(0)}" y="21.5" font-family="${MONO}" font-size="12" fill="${FG}">${esc(v)}</text>`));
  }
}

/* ═════════════════ live data ═════════════════ */
async function gh(url, init = {}) {
  const r = await fetch(url, { ...init, headers: { Accept: "application/vnd.github+json", "User-Agent": "profile-readme-builder", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}), ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

const MOCK_DATA = {
  user: { public_repos: 24, followers: 23, following: 12, created_at: "2023-06-01T00:00:00Z" },
  repos: [
    { name: "Qivra", url: "https://github.com/deekshith-b48/Qivra", description: "A private, local-first knowledge vault for Android. Save links and reels, get transcripts and summaries.", stars: 2, pushed: "2026-10-25T10:00:00Z", topics: ["android", "react-native", "ai"], languages: { TypeScript: 60000, Kotlin: 9000, Python: 12000 } },
    { name: "PoliGap", url: "https://github.com/deekshith-b48/PoliGap", description: "AI-powered React application for legal compliance teams to analyze policy documents.", stars: 1, pushed: "2026-10-20T10:00:00Z", topics: ["react", "gemini"], languages: { JavaScript: 48000, CSS: 6000 } },
    { name: "Daily-LeetCode", url: "https://github.com/deekshith-b48/Daily-LeetCode", description: "My journey of solving LeetCode problems daily.", stars: 1, pushed: "2026-10-28T10:00:00Z", topics: [], languages: { Java: 90000 } },
    { name: "ZeroHack", url: "https://github.com/deekshith-b48/ZeroHack", description: "", stars: 0, pushed: "2026-09-01T10:00:00Z", topics: ["security"], languages: { TypeScript: 30000, Python: 8000 } },
    { name: "Gymmie", url: "https://github.com/deekshith-b48/Gymmie", description: "Gym companion app.", stars: 1, pushed: "2026-10-22T10:00:00Z", topics: [], languages: { JavaScript: 20000 } },
    { name: "NoLava", url: "https://github.com/deekshith-b48/NoLava", description: "", stars: 0, pushed: "2026-10-18T10:00:00Z", topics: [], languages: {} },
  ],
};

/* ───────────── featured-project engine ───────────── */
// Featured = the newest *real* projects. Practice/log repos, forks, empty-description and tiny repos never qualify.
const EXCLUDE = ["Daily-LeetCode", "Master-Software-Engineering"];             // always skipped (edit freely)
const PRACTICE_NAME_RE = /leetcode|dsa|algorithm|practice|interview|master-software|cheat|tutorial|playground|learning-log/i;
const PRACTICE_DESC_RE = /leetcode|journey of solving|problems daily/i;
const MIN_CODE_BYTES = 5000;
const repoBytes = (r) => { const t = Object.values(r.languages || {}).reduce((n, b) => n + b, 0); return t >= 100 ? t : null; }; // null = unknown
export function pickFeatured(repos, n = 4) {
  return repos
    .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== PROFILE_REPO.toLowerCase()
      && !EXCLUDE.includes(r.name)
      && (r.description || "").trim()
      && !PRACTICE_NAME_RE.test([r.name, ...(r.topics || [])].join(" "))
      && !PRACTICE_DESC_RE.test(r.description)
      && (repoBytes(r) === null || repoBytes(r) >= MIN_CODE_BYTES))
    .sort((a, b) => b.pushed.localeCompare(a.pushed) || (b.created || "").localeCompare(a.created || ""))
    .slice(0, n);
}

async function fetchData() {
  if (MOCK) return MOCK_DATA;
  const user = await gh(`https://api.github.com/users/${USER}`);
  const raw = await gh(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=60`);
  const own = raw.filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== PROFILE_REPO.toLowerCase());
  const slim = async (r) => {
    let languages = {};
    try { languages = await gh(r.languages_url); } catch { /* unknown -> tiny-repo rule skipped */ }
    return { name: r.name, url: r.html_url, description: r.description || "", stars: r.stargazers_count, pushed: r.pushed_at, created: r.created_at, topics: r.topics || [], languages, fork: r.fork, archived: r.archived };
  };
  const repos = await Promise.all(own.slice(0, 30).map(slim));
  return { user, repos, ownCount: own.length, totalStars: own.reduce((n, r) => n + r.stargazers_count, 0), source: "api" };
}

/** No-API fallback (rate limit / outage): scrape the public repositories tab. Language bar becomes one segment. */
async function fetchFromHtml() {
  const repos = [];
  for (let page = 1; page <= 2; page++) {
    const r = await fetch(`https://github.com/${USER}?tab=repositories&type=source&sort=updated&page=${page}`, { headers: { "User-Agent": "Mozilla/5.0 (profile-readme-builder)" } });
    if (!r.ok) throw new Error(`repositories tab -> ${r.status}`);
    const html = await r.text();
    for (const m of html.matchAll(/<li[^>]*itemprop="owns"[^>]*>([\s\S]*?)<\/li>/g)) {
      const it = m[1];
      const name = (it.match(/itemprop="name codeRepository"[^>]*>\s*([^<\s]+)/) || [])[1];
      if (!name || /Archived/.test(it) || name.toLowerCase() === PROFILE_REPO.toLowerCase()) continue;
      const description = ((it.match(/itemprop="description"[^>]*>\s*([^<]+)/) || [])[1] || "").replace(/\s+/g, " ").trim();
      const lang = (it.match(/itemprop="programmingLanguage">([^<]+)/) || [])[1];
      const updated = (it.match(/datetime="([^"]+)"/) || [])[1] || new Date().toISOString();
      const stars = +(((it.match(new RegExp(`href="/${USER}/${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/stargazers"[^>]*>[\\s\\S]*?([\\d,]+)\\s*</a>`)) || [])[1] || "0").replace(/,/g, ""));
      repos.push({ name, url: `https://github.com/${USER}/${name}`, description, stars, pushed: updated, created: updated, topics: [], languages: lang ? { [lang.trim()]: 1 } : {}, fork: false, archived: false });
    }
  }
  if (repos.length < 3) throw new Error("repository list not found in HTML");
  return { user: null, repos, source: "html" };
}

/** Pushes per day for the last 30 days from the public events feed (commit arrays are no longer included). */
async function fetchPulse(repos) {
  const days = [];
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) days.push({ date: new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10), n: 0 });
  const idx = new Map(days.map((d, i) => [d.date, i]));
  let source = "pushes";
  if (MOCK) { days.forEach((d, i) => (d.n = [0, 1, 3, 0, 2, 5, 1, 0, 0, 2, 4, 1, 0, 3, 2, 6, 1, 0, 0, 2, 3, 1, 4, 0, 2, 1, 5, 3, 2, 4][i])); return { days, source }; }
  try {
    for (let page = 1; page <= 3; page++) {
      const ev = await gh(`https://api.github.com/users/${USER}/events/public?per_page=100&page=${page}`);
      if (!ev.length) break;
      for (const e of ev) if (e.type === "PushEvent" && idx.has(e.created_at.slice(0, 10))) days[idx.get(e.created_at.slice(0, 10))].n++;
    }
  } catch (e) { console.warn("events unavailable:", e.message); }
  if (days.every((d) => d.n === 0)) { // fall back to "repos touched per day"
    source = "repos touched";
    for (const r of repos) { const k = r.pushed.slice(0, 10); if (idx.has(k)) days[idx.get(k)].n++; }
  }
  return { days, source };
}

const ago = (iso) => {
  const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  return d === 0 ? "today" : d === 1 ? "1 day ago" : d < 30 ? `${d} days ago` : d < 365 ? `${Math.round(d / 30)} mo ago` : `${Math.round(d / 365)} yr ago`;
};

function langShares(languages) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((n, [, b]) => n + b, 0) || 1;
  return entries.map(([name, bytes]) => ({ name, pct: (bytes / total) * 100 })).filter((l) => l.pct >= 1).slice(0, 5).map((l, i) => ({ ...l, color: SHADES[i] }));
}

function wrapText(s, max, lines) {
  const out = []; let cur = "";
  for (const w of s.split(/\s+/)) { if ((cur + " " + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) out.push(cur);
  if (out.length > lines) { out.length = lines; out[lines - 1] = trunc(out[lines - 1] + "…", max); }
  return out;
}

function featuredCard(repo, i) {
  const W = 438, H = 224;
  const desc = wrapText(repo.description || "No description yet.", 50, 2);
  const shares = langShares(repo.languages);
  let bx = 20;
  const bar = shares.length
    ? shares.map((s) => { const w = Math.max(4, (s.pct / 100) * 398); const r = `<rect x="${bx.toFixed(1)}" y="148" width="${w.toFixed(1)}" height="6" fill="${s.color}"/>`; bx += w; return r; }).join("")
    : `<rect x="20" y="148" width="398" height="6" fill="${G0}"/>`;
  let lx = 20;
  const legend = shares.slice(0, 4).map((s) => { const t = `${s.name} ${s.pct.toFixed(0)}%`; const g = `<rect x="${lx}" y="168" width="8" height="8" fill="${s.color}"/><text x="${lx + 14}" y="176" font-family="${SANS}" font-size="11" fill="${MUT}">${esc(t)}</text>`; lx += t.length * 6.1 + 30; return g; }).join("");
  const topics = repo.topics.slice(0, 3).map((t, k) => `<g transform="translate(${20 + k * 92} 192)"><rect width="84" height="20" rx="3" fill="${G0}" fill-opacity="0.5" stroke="${G2}" stroke-opacity="0.6"/><text x="42" y="14" text-anchor="middle" font-family="${MONO}" font-size="10" fill="${FG}">${esc(trunc(t, 11))}</text></g>`).join("");
  write(G(`featured-${i + 1}.svg`), svgDoc(W, H, `${repo.name} project card`, "", `<rect width="${W}" height="${H}" fill="${BG}"/>
${win(0, 0, W, H, `~/projects/${trunc(repo.name, 26)}`, G2)}
<text x="20" y="62" font-family="${MONO}" font-size="19" font-weight="800" fill="${FG}">${esc(trunc(repo.name, 24))}</text>
<text x="${W - 20}" y="62" text-anchor="end" font-family="${MONO}" font-size="13" fill="${G3}">★ ${repo.stars}</text>
${desc.map((d, k) => `<text x="20" y="${88 + k * 18}" font-family="${SANS}" font-size="12.5" fill="${MUT}">${esc(d)}</text>`).join("")}
<text x="20" y="136" font-family="${MONO}" font-size="10" letter-spacing="2" fill="${DIM}">STACK</text>
<text x="${W - 20}" y="136" text-anchor="end" font-family="${MONO}" font-size="10" fill="${DIM}">pushed ${esc(ago(repo.pushed))}</text>
<rect x="20" y="148" width="398" height="6" fill="${G0}" fill-opacity="0.5"/>${bar}${legend}${topics}`));
}

function latestSvg(repos) {
  const W = 900, rowH = 40, H = 46 + repos.length * rowH + 14;
  const rows = repos.map((r, i) => {
    const y = 46 + i * rowH, main = langShares(r.languages)[0];
    return reveal(`<line x1="20" y1="${y + rowH - 6}" x2="${W - 20}" y2="${y + rowH - 6}" stroke="${G1}" stroke-opacity="0.6"/>
<text x="22" y="${y + 22}" font-family="${MONO}" font-size="12" fill="${G3}">${String(i + 1).padStart(2, "0")}</text>
<rect x="60" y="${y + 12}" width="9" height="9" fill="${main ? main.color : G0}"/>
<text x="80" y="${y + 21}" font-family="${MONO}" font-size="14" font-weight="700" fill="${FG}">${esc(trunc(r.name, 22))}</text>
<text x="300" y="${y + 21}" font-family="${SANS}" font-size="12.5" fill="${MUT}">${esc(trunc(r.description || "—", 56))}</text>
<text x="${W - 150}" y="${y + 21}" text-anchor="end" font-family="${SANS}" font-size="12" fill="${FG}">${esc(main ? main.name : "")}</text>
<text x="${W - 100}" y="${y + 21}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${G3}">★ ${r.stars}</text>
<text x="${W - 20}" y="${y + 21}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${DIM}">${esc(ago(r.pushed))}</text>`, 0.1 + i * 0.12);
  }).join("\n");
  write(G("latest.svg"), svgDoc(W, H, "Latest repositories", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/repos — recently pushed", G2)}${rows}`));
}

function languagesSvg(repos) {
  const W = 438, H = 250, totals = {};
  for (const r of repos) for (const [n, b] of Object.entries(r.languages)) totals[n] = (totals[n] || 0) + b;
  const all = Object.entries(totals).sort((a, b) => b[1] - a[1]), sum = all.reduce((n, [, b]) => n + b, 0) || 1;
  const top = all.slice(0, 6);
  const rows = top.map(([n, b], i) => {
    const y = 58 + i * 30, pct = (b / sum) * 100, w = Math.max(6, (pct / 100) * 232);
    return `<text x="20" y="${y + 11}" font-family="${MONO}" font-size="12" fill="${FG}">${esc(trunc(n, 14))}</text>
<rect x="140" y="${y}" width="232" height="12" rx="2" fill="${G0}" fill-opacity="0.5"/>
<rect x="140" y="${y}" width="0" height="12" rx="2" fill="${SHADES[Math.min(i, 4)]}"><animate attributeName="width" from="0" to="${w.toFixed(1)}" begin="${0.2 + i * 0.12}s" dur="0.8s" fill="freeze"/></rect>
<text x="${W - 20}" y="${y + 11}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${MUT}">${pct.toFixed(1)}%</text>`;
  }).join("\n");
  write(G("languages.svg"), svgDoc(W, H, "Top languages", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/languages — all own repos", G2)}${rows}`));
}

function pulseSvg({ days, source }) {
  const W = 438, H = 250, base = 196, maxH = 120;
  const max = Math.max(1, ...days.map((d) => d.n)), step = 398 / days.length;
  const total = days.reduce((n, d) => n + d.n, 0), active = days.filter((d) => d.n > 0).length;
  const bars = days.map((d, i) => {
    const h = d.n ? Math.max(5, (d.n / max) * maxH) : 2;
    const x = 20 + i * step;
    return `<rect x="${x.toFixed(1)}" y="${base - h}" width="${(step - 4).toFixed(1)}" height="${h.toFixed(1)}" fill="${d.n ? (d.n === max ? G3 : FG) : G1}" fill-opacity="${d.n ? 1 : 0.5}">
<animate attributeName="height" from="0" to="${h.toFixed(1)}" begin="${(0.1 + i * 0.03).toFixed(2)}s" dur="0.6s" fill="freeze"/><animate attributeName="y" from="${base}" to="${base - h}" begin="${(0.1 + i * 0.03).toFixed(2)}s" dur="0.6s" fill="freeze"/></rect>`;
  }).join("");
  write(G("pulse.svg"), svgDoc(W, H, "Push activity, last 30 days", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, `~/activity — ${source} per day, 30d`, G2)}
<line x1="20" y1="${base + 1}" x2="${W - 20}" y2="${base + 1}" stroke="${G2}" stroke-opacity="0.5"/>
${bars}
<text x="20" y="${base + 20}" font-family="${MONO}" font-size="10" fill="${DIM}">30d ago</text>
<text x="${W - 20}" y="${base + 20}" text-anchor="end" font-family="${MONO}" font-size="10" fill="${DIM}">today</text>
<text x="20" y="${H - 8}" font-family="${MONO}" font-size="11" fill="${MUT}">${total} ${source} · ${active} active days · peak ${max}/day</text>`));
}

function statsSvg(d) {
  const W = 900, H = 120;
  const items = [["REPOS", d.ownCount ?? d.user.public_repos], ["STARS", d.totalStars ?? d.repos.reduce((n, r) => n + r.stars, 0)], ["FOLLOWERS", d.user.followers], ["FOLLOWING", d.user.following], ["SINCE", new Date(d.user.created_at).getFullYear()]];
  const cells = items.map(([k, v], i) => { const x = 18 + i * 176; return `<g transform="translate(${x} 44)"><rect width="164" height="62" rx="4" fill="${G0}" fill-opacity="0.3" stroke="${G2}" stroke-opacity="0.6"/><text x="82" y="31" text-anchor="middle" font-family="${MONO}" font-size="25" font-weight="800" fill="${FG}">${v}</text><text x="82" y="50" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="2" fill="${MUT}">${k}</text></g>`; }).join("");
  write(G("stats.svg"), svgDoc(W, H, "GitHub stats", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/github — live counters", G2)}${cells}`));
}

/** Contribution heatmap from GitHub's public contributions fragment (no token or API quota needed). */
async function buildContrib() {
  let cells = [];
  if (MOCK) {
    const start = new Date(); start.setUTCDate(start.getUTCDate() - 52 * 7 - new Date().getUTCDay());
    for (let i = 0; i < 52 * 7 + new Date().getUTCDay() + 1; i++) {
      const d = new Date(start.getTime() + i * 86400000), n = rnd() < 0.55 ? 0 : Math.floor(rnd() * 9);
      cells.push({ date: d.toISOString().slice(0, 10), row: d.getUTCDay(), col: Math.floor(i / 7), count: n, level: n === 0 ? 0 : Math.min(4, 1 + Math.floor(n / 3)) });
    }
  } else {
    try {
      const r = await fetch(`https://github.com/users/${USER}/contributions`, { headers: { "User-Agent": "Mozilla/5.0 (profile-readme-builder)" } });
      if (!r.ok) throw new Error(`contributions -> ${r.status}`);
      const html = await r.text();
      const tips = new Map([...html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g)].map((m) => [m[1], (m[2].match(/^(\d+) contribution/) || [0, "0"])[1]]));
      cells = [...html.matchAll(/<td[^>]*data-date="([\d-]+)"[^>]*id="contribution-day-component-(\d+)-(\d+)"[^>]*data-level="(\d)"/g)].map((m) => ({ date: m[1], row: +m[2], col: +m[3], level: +m[4], count: +(tips.get(`contribution-day-component-${m[2]}-${m[3]}`) || 0) }));
      if (cells.length < 200) throw new Error("calendar not found in response");
    } catch (e) { console.warn("contributions unavailable, keeping existing contrib.svg:", e.message); return; }
  }
  const W = 900, pitch = 16, x0 = 24, y0 = 56;
  const cols = Math.max(...cells.map((c) => c.col)) + 1;
  const sorted = [...cells].sort((a, b) => a.date.localeCompare(b.date));
  const total = sorted.reduce((n, c) => n + c.count, 0), active = sorted.filter((c) => c.count > 0).length;
  let best = 0, run = 0, longest = 0;
  for (const c of sorted) { best = Math.max(best, c.count); run = c.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) { if (sorted[i].count > 0) current++; else if (i !== sorted.length - 1) break; }
  const fills = [["#fff", 0.06], [G2, 0.3], [G2, 0.55], [FG, 0.85], [G3, 1]];
  const byCol = new Map();
  for (const c of cells) { if (!byCol.has(c.col)) byCol.set(c.col, []); byCol.get(c.col).push(c); }
  const months = []; let lastMonth = "", lastLabelCol = -9;
  const cellEls = [...byCol.entries()].sort((a, b) => a[0] - b[0]).map(([col, list]) => {
    const first = list.reduce((a, b) => (a.row < b.row ? a : b));
    const m = new Date(first.date + "T00:00:00Z").toLocaleString("en", { month: "short", timeZone: "UTC" });
    if (m !== lastMonth && col < cols - 1 && col - lastLabelCol >= 3) { lastLabelCol = col; months.push(`<text x="${x0 + col * pitch}" y="48" font-family="${MONO}" font-size="10" fill="${DIM}">${m}</text>`); lastMonth = m; }
    const rects = list.map((c) => { const [f, o] = fills[c.level]; return `<rect x="${x0 + col * pitch}" y="${y0 + c.row * pitch}" width="13" height="13" rx="2" fill="${f}" fill-opacity="${o}"><title>${c.count} contributions on ${c.date}</title></rect>`; }).join("");
    return `<g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${(0.05 + col * 0.025).toFixed(3)}s" dur="0.4s" fill="freeze"/>${rects}</g>`;
  }).join("\n");
  const H = y0 + 7 * pitch + 58;
  const stat = (x, k, v) => `<text x="${x}" y="${H - 16}" font-family="${MONO}" font-size="11" fill="${MUT}">${k} <tspan fill="${FG}" font-weight="700">${v}</tspan></text>`;
  const legendX = W - 24 - (5 * 16 + 78);
  const legend = `<text x="${legendX}" y="${H - 16}" font-family="${MONO}" font-size="10" fill="${DIM}">less</text>` + fills.map(([f, o], i) => `<rect x="${legendX + 30 + i * 16}" y="${H - 26}" width="13" height="13" rx="2" fill="${f}" fill-opacity="${o}"/>`).join("") + `<text x="${legendX + 30 + 5 * 16 + 4}" y="${H - 16}" font-family="${MONO}" font-size="10" fill="${DIM}">more</text>`;
  write(G("contrib.svg"), svgDoc(W, H, `Contribution graph: ${total} contributions in the last year`, "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, `~/contributions — last 12 months · ${total} total`, G2)}
${months.join("")}
${cellEls}
${stat(24, "active days", active)}${stat(170, "longest streak", longest + " d")}${stat(330, "current streak", current + " d")}${stat(490, "best day", best)}
${legend}`));
}

/* ═════════════════ README markers ═════════════════ */
function replaceBlock(md, name, inner) {
  const re = new RegExp(`(<!--${name}:START-->)[\\s\\S]*?(<!--${name}:END-->)`);
  if (!re.test(md)) { console.warn("marker missing:", name); return md; }
  return md.replace(re, `$1\n${inner}\n$2`);
}

async function main() {
  buildHero(); buildStack(); buildNotes(); buildChrome(); buildBadges();
  await buildContrib();
  let data;
  try { data = await fetchData(); } catch (e) {
    console.warn("GitHub API unavailable, using the HTML fallback:", e.message);
    try { data = await fetchFromHtml(); } catch (e2) { console.warn("fallback failed, keeping existing generated files:", e2.message); return; }
  }
  const featured = pickFeatured(data.repos);
  const latest = [...data.repos].sort((a, b) => b.pushed.localeCompare(a.pushed)).slice(0, 6);
  console.log("source:", data.source || "mock", "| featured:", featured.map((r) => r.name).join(", ") || "(none)");
  featured.forEach(featuredCard);
  for (let i = featured.length; i < 4; i++) { const p = G(`featured-${i + 1}.svg`); if (fs.existsSync(p)) fs.rmSync(p); }
  latestSvg(latest);
  if (data.source !== "html") { languagesSvg(data.repos); statsSvg(data); pulseSvg(await fetchPulse(data.repos)); }

  const readmePath = path.join(ROOT, "README.md");
  let md = fs.readFileSync(readmePath, "utf8");
  const cell = (r, i) => `    <td width="50%"><a href="${r.url}"><img src="assets/generated/featured-${i + 1}.svg" alt="${esc(r.name)}" width="100%"/></a></td>`;
  const rowsHtml = [];
  for (let i = 0; i < featured.length; i += 2) rowsHtml.push(`  <tr>\n${[featured[i], featured[i + 1]].map((r, k) => (r ? cell(r, i + k) : `    <td width="50%"></td>`)).join("\n")}\n  </tr>`);
  md = replaceBlock(md, "FEATURED", `<table width="100%">\n${rowsHtml.join("\n")}\n</table>\n\n<p align="center"><sub>Newest projects · refreshed automatically every day</sub></p>`);
  md = replaceBlock(md, "LATEST", `<p align="center"><sub>${latest.map((r) => `<a href="${r.url}">${esc(r.name)}</a>`).join(" · ")}</sub></p>`);
  fs.writeFileSync(readmePath, md);
  console.log("README markers updated");
}
import { pathToFileURL } from "node:url";
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
