export type IntakeAnswers = {
  businessName: string;
  businessDescription: string;
  hasExistingSite: "yes" | "no" | null;
  existingSiteUrl: string;
  photos: PhotoAsset[];
  targetAudience: string;
  sitePurpose: string;
  sellsProducts: "yes" | "no" | null;
  pageCount: "single" | "multi" | null;
};

export type PhotoAsset = {
  id: string;
  name: string;
  dataUrl: string; // base64 preview
  description?: string;
};

export type ColorPack = {
  id: string;
  name: string;
  mood: string;
  colors: {
    bg: string;
    surface: string;
    ink: string;
    muted: string;
    accent: string;
    accentAlt: string;
  };
};

export type FontPack = {
  id: string;
  name: string;
  mood: string;
  display: string; // google font family name
  body: string;
  googleHref: string;
  sampleDisplay: string;
  sampleBody: string;
};

export type ButtonPack = {
  id: string;
  name: string;
  mood: string;
  css: string; // raw css for .btn
  sampleLabel: string;
};

export type IconPack = {
  id: string;
  name: string;
  mood: string;
  // lucide icon names (rendered client-side)
  icons: string[];
};

export type ThemeSelection = {
  colorPackId: string;
  fontPackId: string;
  buttonPackId: string;
  iconPackId: string;
};

export type Draft = {
  id: string;
  label: string; // A | B | C | D
  concept: string; // one-sentence direction
  html: string; // full html string
};

export type SubagentName =
  | "designer"
  | "layout"
  | "backend"
  | "tester"
  | "debugger"
  | "presenter";

export type SubagentStatus = {
  name: SubagentName;
  state: "pending" | "running" | "done" | "error";
  log: string[];
};

export type ProjectState = {
  intake: IntakeAnswers;
  theme: Partial<ThemeSelection>;
  drafts: Draft[];
  chosenDraftId: string | null;
  finalHtml: string | null;
  subagents: SubagentStatus[];
};

export const emptyIntake: IntakeAnswers = {
  businessName: "",
  businessDescription: "",
  hasExistingSite: null,
  existingSiteUrl: "",
  photos: [],
  targetAudience: "",
  sitePurpose: "",
  sellsProducts: null,
  pageCount: null,
};
