"use client";

import { useProject } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PhotoAsset } from "@/lib/types";

type Question = {
  id: string;
  prompt: string;
  hint: string;
  field: keyof ReturnType<typeof initialAnswers>;
  type: "text" | "textarea" | "yesno" | "url" | "photos" | "choice";
  choices?: { value: string; label: string; sub?: string }[];
  optional?: boolean;
  dependsOn?: (answers: any) => boolean;
};

const initialAnswers = () => ({
  businessName: "",
  businessDescription: "",
  hasExistingSite: null as "yes" | "no" | null,
  existingSiteUrl: "",
  photos: [] as PhotoAsset[],
  targetAudience: "",
  sitePurpose: "",
  sellsProducts: null as "yes" | "no" | null,
  pageCount: null as "single" | "multi" | null,
});

const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "What's the name of your business?",
    hint: "The name people will see on the site. Can be changed later.",
    field: "businessName",
    type: "text",
  },
  {
    id: "q2",
    prompt: "In one or two sentences, what do you do?",
    hint: "Imagine explaining it to someone at a party. Plain words.",
    field: "businessDescription",
    type: "textarea",
  },
  {
    id: "q3",
    prompt: "Do you already have a website?",
    hint: "If yes, the agent can draw inspiration from it.",
    field: "hasExistingSite",
    type: "yesno",
  },
  {
    id: "q3b",
    prompt: "What's the URL?",
    hint: "Paste the link. We won't scrape it — it's context for the agent.",
    field: "existingSiteUrl",
    type: "url",
    dependsOn: (a) => a.hasExistingSite === "yes",
    optional: true,
  },
  {
    id: "q4",
    prompt: "Have any photos you'd like to include?",
    hint: "Optional. Drag to upload — they stay in your browser.",
    field: "photos",
    type: "photos",
    optional: true,
  },
  {
    id: "q5",
    prompt: "Who is this site for?",
    hint: "Describe the audience. Age, interests, what they're looking for.",
    field: "targetAudience",
    type: "textarea",
  },
  {
    id: "q6",
    prompt: "What does the site need to do?",
    hint: "Sell things? Collect leads? Tell a story? Book appointments?",
    field: "sitePurpose",
    type: "textarea",
  },
  {
    id: "q6b",
    prompt: "Will you be selling anything on the site?",
    hint: "Products, services, subscriptions — anything with a checkout.",
    field: "sellsProducts",
    type: "yesno",
  },
  {
    id: "q7",
    prompt: "One page, or several?",
    hint: "Choose the scope. You can add more pages later.",
    field: "pageCount",
    type: "choice",
    choices: [
      {
        value: "single",
        label: "Single page",
        sub: "Everything lives on one scrolling page.",
      },
      {
        value: "multi",
        label: "Multi page",
        sub: "Home, about, services, contact — separate routes.",
      },
    ],
  },
];

export default function IntakePage() {
  const { state, hydrated, patchIntake } = useProject();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Filter visible questions based on dependsOn
  const visibleQuestions = QUESTIONS.filter(
    (q) => !q.dependsOn || q.dependsOn(state.intake)
  );
  const current = visibleQuestions[step];
  const totalSteps = visibleQuestions.length;

  useEffect(() => {
    if (!hydrated) return;
    if (current?.type === "text" || current?.type === "url") {
      inputRef.current?.focus();
    } else if (current?.type === "textarea") {
      textareaRef.current?.focus();
    }
  }, [step, hydrated, current]);

  if (!hydrated) return null;

  const currentValue = state.intake[current.field];

  const canAdvance =
    current.optional ||
    (current.type === "text" && typeof currentValue === "string" && currentValue.trim().length > 0) ||
    (current.type === "url" && typeof currentValue === "string" && currentValue.trim().length > 0) ||
    (current.type === "textarea" && typeof currentValue === "string" && currentValue.trim().length > 0) ||
    (current.type === "yesno" && currentValue !== null) ||
    (current.type === "choice" && currentValue !== null) ||
    (current.type === "photos" && true);

  const advance = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      router.push("/builder/themes");
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canAdvance) {
      if (current.type !== "textarea" || e.metaKey || e.ctrlKey) {
        e.preventDefault();
        advance();
      }
    }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files) return;
    const next: PhotoAsset[] = [...state.intake.photos];
    for (const file of Array.from(files).slice(0, 12 - next.length)) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      next.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        dataUrl,
      });
    }
    patchIntake({ photos: next });
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Giant chapter numeral */}
      <div
        className="absolute -left-8 top-4 chapter-numeral pointer-events-none select-none"
        aria-hidden
      >
        {String(step + 1).padStart(2, "0")}
      </div>

      {/* Progress ticks */}
      <div className="absolute top-8 right-10 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-[2px] transition-all duration-500"
            style={{
              width: i === step ? "32px" : "14px",
              background:
                i < step
                  ? "var(--violet)"
                  : i === step
                  ? "var(--violet)"
                  : "var(--ink-700)",
            }}
          />
        ))}
        <span className="mono-label ml-4">
          {String(step + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
        </span>
      </div>

      {/* Question body */}
      <div className="px-10 pt-28 pb-16 max-w-4xl ml-auto mr-[8vw]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKeyDown}
          >
            <p className="mono-label-lg mb-6">
              § chapter 01 · question {String(step + 1).padStart(2, "0")}
            </p>

            <h2
              className="font-display leading-[0.98] mb-6"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 300 }}
            >
              {current.prompt}
            </h2>

            <p
              className="opacity-60 text-base mb-10 font-display italic"
              style={{ maxWidth: "56ch" }}
            >
              {current.hint}
            </p>

            {current.type === "text" && (
              <input
                ref={inputRef}
                type="text"
                className="field-hairline"
                placeholder="start typing…"
                value={(currentValue as string) ?? ""}
                onChange={(e) =>
                  patchIntake({ [current.field]: e.target.value } as any)
                }
              />
            )}

            {current.type === "url" && (
              <input
                ref={inputRef}
                type="url"
                className="field-hairline"
                placeholder="https://…"
                value={(currentValue as string) ?? ""}
                onChange={(e) =>
                  patchIntake({ [current.field]: e.target.value } as any)
                }
              />
            )}

            {current.type === "textarea" && (
              <textarea
                ref={textareaRef}
                className="field-hairline"
                rows={3}
                placeholder="start typing…"
                value={(currentValue as string) ?? ""}
                onChange={(e) =>
                  patchIntake({ [current.field]: e.target.value } as any)
                }
                style={{ fontSize: "22px", resize: "none" }}
              />
            )}

            {current.type === "yesno" && (
              <div className="flex gap-4 mt-4">
                {["yes", "no"].map((v) => (
                  <button
                    key={v}
                    onClick={() =>
                      patchIntake({ [current.field]: v } as any)
                    }
                    className="card-rect"
                    style={{
                      width: "180px",
                      borderColor:
                        currentValue === v ? "var(--violet)" : undefined,
                      boxShadow:
                        currentValue === v
                          ? "inset 3px 0 0 0 var(--violet)"
                          : undefined,
                    }}
                  >
                    <p className="mono-label mb-3">▸ option</p>
                    <p className="font-display text-3xl" style={{ fontWeight: 400 }}>
                      {v}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {current.type === "choice" && current.choices && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {current.choices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() =>
                      patchIntake({ [current.field]: c.value } as any)
                    }
                    className="card-rect text-left"
                    style={{
                      borderColor:
                        currentValue === c.value ? "var(--violet)" : undefined,
                      boxShadow:
                        currentValue === c.value
                          ? "inset 3px 0 0 0 var(--violet)"
                          : undefined,
                    }}
                  >
                    <p className="mono-label mb-3">▸ scope</p>
                    <p
                      className="font-display text-2xl mb-2"
                      style={{ fontWeight: 400 }}
                    >
                      {c.label}
                    </p>
                    <p className="text-sm opacity-60">{c.sub}</p>
                  </button>
                ))}
              </div>
            )}

            {current.type === "photos" && (
              <PhotoUploader
                photos={state.intake.photos}
                onUpload={handlePhotoUpload}
                onRemove={(id) =>
                  patchIntake({
                    photos: state.intake.photos.filter((p) => p.id !== id),
                  })
                }
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-6 mt-16">
          {step > 0 && (
            <button className="btn-ghost" onClick={goBack}>
              ◂ back
            </button>
          )}
          <button
            className="btn-primary"
            disabled={!canAdvance}
            onClick={advance}
          >
            {step === totalSteps - 1 ? "choose design packs" : "next"} ▸
          </button>
          {current.type !== "textarea" && (
            <span className="mono-label opacity-40 hidden md:inline">
              press ⏎ to continue
            </span>
          )}
        </div>
      </div>

      {/* Marginalia — previous answers summary */}
      <aside className="hidden xl:block absolute left-10 bottom-12 max-w-[240px]">
        <p className="mono-label mb-3">※ so far</p>
        <div className="space-y-2 text-[11px] font-mono text-[var(--ink-400)]">
          {visibleQuestions.slice(0, step).map((q, i) => {
            const v = state.intake[q.field];
            const display =
              typeof v === "string"
                ? v.slice(0, 40)
                : Array.isArray(v)
                ? `${v.length} photo${v.length === 1 ? "" : "s"}`
                : v;
            return (
              <div key={q.id} className="flex gap-2">
                <span className="opacity-40">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{String(display || "—")}</span>
              </div>
            );
          })}
        </div>
      </aside>
    </section>
  );
}

function PhotoUploader({
  photos,
  onUpload,
  onRemove,
}: {
  photos: PhotoAsset[];
  onUpload: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}) {
  const [isDragging, setDragging] = useState(false);

  return (
    <div>
      <label
        className="block border border-dashed p-10 cursor-pointer transition-colors"
        style={{
          borderColor: isDragging ? "var(--violet)" : "var(--ink-700)",
          background: isDragging ? "var(--violet-lo)" : "transparent",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onUpload(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => onUpload(e.target.files)}
        />
        <p className="mono-label mb-2">▸ drop or click</p>
        <p className="font-display italic text-xl opacity-80">
          Drop up to 12 images here
        </p>
        <p className="text-sm opacity-50 mt-2">
          Everything is kept in your browser. Nothing is uploaded to a server
          until you hit export.
        </p>
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-6">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative border aspect-square group"
              style={{ borderColor: "var(--ink-700)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.dataUrl}
                alt={p.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onRemove(p.id)}
                className="absolute top-1 right-1 bg-[var(--ink-950)] text-[var(--paper)] w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
