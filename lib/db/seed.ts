/**
 * Expanded curated pack library. Seeded into the `packs` table on first boot.
 * Also used as in-memory fallback when the DB isn't available.
 */

export type SeedPack = {
  id: string;
  kind: "color" | "font" | "button" | "icon" | "shape";
  name: string;
  mood: string;
  data: Record<string, any>;
};

const COLORS: SeedPack[] = [
  {
    id: "editorial-ink",
    kind: "color",
    name: "Editorial Ink",
    mood: "Refined magazine, serious, considered",
    data: { bg: "#f6f4ee", surface: "#ffffff", ink: "#0a0a0a", muted: "#6b6b6b", accent: "#7c5cff", accentAlt: "#c4f24b" },
  },
  {
    id: "midnight-studio",
    kind: "color",
    name: "Midnight Studio",
    mood: "Dark, premium, confident",
    data: { bg: "#08080e", surface: "#131322", ink: "#f6f4ee", muted: "#8e8e9c", accent: "#7c5cff", accentAlt: "#ff8a4c" },
  },
  {
    id: "terracotta-bloom",
    kind: "color",
    name: "Terracotta Bloom",
    mood: "Warm, organic, handcrafted",
    data: { bg: "#fbf5ee", surface: "#f4e8da", ink: "#2a1a0d", muted: "#7a5c45", accent: "#c2410c", accentAlt: "#065f46" },
  },
  {
    id: "cobalt-grid",
    kind: "color",
    name: "Cobalt Grid",
    mood: "Technical, crisp, engineering",
    data: { bg: "#ffffff", surface: "#f2f4f8", ink: "#0b1020", muted: "#5c6478", accent: "#1e40af", accentAlt: "#0ea5e9" },
  },
  {
    id: "matcha-zen",
    kind: "color",
    name: "Matcha Zen",
    mood: "Calm, natural, grounded",
    data: { bg: "#f4f4ee", surface: "#ebebe0", ink: "#1c241a", muted: "#6b7258", accent: "#3f7d3f", accentAlt: "#a76e3d" },
  },
  {
    id: "neon-manifesto",
    kind: "color",
    name: "Neon Manifesto",
    mood: "Loud, playful, maximalist",
    data: { bg: "#0a0a0a", surface: "#1a1a1a", ink: "#ffffff", muted: "#9ca3af", accent: "#ec4899", accentAlt: "#facc15" },
  },
  {
    id: "oxblood-gold",
    kind: "color",
    name: "Oxblood & Gold",
    mood: "Luxury, heritage, heavy",
    data: { bg: "#1a0a0a", surface: "#2a1414", ink: "#f5e8d0", muted: "#a08878", accent: "#c9a54b", accentAlt: "#6b2020" },
  },
  {
    id: "arctic-steel",
    kind: "color",
    name: "Arctic Steel",
    mood: "Cold, industrial, futuristic",
    data: { bg: "#e8ecf0", surface: "#ffffff", ink: "#1a2432", muted: "#6a7888", accent: "#0891b2", accentAlt: "#1e293b" },
  },
  {
    id: "sunbaked-clay",
    kind: "color",
    name: "Sunbaked Clay",
    mood: "Sun-faded, Mediterranean, warm",
    data: { bg: "#faf3e7", surface: "#f1e4cf", ink: "#3a1f0d", muted: "#8a6b4a", accent: "#d97706", accentAlt: "#7c2d12" },
  },
  {
    id: "mono-chrome",
    kind: "color",
    name: "Mono Chrome",
    mood: "Pure black & white, brutal clarity",
    data: { bg: "#ffffff", surface: "#f5f5f5", ink: "#000000", muted: "#737373", accent: "#000000", accentAlt: "#ff0000" },
  },
  {
    id: "botanical-moss",
    kind: "color",
    name: "Botanical Moss",
    mood: "Herbal, apothecary, verdant",
    data: { bg: "#f5f1e8", surface: "#e8e2d0", ink: "#1f2a1a", muted: "#5a6748", accent: "#4a6b2f", accentAlt: "#9c6b24" },
  },
  {
    id: "cyber-sunrise",
    kind: "color",
    name: "Cyber Sunrise",
    mood: "Gradient dawn, techy pastel",
    data: { bg: "#faf5ff", surface: "#f3e8ff", ink: "#1e1b4b", muted: "#6b5e8e", accent: "#7c3aed", accentAlt: "#f59e0b" },
  },
  {
    id: "salt-teal",
    kind: "color",
    name: "Salt & Teal",
    mood: "Coastal, fresh, open",
    data: { bg: "#f0faf9", surface: "#d7efec", ink: "#0f2e2b", muted: "#4a6b68", accent: "#0d9488", accentAlt: "#be123c" },
  },
  {
    id: "paper-ruby",
    kind: "color",
    name: "Paper & Ruby",
    mood: "Editorial red, classic print",
    data: { bg: "#fcfaf5", surface: "#f0ece2", ink: "#1a1a1a", muted: "#5a5a5a", accent: "#dc2626", accentAlt: "#1a1a1a" },
  },
  {
    id: "deep-forest",
    kind: "color",
    name: "Deep Forest",
    mood: "Dark natural, somber luxury",
    data: { bg: "#0a1f14", surface: "#152a1f", ink: "#f0e8d0", muted: "#8a9080", accent: "#daa520", accentAlt: "#6b8050" },
  },
];

const FONTS: SeedPack[] = [
  {
    id: "fraunces-instrument",
    kind: "font",
    name: "Atelier",
    mood: "Editorial serif meets humanist sans",
    data: {
      display: "Fraunces",
      body: "Instrument Sans",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Sans:wght@400..700&display=swap",
      sampleDisplay: "An elegant headline",
      sampleBody: "Clear, confident body copy that reads beautifully.",
    },
  },
  {
    id: "dm-serif-dm-sans",
    kind: "font",
    name: "Notebook",
    mood: "Friendly serif, approachable sans",
    data: {
      display: "DM Serif Display",
      body: "DM Sans",
      googleHref:
        "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap",
      sampleDisplay: "Warm & inviting",
      sampleBody: "Reads like a welcome letter. Soft but structured.",
    },
  },
  {
    id: "syne-manrope",
    kind: "font",
    name: "Signal",
    mood: "Geometric display, modern sans",
    data: {
      display: "Syne",
      body: "Manrope",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;800&family=Syne:wght@500;700;800&display=swap",
      sampleDisplay: "Bold & geometric",
      sampleBody: "Technical without being cold. Sharp without being harsh.",
    },
  },
  {
    id: "playfair-lora",
    kind: "font",
    name: "Heritage",
    mood: "Classic serif pairing, timeless",
    data: {
      display: "Playfair Display",
      body: "Lora",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700&family=Playfair+Display:wght@400;700;800&display=swap",
      sampleDisplay: "Classic elegance",
      sampleBody: "Established. Trustworthy. The weight of tradition.",
    },
  },
  {
    id: "unbounded-figtree",
    kind: "font",
    name: "Future",
    mood: "Techy display, neutral workhorse",
    data: {
      display: "Unbounded",
      body: "Figtree",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;600;800&family=Unbounded:wght@400;700;800&display=swap",
      sampleDisplay: "Forward motion",
      sampleBody: "Built for products that live on the edge of new.",
    },
  },
  {
    id: "caveat-nunito",
    kind: "font",
    name: "Studio",
    mood: "Handwritten accent, rounded body",
    data: {
      display: "Caveat",
      body: "Nunito",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Nunito:wght@300;400;700;900&display=swap",
      sampleDisplay: "Made by hand",
      sampleBody: "Personal, crafted, unmistakably human.",
    },
  },
  {
    id: "space-ibm",
    kind: "font",
    name: "Station",
    mood: "Retro-future, console, engineered",
    data: {
      display: "Space Grotesk",
      body: "IBM Plex Sans",
      googleHref:
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;700&display=swap",
      sampleDisplay: "Launch ready",
      sampleBody: "Precision-engineered text for technical products.",
    },
  },
  {
    id: "crimson-work",
    kind: "font",
    name: "Library",
    mood: "Scholarly, print-rooted",
    data: {
      display: "Crimson Pro",
      body: "Work Sans",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;800&family=Work+Sans:wght@300;400;500;700&display=swap",
      sampleDisplay: "Stories worth keeping",
      sampleBody: "Reads like a well-bound book. Quiet and measured.",
    },
  },
  {
    id: "bricolage-plex",
    kind: "font",
    name: "Grotesque",
    mood: "Mutant display, bold editorial",
    data: {
      display: "Bricolage Grotesque",
      body: "IBM Plex Sans",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=IBM+Plex+Sans:wght@400;600&display=swap",
      sampleDisplay: "Shape shifter",
      sampleBody: "A contemporary editorial feel with a twist of attitude.",
    },
  },
  {
    id: "anton-roboto",
    kind: "font",
    name: "Billboard",
    mood: "Condensed shout, sports/editorial cover",
    data: {
      display: "Anton",
      body: "Roboto",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Anton&family=Roboto:wght@300;400;500;700&display=swap",
      sampleDisplay: "LOUD AND CLEAR",
      sampleBody: "For copy that's meant to be seen from across the room.",
    },
  },
  {
    id: "cormorant-raleway",
    kind: "font",
    name: "Perfume",
    mood: "Haute couture, luxury script-adjacent",
    data: {
      display: "Cormorant Garamond",
      body: "Raleway",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Raleway:wght@300;400;500;700&display=swap",
      sampleDisplay: "Elegance, distilled",
      sampleBody: "Haute couture meets editorial refinement.",
    },
  },
  {
    id: "archivo-black-inter",
    kind: "font",
    name: "Statement",
    mood: "Heavy chunk serif-less, activist poster",
    data: {
      display: "Archivo Black",
      body: "Archivo",
      googleHref:
        "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@300;400;500;700&display=swap",
      sampleDisplay: "We mean this.",
      sampleBody: "Built for manifestos, launch screens, protest posters.",
    },
  },
];

const BUTTONS: SeedPack[] = [
  {
    id: "hairline",
    kind: "button",
    name: "Hairline",
    mood: "Minimal text + underline",
    data: {
      css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:12px 0;border:0;background:transparent;color:var(--ink);font-family:var(--body);font-size:14px;letter-spacing:.04em;cursor:pointer;position:relative}.btn::after{content:"";position:absolute;left:0;bottom:6px;width:100%;height:1px;background:currentColor;transition:transform .3s}.btn:hover::after{background:var(--accent)}`,
      sampleLabel: "learn more →",
    },
  },
  {
    id: "brick",
    kind: "button",
    name: "Brick",
    mood: "Solid, sharp corners, editorial",
    data: {
      css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border:0;background:var(--ink);color:var(--bg);font-family:var(--body);font-size:13px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s}.btn:hover{background:var(--accent);color:var(--bg)}`,
      sampleLabel: "get started",
    },
  },
  {
    id: "capsule",
    kind: "button",
    name: "Capsule",
    mood: "Friendly, fully rounded",
    data: {
      css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border:0;background:var(--accent);color:var(--bg);font-family:var(--body);font-size:15px;font-weight:600;border-radius:999px;cursor:pointer;transition:transform .2s,box-shadow .2s}.btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px -10px var(--accent)}`,
      sampleLabel: "Start free",
    },
  },
  {
    id: "outlined-sharp",
    kind: "button",
    name: "Outlined",
    mood: "Bordered, technical",
    data: {
      css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);font-family:var(--body);font-size:14px;font-weight:500;cursor:pointer;transition:all .2s}.btn:hover{background:var(--ink);color:var(--bg)}`,
      sampleLabel: "Contact us",
    },
  },
  {
    id: "slab-shadow",
    kind: "button",
    name: "Slab Shadow",
    mood: "Retro hard shadow, playful brutalism",
    data: {
      css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:14px 26px;border:2px solid var(--ink);background:var(--accent);color:var(--ink);font-family:var(--body);font-size:14px;font-weight:700;cursor:pointer;box-shadow:4px 4px 0 0 var(--ink);transition:transform .15s,box-shadow .15s}.btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 0 var(--ink)}.btn:active{transform:translate(2px,2px);box-shadow:0 0 0 0 var(--ink)}`,
      sampleLabel: "CLICK ME",
    },
  },
  {
    id: "glass-lift",
    kind: "button",
    name: "Glass Lift",
    mood: "Soft depth, premium product",
    data: {
      css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:14px 26px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);color:var(--ink);font-family:var(--body);font-size:14px;font-weight:600;cursor:pointer;border-radius:12px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.15);transition:transform .2s,box-shadow .2s}.btn:hover{transform:translateY(-2px);box-shadow:0 20px 40px -15px rgba(0,0,0,0.2)}`,
      sampleLabel: "Continue",
    },
  },
];

const ICONS: SeedPack[] = [
  {
    id: "lucide-line",
    kind: "icon",
    name: "Line",
    mood: "Lucide — clean line icons",
    data: { icons: ["Sparkles", "ArrowRight", "Check", "Zap", "Leaf", "Rocket"] },
  },
  {
    id: "lucide-geometric",
    kind: "icon",
    name: "Geometric",
    mood: "Lucide — structural shapes",
    data: { icons: ["Square", "Triangle", "Circle", "Diamond", "Hexagon", "Plus"] },
  },
  {
    id: "lucide-editorial",
    kind: "icon",
    name: "Editorial",
    mood: "Lucide — editorial marks",
    data: { icons: ["Quote", "BookOpen", "Pencil", "Feather", "Type", "Asterisk"] },
  },
  {
    id: "lucide-commerce",
    kind: "icon",
    name: "Commerce",
    mood: "Lucide — shop, pay, ship",
    data: { icons: ["ShoppingBag", "CreditCard", "Package", "Truck", "Tag", "Gift"] },
  },
  {
    id: "lucide-nature",
    kind: "icon",
    name: "Nature",
    mood: "Lucide — organic, earthy",
    data: { icons: ["Leaf", "Trees", "Flower", "Sun", "Mountain", "Waves"] },
  },
];

const SHAPES: SeedPack[] = [
  {
    id: "grid-lines",
    kind: "shape",
    name: "Grid Lines",
    mood: "Technical, architectural, structured",
    data: {
      css: `.shape-bg{background-image:linear-gradient(var(--muted)/0.08 1px,transparent 1px),linear-gradient(90deg,var(--muted)/0.08 1px,transparent 1px);background-size:40px 40px;background-color:var(--bg)}`,
      svg: null,
    },
  },
  {
    id: "dotted-grid",
    kind: "shape",
    name: "Dotted Grid",
    mood: "Quiet, notebook, ordered",
    data: {
      css: `.shape-bg{background-image:radial-gradient(circle,var(--muted)/0.2 1px,transparent 1px);background-size:24px 24px;background-color:var(--bg)}`,
      svg: null,
    },
  },
  {
    id: "diagonal-stripes",
    kind: "shape",
    name: "Diagonal Stripes",
    mood: "Construction, caution, motion",
    data: {
      css: `.shape-bg{background:repeating-linear-gradient(45deg,var(--bg),var(--bg) 12px,var(--surface) 12px,var(--surface) 14px)}`,
      svg: null,
    },
  },
  {
    id: "soft-waves",
    kind: "shape",
    name: "Soft Waves",
    mood: "Organic, flowing, calm",
    data: {
      css: `.shape-bg{background-color:var(--bg);position:relative}.shape-bg::after{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cpath fill='none' stroke='%237c5cff' stroke-opacity='0.12' stroke-width='2' d='M0 200 C 100 100, 200 300, 400 200'/%3E%3Cpath fill='none' stroke='%237c5cff' stroke-opacity='0.12' stroke-width='2' d='M0 250 C 100 150, 200 350, 400 250'/%3E%3C/svg%3E");background-size:400px}`,
      svg: null,
    },
  },
  {
    id: "organic-blobs",
    kind: "shape",
    name: "Organic Blobs",
    mood: "Playful, hand-drawn, friendly",
    data: {
      css: `.shape-bg{background-color:var(--bg);position:relative;overflow:hidden}.shape-bg::before{content:"";position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,var(--accent) 0%,transparent 70%);opacity:0.15;border-radius:50%}.shape-bg::after{content:"";position:absolute;bottom:-150px;left:-80px;width:350px;height:350px;background:radial-gradient(circle,var(--accentAlt) 0%,transparent 70%);opacity:0.15;border-radius:50%}`,
      svg: null,
    },
  },
  {
    id: "noise-grain",
    kind: "shape",
    name: "Noise Grain",
    mood: "Tactile, printed, analog",
    data: {
      css: `.shape-bg{background-color:var(--bg);position:relative}.shape-bg::after{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");pointer-events:none}`,
      svg: null,
    },
  },
  {
    id: "topographic",
    kind: "shape",
    name: "Topographic",
    mood: "Cartographic, expedition, outdoorsy",
    data: {
      css: `.shape-bg{background-color:var(--bg);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='0.06' stroke-width='1.5'%3E%3Ccircle cx='100' cy='100' r='20'/%3E%3Ccircle cx='100' cy='100' r='40'/%3E%3Ccircle cx='100' cy='100' r='60'/%3E%3Ccircle cx='100' cy='100' r='80'/%3E%3C/g%3E%3C/svg%3E")}`,
      svg: null,
    },
  },
  {
    id: "triangles",
    kind: "shape",
    name: "Triangles",
    mood: "Geometric, modern art, angular",
    data: {
      css: `.shape-bg{background-color:var(--bg);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpolygon points='30,10 50,45 10,45' fill='none' stroke='%237c5cff' stroke-opacity='0.18' stroke-width='1'/%3E%3C/svg%3E")}`,
      svg: null,
    },
  },
];

export const SEED_PACKS: SeedPack[] = [
  ...COLORS,
  ...FONTS,
  ...BUTTONS,
  ...ICONS,
  ...SHAPES,
];
