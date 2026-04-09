import type { ButtonPack, ColorPack, FontPack, IconPack } from "./types";

export const COLOR_PACKS: ColorPack[] = [
  {
    id: "editorial-ink",
    name: "Editorial Ink",
    mood: "Refined, serious, magazine",
    colors: {
      bg: "#f6f4ee",
      surface: "#ffffff",
      ink: "#0a0a0a",
      muted: "#6b6b6b",
      accent: "#7c5cff",
      accentAlt: "#c4f24b",
    },
  },
  {
    id: "midnight-studio",
    name: "Midnight Studio",
    mood: "Dark, premium, confident",
    colors: {
      bg: "#08080e",
      surface: "#131322",
      ink: "#f6f4ee",
      muted: "#8e8e9c",
      accent: "#7c5cff",
      accentAlt: "#ff8a4c",
    },
  },
  {
    id: "terracotta-bloom",
    name: "Terracotta Bloom",
    mood: "Warm, organic, handcrafted",
    colors: {
      bg: "#fbf5ee",
      surface: "#f4e8da",
      ink: "#2a1a0d",
      muted: "#7a5c45",
      accent: "#c2410c",
      accentAlt: "#065f46",
    },
  },
  {
    id: "cobalt-grid",
    name: "Cobalt Grid",
    mood: "Technical, crisp, engineering",
    colors: {
      bg: "#ffffff",
      surface: "#f2f4f8",
      ink: "#0b1020",
      muted: "#5c6478",
      accent: "#1e40af",
      accentAlt: "#0ea5e9",
    },
  },
  {
    id: "matcha-zen",
    name: "Matcha Zen",
    mood: "Calm, natural, grounded",
    colors: {
      bg: "#f4f4ee",
      surface: "#ebebe0",
      ink: "#1c241a",
      muted: "#6b7258",
      accent: "#3f7d3f",
      accentAlt: "#a76e3d",
    },
  },
  {
    id: "neon-manifesto",
    name: "Neon Manifesto",
    mood: "Loud, playful, maximalist",
    colors: {
      bg: "#0a0a0a",
      surface: "#1a1a1a",
      ink: "#ffffff",
      muted: "#9ca3af",
      accent: "#ec4899",
      accentAlt: "#facc15",
    },
  },
];

export const FONT_PACKS: FontPack[] = [
  {
    id: "fraunces-instrument",
    name: "Atelier",
    mood: "Editorial serif meets humanist sans",
    display: "Fraunces",
    body: "Instrument Sans",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Sans:wght@400..700&display=swap",
    sampleDisplay: "An elegant headline",
    sampleBody: "Clear, confident body copy that reads beautifully.",
  },
  {
    id: "dm-serif-dm-sans",
    name: "Notebook",
    mood: "Friendly serif, approachable sans",
    display: "DM Serif Display",
    body: "DM Sans",
    googleHref:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap",
    sampleDisplay: "Warm & inviting",
    sampleBody: "Reads like a welcome letter. Soft but structured.",
  },
  {
    id: "syne-manrope",
    name: "Signal",
    mood: "Geometric display, modern sans",
    display: "Syne",
    body: "Manrope",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;800&family=Syne:wght@500;700;800&display=swap",
    sampleDisplay: "Bold & geometric",
    sampleBody: "Technical without being cold. Sharp without being harsh.",
  },
  {
    id: "playfair-lora",
    name: "Heritage",
    mood: "Classic serif pairing, timeless",
    display: "Playfair Display",
    body: "Lora",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700&family=Playfair+Display:wght@400;700;800&display=swap",
    sampleDisplay: "Classic elegance",
    sampleBody: "Established. Trustworthy. The weight of tradition.",
  },
  {
    id: "unbounded-figtree",
    name: "Future",
    mood: "Techy display, neutral workhorse",
    display: "Unbounded",
    body: "Figtree",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;600;800&family=Unbounded:wght@400;700;800&display=swap",
    sampleDisplay: "Forward motion",
    sampleBody: "Built for products that live on the edge of new.",
  },
  {
    id: "caveat-nunito",
    name: "Studio",
    mood: "Handwritten accent, rounded body",
    display: "Caveat",
    body: "Nunito",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Nunito:wght@300;400;700;900&display=swap",
    sampleDisplay: "Made by hand",
    sampleBody: "Personal, crafted, unmistakably human.",
  },
];

export const BUTTON_PACKS: ButtonPack[] = [
  {
    id: "hairline",
    name: "Hairline",
    mood: "Minimal text + underline",
    css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:12px 0;border:0;background:transparent;color:var(--ink);font-family:var(--body);font-size:14px;letter-spacing:.04em;cursor:pointer;position:relative}.btn::after{content:"";position:absolute;left:0;bottom:6px;width:100%;height:1px;background:currentColor;transition:transform .3s}.btn:hover::after{background:var(--accent)}`,
    sampleLabel: "learn more →",
  },
  {
    id: "brick",
    name: "Brick",
    mood: "Solid, sharp corners, editorial",
    css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border:0;background:var(--ink);color:var(--bg);font-family:var(--body);font-size:13px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s}.btn:hover{background:var(--accent);color:var(--bg)}`,
    sampleLabel: "get started",
  },
  {
    id: "capsule",
    name: "Capsule",
    mood: "Friendly, fully rounded",
    css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border:0;background:var(--accent);color:var(--bg);font-family:var(--body);font-size:15px;font-weight:600;border-radius:999px;cursor:pointer;transition:transform .2s,box-shadow .2s}.btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px -10px var(--accent)}`,
    sampleLabel: "Start free",
  },
  {
    id: "outlined-sharp",
    name: "Outlined",
    mood: "Bordered, technical",
    css: `.btn{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);font-family:var(--body);font-size:14px;font-weight:500;cursor:pointer;transition:all .2s}.btn:hover{background:var(--ink);color:var(--bg)}`,
    sampleLabel: "Contact us",
  },
];

export const ICON_PACKS: IconPack[] = [
  {
    id: "lucide-line",
    name: "Line",
    mood: "Lucide — clean line icons",
    icons: ["Sparkles", "ArrowRight", "Check", "Zap", "Leaf", "Rocket"],
  },
  {
    id: "lucide-geometric",
    name: "Geometric",
    mood: "Lucide — structural shapes",
    icons: ["Square", "Triangle", "Circle", "Diamond", "Hexagon", "Plus"],
  },
  {
    id: "lucide-editorial",
    name: "Editorial",
    mood: "Lucide — editorial marks",
    icons: ["Quote", "BookOpen", "Pencil", "Feather", "Type", "Asterisk"],
  },
];
