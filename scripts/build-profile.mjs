// Builds the cyberpunk profile README assets.
//  - static art: header, about card, dividers
//  - live data (GitHub API): featured projects (pinned repos, else latest), latest repos, languages, stats
// Usage: node scripts/build-profile.mjs [--mock]      (GITHUB_TOKEN optional; enables pinned repos)
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

/* ───────────── palette ───────────── */
const BG = "#050505", PANEL = "#0b0b10", FG = "#f2f2f2", MUT = "#8a8a99", DIM = "#55556a";
const MAG = "#ff3df2", BLU = "#2a7fff", CYA = "#2ee6ff", ORG = "#ff9b2f", GRN = "#3dffa0";
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

/** Terminal-window card: dark panel, neon edge, title bar with three dots and a ~/path. */
const win = (x, y, w, h, title, accent = MAG) => `<g transform="translate(${x} ${y})">
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="8" fill="${PANEL}" stroke="${accent}" stroke-opacity="0.45"/>
<rect x="1" y="1" width="${w - 2}" height="28" rx="7" fill="#fff" fill-opacity="0.03"/>
<line x1="1" y1="29" x2="${w - 1}" y2="29" stroke="${accent}" stroke-opacity="0.25"/>
<circle cx="18" cy="15" r="4.5" fill="${MAG}"/><circle cx="34" cy="15" r="4.5" fill="${ORG}"/><circle cx="50" cy="15" r="4.5" fill="${CYA}"/>
<text x="68" y="19" font-family="${MONO}" font-size="11.5" fill="${MUT}">${esc(title)}</text>
<path d="M-1 12v-13h13M${w - 12} -1h13v13M${w + 1} ${h - 12}v13h-13M12 ${h + 1}h-13v-13" fill="none" stroke="${accent}" stroke-width="2" transform="translate(0 0)"/>
</g>`;

const reveal = (inner, delay = 0) => `<g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${delay}s" dur="0.6s" fill="freeze"/><animateTransform attributeName="transform" type="translate" from="0 10" to="0 0" begin="${delay}s" dur="0.6s" fill="freeze"/>${inner}</g>`;

/** Cover-reveal typewriter (works with SMIL in <img>): text stays laid out; a bg-coloured rect slides right in steps. */
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
function buildHeader() {
  const W = 900, H = 340;
  const avatar = fs.readFileSync(A("avatar.png")).toString("base64");
  let stars = "";
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  for (let i = 0; i < 46; i++) {
    const sx = Math.round(rnd() * 880 + 10), sy = Math.round(rnd() * 250 + 8), c = [MAG, CYA, FG, ORG][i % 4];
    stars += `<rect x="${sx}" y="${sy}" width="2" height="2" fill="${c}" opacity="0.2"><animate attributeName="opacity" values="0.1;0.9;0.1" dur="${(2 + rnd() * 3).toFixed(1)}s" begin="${(rnd() * 3).toFixed(1)}s" repeatCount="indefinite"/></rect>`;
  }
  // perspective grid floor
  let grid = "";
  for (let i = -8; i <= 8; i++) grid += `<line x1="450" y1="262" x2="${450 + i * 130}" y2="${H}" stroke="${MAG}" stroke-opacity="0.28"/>`;
  [266, 274, 286, 304, 330].forEach((gy) => (grid += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${CYA}" stroke-opacity="0.22"/>`));

  const roles = ["Web3 Developer", "Full-Stack Engineer", "AI Tools Specialist"];
  const DUR = 12;
  const roleEls = roles
    .map((r, k) => {
      const a = k / 3, b = (k + 1) / 3;
      const kt = k === 0 ? `0;${b};1` : k === 1 ? `0;${a};${b};1` : `0;${a};1`;
      const vals = k === 0 ? "1;0;0" : k === 1 ? "0;1;0;0" : "0;0;1";
      return `<g opacity="0"><animate attributeName="opacity" calcMode="discrete" dur="${DUR}s" repeatCount="indefinite" keyTimes="${kt}" values="${vals}"/>
${typed({ text: r, x: 296, y: 214, fs: 22, family: MONO, cw: 13.2, start: a + 0.015, end: a + 0.14, dur: DUR, fill: CYA, weight: 700, bg: BG, caret: MAG })}</g>`;
    })
    .join("\n");

  const nameLayer = (fill, dx, op, begin) => `<text x="270" y="132" font-family="${MONO}" font-size="50" font-weight="800" fill="${fill}" opacity="${op}" textLength="561" lengthAdjust="spacing">Deekshith B Gowda
<animateTransform attributeName="transform" type="translate" dur="5s" begin="${begin}s" repeatCount="indefinite" keyTimes="0;0.86;0.88;0.9;0.92;0.94;1" values="0 0;0 0;${dx} 1;${-dx} -1;${dx} 0;0 0;0 0"/></text>`;

  const body = `<rect width="${W}" height="${H}" fill="${BG}"/>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
${stars}
${grid}
<rect y="262" width="${W}" height="${H - 262}" fill="url(#floorFade)"/>
<!-- avatar frame -->
<rect x="52" y="62" width="176" height="200" fill="${MAG}" opacity="0.25" filter="url(#blur)"/>
<rect x="40" y="50" width="200" height="224" rx="6" fill="${PANEL}" stroke="${MAG}" stroke-opacity="0.7"/>
<image x="56" y="68" width="168" height="182" href="data:image/png;base64,${avatar}"/>
<rect x="40" y="50" width="200" height="224" rx="6" fill="url(#scan)" opacity="0.3"/>
<rect x="41" y="50" width="198" height="3" fill="${CYA}" opacity="0.55"><animate attributeName="y" values="50;270;50" dur="4.5s" repeatCount="indefinite"/></rect>
<path d="M34 66V44h22" fill="none" stroke="${CYA}" stroke-width="2.5"/><path d="M224 44h22v22" fill="none" stroke="${CYA}" stroke-width="2.5"/><path d="M246 258v22h-22" fill="none" stroke="${CYA}" stroke-width="2.5"/><path d="M56 280H34v-22" fill="none" stroke="${CYA}" stroke-width="2.5"/>
<text x="140" y="300" text-anchor="middle" font-family="${MONO}" font-size="10.5" letter-spacing="3" fill="${MUT}">ID // DEEKSHITH-B48</text>
<!-- glitch name -->
${nameLayer(CYA, -4, 0.75, 0)}
${nameLayer(MAG, 4, 0.75, 0.05)}
<text x="270" y="132" font-family="${MONO}" font-size="50" font-weight="800" fill="${FG}" textLength="561" lengthAdjust="spacing">Deekshith B Gowda</text>
<text x="270" y="168" font-family="${MONO}" font-size="13" fill="${MUT}">// Undergraduate Intern · AI/ML Engineer · Blockchain Developer · UI/UX</text>
<text x="270" y="214" font-family="${MONO}" font-size="22" font-weight="700" fill="${MAG}">&gt;</text>
${roleEls}
<g font-family="${MONO}" font-size="12" fill="${MUT}">
<circle cx="276" cy="248" r="4" fill="${GRN}"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle>
<text x="288" y="252" fill="${GRN}">ONLINE</text><text x="354" y="252">·  Bengaluru, India  ·  B.E. CSE &apos;26  ·  open to opportunities</text></g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${MAG}" stroke-opacity="0.35"/>`;
  write(A("header.svg"), svgDoc(W, H, "Deekshith B Gowda — developer profile header",
    `<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#14122a" stop-opacity="0.9"/><stop offset="1" stop-color="#050505" stop-opacity="0"/></radialGradient>
<linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG}" stop-opacity="0"/><stop offset="1" stop-color="${BG}" stop-opacity="0.7"/></linearGradient>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.5" fill="#000" opacity="0.5"/></pattern>
<filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>`, body));
}

function buildAbout() {
  const W = 900;
  const k = (s) => `<tspan fill="${CYA}">${esc(s)}</tspan>`, v = (s) => `<tspan fill="${ORG}">${esc(s)}</tspan>`, p = (s) => `<tspan fill="${MUT}">${esc(s)}</tspan>`;
  const lines = [
    `${p("const ")}<tspan fill="${MAG}">deekshith</tspan>${p(" = {")}`,
    `  ${k("name")}${p(": ")}${v('"Deekshith B Gowda"')}${p(",")}`,
    `  ${k("roles")}${p(": [")}${v('"Undergraduate Intern"')}${p(", ")}${v('"AI/ML Engineer"')}${p(", ")}${v('"Web3 Enthusiast"')}${p(",")}`,
    `           ${v('"Blockchain Developer"')}${p(", ")}${v('"UI/UX Designer"')}${p("],")}`,
    `  ${k("location")}${p(": ")}${v('"Bengaluru, Karnataka, India"')}${p(",")}`,
    `  ${k("education")}${p(": ")}${v('"B.E. in CSE – Cambridge Institute of Technology (2022–2026)"')}${p(",")}`,
    `  ${k("focus")}${p(": [")}${v('"AI/ML Systems"')}${p(", ")}${v('"Cybersecurity"')}${p(", ")}${v('"Legal-Tech Solutions"')}${p(",")}`,
    `          ${v('"Financial Applications"')}${p(", ")}${v('"Protocol Analysis"')}${p("],")}`,
    `  ${k("currentProjects")}${p(": [")}`,
    `    ${v('"Daily LeetCode Challenge"')}${p(", ")}${v('"AI-Powered Legal Compliance Analysis"')}${p(",")}`,
    `    ${v('"Advanced Cybersecurity Threat Detection"')}${p(", ")}${v('"Financial Planning & Expense Tracking"')}`,
    `  ${p("],")}`,
    `  ${k("sayHi")}${p(": () => ")}${v('"Building AI-powered solutions for real-world challenges! Let\'s innovate together!"')}`,
    `${p("}")}`,
  ];
  const H = 62 + lines.length * 22 + 20;
  const rows = lines
    .map((l, i) => reveal(`<text x="30" y="${62 + i * 22}" font-family="${MONO}" font-size="13" fill="${FG}" xml:space="preserve"><tspan fill="${DIM}">${String(i + 1).padStart(2, " ")}  </tspan>${l.replace(/&apos;/g, "&#39;")}</text>`, 0.15 + i * 0.12))
    .join("\n");
  write(A("about.svg"), svgDoc(W, H, "About me", "", `<rect width="${W}" height="${H}" fill="${BG}"/>
${win(0, 0, W, H, "~/about-me.js", MAG)}
${rows}
<rect x="30" y="${H - 22}" width="8" height="14" fill="${CYA}"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>`));
}

function buildDividers() {
  const W = 900;
  write(A("divider.svg"), svgDoc(W, 26, "divider", `<linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${MAG}" stop-opacity="0"/><stop offset="0.5" stop-color="${MAG}"/><stop offset="1" stop-color="${CYA}" stop-opacity="0"/></linearGradient>
<linearGradient id="sweep" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="26" fill="${BG}"/><rect x="20" y="12" width="${W - 40}" height="2" fill="url(#g)"/>
<rect x="-120" y="12" width="120" height="2" fill="url(#sweep)"><animate attributeName="x" from="-120" to="${W}" dur="3.6s" repeatCount="indefinite"/></rect>
<path d="M450 5l8 8-8 8-8-8z" fill="${BG}" stroke="${MAG}" stroke-width="1.5"/><path d="M430 13h6M464 13h6" stroke="${CYA}" stroke-width="2"/>`));
  write(A("banner-bar.svg"), svgDoc(W, 34, "dev animation", "", `<rect width="${W}" height="34" fill="${BG}"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="33" rx="6" fill="${PANEL}" stroke="${CYA}" stroke-opacity="0.5"/>
<circle cx="18" cy="17" r="4.5" fill="${MAG}"/><circle cx="34" cy="17" r="4.5" fill="${ORG}"/><circle cx="50" cy="17" r="4.5" fill="${CYA}"/>
<text x="72" y="21" font-family="${MONO}" font-size="11.5" fill="${MUT}">~/dev-room.gif — now playing</text>
<text x="${W - 18}" y="21" text-anchor="end" font-family="${MONO}" font-size="11" fill="${MAG}">● REC<animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/></text>`));
}

/* ═════════════════ live data ═════════════════ */
const LANG_COLORS = { JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051", "C++": "#f34b7d", C: "#555555", Solidity: "#AA6746", Kotlin: "#A97BFF", Dart: "#00B4AB", Jupyter: "#DA5B0B", "Jupyter Notebook": "#DA5B0B", SCSS: "#c6538c", Go: "#00ADD8", Rust: "#dea584" };
const langColor = (n) => LANG_COLORS[n] || MUT;

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
  pinned: true,
};

async function fetchData() {
  if (MOCK) return MOCK_DATA;
  const user = await gh(`https://api.github.com/users/${USER}`);
  const raw = await gh(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=40`);
  const own = raw.filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== PROFILE_REPO.toLowerCase());
  const slim = async (r) => {
    let languages = {};
    try { languages = await gh(r.languages_url); } catch { /* keep empty */ }
    return { name: r.name, url: r.html_url, description: r.description || "", stars: r.stargazers_count, pushed: r.pushed_at, topics: r.topics || [], languages };
  };
  let pinned = [];
  if (TOKEN) {
    try {
      const q = `query{user(login:"${USER}"){pinnedItems(first:6,types:REPOSITORY){nodes{...on Repository{name}}}}}`;
      const res = await gh("https://api.github.com/graphql", { method: "POST", body: JSON.stringify({ query: q }), headers: { "Content-Type": "application/json" } });
      pinned = (res.data?.user?.pinnedItems?.nodes || []).map((n) => n.name);
    } catch (e) { console.warn("pinned lookup failed:", e.message); }
  }
  const byName = new Map(own.map((r) => [r.name, r]));
  const pinnedRepos = pinned.map((n) => byName.get(n)).filter(Boolean);
  const source = pinnedRepos.length ? pinnedRepos : own;
  const featuredRaw = source.slice(0, 4);
  const latestRaw = own.slice(0, 6);
  const need = new Map();
  for (const r of [...featuredRaw, ...latestRaw, ...own.slice(0, 20)]) if (!need.has(r.name)) need.set(r.name, r);
  const repos = await Promise.all([...need.values()].map(slim));
  const bySlim = new Map(repos.map((r) => [r.name, r]));
  return {
    user, repos: repos, pinned: pinnedRepos.length > 0,
    featuredNames: featuredRaw.map((r) => r.name), latestNames: latestRaw.map((r) => r.name),
    totalStars: own.reduce((n, r) => n + r.stargazers_count, 0), ownCount: own.length, bySlim,
  };
}

const ago = (iso) => {
  const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  return d === 0 ? "today" : d === 1 ? "1 day ago" : d < 30 ? `${d} days ago` : d < 365 ? `${Math.round(d / 30)} mo ago` : `${Math.round(d / 365)} yr ago`;
};

function langShares(languages) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((n, [, b]) => n + b, 0) || 1;
  return entries.map(([name, bytes]) => ({ name, pct: (bytes / total) * 100, color: langColor(name) })).filter((l) => l.pct >= 1).slice(0, 5);
}

function wrapText(s, max, lines) {
  const out = []; let cur = "";
  for (const w of s.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  if (out.length > lines) { out.length = lines; out[lines - 1] = trunc(out[lines - 1] + "…", max); }
  return out;
}

function featuredCard(repo, i) {
  const W = 440, H = 220;
  const desc = wrapText(repo.description || "No description yet — the code speaks for itself.", 50, 2);
  const shares = langShares(repo.languages);
  let bx = 20;
  const bar = shares.length
    ? shares.map((s) => { const w = Math.max(4, (s.pct / 100) * 400); const r = `<rect x="${bx.toFixed(1)}" y="148" width="${w.toFixed(1)}" height="6" fill="${s.color}"/>`; bx += w; return r; }).join("")
    : `<rect x="20" y="148" width="400" height="6" fill="${DIM}"/>`;
  let lx = 20;
  const legend = shares.slice(0, 4).map((s) => { const t = `${s.name} ${s.pct.toFixed(0)}%`; const g = `<circle cx="${lx + 4}" cy="172" r="4" fill="${s.color}"/><text x="${lx + 13}" y="176" font-family="${SANS}" font-size="11" fill="${MUT}">${esc(t)}</text>`; lx += t.length * 6.1 + 30; return g; }).join("");
  const topics = repo.topics.slice(0, 3).map((t, k) => `<g transform="translate(${20 + k * 92} 188)"><rect width="84" height="20" rx="10" fill="${CYA}" fill-opacity="0.08" stroke="${CYA}" stroke-opacity="0.35"/><text x="42" y="14" text-anchor="middle" font-family="${MONO}" font-size="10" fill="${CYA}">${esc(trunc(t, 11))}</text></g>`).join("");
  const body = `<rect width="${W}" height="${H}" fill="${BG}"/>
${win(0, 0, W, H, `~/featured/${trunc(repo.name, 26)}`, i % 2 ? CYA : MAG)}
<text x="20" y="62" font-family="${MONO}" font-size="19" font-weight="800" fill="${FG}">${esc(trunc(repo.name, 24))}</text>
<text x="${W - 20}" y="62" text-anchor="end" font-family="${MONO}" font-size="13" fill="${ORG}">★ ${repo.stars}</text>
${desc.map((d, k) => `<text x="20" y="${88 + k * 18}" font-family="${SANS}" font-size="12.5" fill="${MUT}">${esc(d)}</text>`).join("")}
<text x="20" y="136" font-family="${MONO}" font-size="10" letter-spacing="2" fill="${DIM}">STACK</text>
<text x="${W - 20}" y="136" text-anchor="end" font-family="${MONO}" font-size="10" fill="${DIM}">pushed ${esc(ago(repo.pushed))}</text>
${bar}${legend}${topics}`;
  write(G(`featured-${i + 1}.svg`), svgDoc(W, H, `${repo.name} project card`, "", body));
}

function latestSvg(repos) {
  const W = 900, rowH = 40, H = 46 + repos.length * rowH + 14;
  const rows = repos.map((r, i) => {
    const y = 46 + i * rowH, main = langShares(r.languages)[0];
    return reveal(`<line x1="20" y1="${y + rowH - 6}" x2="${W - 20}" y2="${y + rowH - 6}" stroke="#fff" stroke-opacity="0.06"/>
<text x="22" y="${y + 22}" font-family="${MONO}" font-size="12" fill="${MAG}">${String(i + 1).padStart(2, "0")}</text>
<circle cx="64" cy="${y + 17}" r="5" fill="${main ? main.color : DIM}"/>
<text x="80" y="${y + 21}" font-family="${MONO}" font-size="14" font-weight="700" fill="${FG}">${esc(trunc(r.name, 22))}</text>
<text x="300" y="${y + 21}" font-family="${SANS}" font-size="12.5" fill="${MUT}">${esc(trunc(r.description || "—", 58))}</text>
<text x="${W - 150}" y="${y + 21}" text-anchor="end" font-family="${SANS}" font-size="12" fill="${main ? main.color : DIM}">${esc(main ? main.name : "")}</text>
<text x="${W - 100}" y="${y + 21}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${ORG}">★ ${r.stars}</text>
<text x="${W - 20}" y="${y + 21}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${DIM}">${esc(ago(r.pushed))}</text>`, 0.1 + i * 0.12);
  }).join("\n");
  write(G("latest.svg"), svgDoc(W, H, "Latest repositories", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/latest-repos — git log --since=recent", CYA)}${rows}`));
}

function languagesSvg(repos) {
  const W = 440, H = 250, totals = {};
  for (const r of repos) for (const [n, b] of Object.entries(r.languages)) totals[n] = (totals[n] || 0) + b;
  const all = Object.entries(totals).sort((a, b) => b[1] - a[1]), sum = all.reduce((n, [, b]) => n + b, 0) || 1;
  const top = all.slice(0, 6);
  const rows = top.map(([n, b], i) => {
    const y = 56 + i * 30, pct = (b / sum) * 100, w = Math.max(6, (pct / 100) * 250), c = langColor(n);
    return `<text x="20" y="${y + 11}" font-family="${MONO}" font-size="12" fill="${FG}">${esc(trunc(n, 14))}</text>
<rect x="140" y="${y}" width="250" height="12" rx="2" fill="#fff" fill-opacity="0.05"/>
<rect x="140" y="${y}" width="0" height="12" rx="2" fill="${c}"><animate attributeName="width" from="0" to="${w.toFixed(1)}" begin="${0.2 + i * 0.12}s" dur="0.8s" fill="freeze"/></rect>
<text x="${W - 20}" y="${y + 11}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${MUT}">${pct.toFixed(1)}%</text>`;
  }).join("\n");
  write(G("languages.svg"), svgDoc(W, H, "Top languages", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/top-languages (all own repos)", ORG)}${rows}`));
}

function statsSvg(d) {
  const W = 900, H = 120;
  const items = [["REPOS", d.ownCount ?? d.user.public_repos], ["STARS", d.totalStars ?? d.repos.reduce((n, r) => n + r.stars, 0)], ["FOLLOWERS", d.user.followers], ["FOLLOWING", d.user.following], ["SINCE", new Date(d.user.created_at).getFullYear()]];
  const cells = items.map(([k, v], i) => { const x = 20 + i * 172; return `<g transform="translate(${x} 44)"><rect width="160" height="62" rx="4" fill="#fff" fill-opacity="0.03" stroke="${[MAG, CYA, ORG, BLU, GRN][i]}" stroke-opacity="0.45"/><text x="80" y="30" text-anchor="middle" font-family="${MONO}" font-size="24" font-weight="800" fill="${FG}">${v}</text><text x="80" y="50" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="2" fill="${MUT}">${k}</text></g>`; }).join("");
  write(G("stats.svg"), svgDoc(W, H, "GitHub stats", "", `<rect width="${W}" height="${H}" fill="${BG}"/>${win(0, 0, W, H, "~/github-stats — live from the GitHub API", GRN)}${cells}`));
}

/* ═════════════════ README markers ═════════════════ */
function replaceBlock(md, name, inner) {
  const re = new RegExp(`(<!--${name}:START-->)[\\s\\S]*?(<!--${name}:END-->)`);
  if (!re.test(md)) { console.warn("marker missing:", name); return md; }
  return md.replace(re, `$1\n${inner}\n$2`);
}

async function main() {
  buildHeader(); buildAbout(); buildDividers();
  let data;
  try { data = await fetchData(); } catch (e) { console.warn("GitHub API unavailable, keeping existing generated files:", e.message); return; }
  const byName = data.bySlim || new Map(data.repos.map((r) => [r.name, r]));
  const featured = (data.featuredNames ? data.featuredNames.map((n) => byName.get(n)) : data.repos.slice(0, 4)).filter(Boolean);
  const latest = (data.latestNames ? data.latestNames.map((n) => byName.get(n)) : data.repos.slice(0, 6)).filter(Boolean);
  featured.forEach(featuredCard);
  for (let i = featured.length; i < 4; i++) { const p = G(`featured-${i + 1}.svg`); if (fs.existsSync(p)) fs.rmSync(p); }
  latestSvg(latest); languagesSvg(data.repos); statsSvg(data);

  const readmePath = path.join(ROOT, "README.md");
  let md = fs.readFileSync(readmePath, "utf8");
  const cell = (r, i) => `    <td width="50%"><a href="${r.url}"><img src="assets/generated/featured-${i + 1}.svg" alt="${esc(r.name)}" width="100%"/></a></td>`;
  const rowsHtml = [];
  for (let i = 0; i < featured.length; i += 2) rowsHtml.push(`  <tr>\n${[featured[i], featured[i + 1]].map((r, k) => (r ? cell(r, i + k) : `    <td width="50%"></td>`)).join("\n")}\n  </tr>`);
  md = replaceBlock(md, "FEATURED", `<table>\n${rowsHtml.join("\n")}\n</table>\n\n<p align="center"><sub>${data.pinned ? "Pinned repositories" : "Most recently updated repositories"} · refreshed automatically every day</sub></p>`);
  md = replaceBlock(md, "LATEST", `<p align="center"><sub>${latest.map((r) => `<a href="${r.url}">${esc(r.name)}</a>`).join(" · ")}</sub></p>`);
  fs.writeFileSync(readmePath, md);
  console.log("README markers updated");
}
main();
