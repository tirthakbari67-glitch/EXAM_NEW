"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Key,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Hash,
  Palette,
  Layers,
  Cpu,
  Calculator,
  AlertCircle,
  Copy,
  Check,
  Flame,
  Globe,
  Radio,
} from "lucide-react";
import type { TechRelayRound } from "@/lib/api";

export interface CrackPasswordRoundProps {
  round: TechRelayRound;
  subIndex: number;
  answer: string;
  setAnswer: (ans: string) => void;
  onSubmit?: (finalAnswer?: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

// ── Step 4 Brand Data ──────────────────────────────────────────────
interface BrandOption {
  id: string;
  name: string;
  tag: string;
  desc: string;
  color: string;
  icon: string;
}

const BRAND_OPTIONS: BrandOption[] = [
  {
    id: "nexus",
    name: "NEXUS",
    tag: "Next-Gen Engine",
    desc: "Cloud Hyperstructure Matrix",
    color: "from-cyan-500 to-blue-600",
    icon: "▲",
  },
  {
    id: "octocat",
    name: "OCTOCAT",
    tag: "Open Source Core",
    desc: "Distributed Version Control",
    color: "from-purple-500 to-indigo-600",
    icon: "⬡",
  },
  {
    id: "cyber",
    name: "CYBER",
    tag: "Defense Protocol",
    desc: "Zero-Trust Kernel Shield",
    color: "from-emerald-500 to-teal-600",
    icon: "❖",
  },
];

// ── Step 5 Color Data ──────────────────────────────────────────────
interface ColorOption {
  id: string;
  name: string;
  hex: string;
  borderGlow: string;
  bgClass: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  {
    id: "CYAN",
    name: "Neon Cyan",
    hex: "#06b6d4",
    borderGlow: "rgba(6, 182, 212, 0.5)",
    bgClass: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    id: "VIOLET",
    name: "Cyber Violet",
    hex: "#a855f7",
    borderGlow: "rgba(168, 85, 247, 0.5)",
    bgClass: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: "EMERALD",
    name: "Matrix Emerald",
    hex: "#10b981",
    borderGlow: "rgba(16, 185, 129, 0.5)",
    bgClass: "from-emerald-500/20 to-emerald-500/5",
  },
];

// ── Step 6 Tech Tags ───────────────────────────────────────────────
const TECH_TAGS = [
  { id: "TS", label: "TypeScript", desc: "Strict type safety engine" },
  { id: "PY", label: "Python", desc: "AI & algorithmic pipelines" },
  { id: "GO", label: "Golang", desc: "High-concurrency systems" },
  { id: "RUST", label: "Rust", desc: "Memory-safe systems language" },
];

// ── Step 7 Special Symbols ─────────────────────────────────────────
const SPECIAL_SYMBOLS = [
  { char: "!", name: "Exclamation", desc: "Override flag" },
  { char: "#", name: "Hash / Sharp", desc: "Fragment identifier" },
  { char: "$", name: "Dollar / String", desc: "Security token marker" },
  { char: "&", name: "Ampersand", desc: "Parallel fork thread" },
];

export default function CrackPasswordRound({
  round,
  answer,
  setAnswer,
  onSubmit,
  isSubmitting = false,
}: CrackPasswordRoundProps) {
  // Step navigation (1 - 10)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Workflow State Parts
  const [baseName, setBaseName] = useState<string>("");
  const [numAddition, setNumAddition] = useState<string>("42");
  const [mathAnswer, setMathAnswer] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [techTag, setTechTag] = useState<string>("");
  const [specialSymbol, setSpecialSymbol] = useState<string>("");
  const [verifyDigit, setVerifyDigit] = useState<string>("");

  // Master Password State
  const [assembledRaw, setAssembledRaw] = useState<string>("");
  const [masterPassword, setMasterPassword] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [stepError, setStepError] = useState<string>("");

  // Step 3 Math constants (e.g. 14 x 7 = 98)
  const mathProblem = { num1: 14, num2: 7, op: "×", answer: "98" };
  // Step 8 Verification digit hint
  const expectedVerifyDigit = "7";

  // Recompute assembled raw string when parts change
  useEffect(() => {
    const parts = [
      baseName.trim() || "CIPHER",
      numAddition.trim() || "42",
      mathAnswer.trim() || "98",
      selectedBrand || "NEXUS",
      selectedColor || "CYAN",
      techTag || "TS",
      specialSymbol || "#",
      verifyDigit.trim() || "7",
    ];
    const assembled = parts.join("_");
    setAssembledRaw(assembled);
  }, [baseName, numAddition, mathAnswer, selectedBrand, selectedColor, techTag, specialSymbol, verifyDigit]);

  // Sync to parent answer if unlocked
  useEffect(() => {
    if (isUnlocked && masterPassword) {
      setAnswer(masterPassword);
    }
  }, [isUnlocked, masterPassword, setAnswer]);

  // Step validation helpers
  const validateStep = (step: number): boolean => {
    setStepError("");
    switch (step) {
      case 1:
        if (!baseName.trim()) {
          setStepError("Please enter an initial base name or select a quick suggestion.");
          return false;
        }
        return true;
      case 2:
        if (!numAddition.trim() || isNaN(Number(numAddition))) {
          setStepError("Please provide a valid numeric value.");
          return false;
        }
        return true;
      case 3:
        if (mathAnswer.trim() !== mathProblem.answer) {
          setStepError(`Incorrect math calculation. What is ${mathProblem.num1} ${mathProblem.op} ${mathProblem.num2}?`);
          return false;
        }
        return true;
      case 4:
        if (!selectedBrand) {
          setStepError("Please select one of the three brand logos to capture its name.");
          return false;
        }
        return true;
      case 5:
        if (!selectedColor) {
          setStepError("Please select one of the three color options.");
          return false;
        }
        return true;
      case 6:
        if (!techTag) {
          setStepError("Please select a programming language abbreviation tag.");
          return false;
        }
        return true;
      case 7:
        if (!specialSymbol) {
          setStepError("Please select a required special symbol character.");
          return false;
        }
        return true;
      case 8:
        if (verifyDigit.trim() !== expectedVerifyDigit) {
          setStepError(`Please enter the security verification digit shown in the hint ([${expectedVerifyDigit}]).`);
          return false;
        }
        return true;
      case 9:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setStepError("");
      setCurrentStep((prev) => Math.min(10, prev + 1));
    }
  };

  const prevStep = () => {
    setStepError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Step 10: Final Master Password Action
  const handleFinalUnlock = async () => {
    const finalKey = assembledRaw.toUpperCase();
    setMasterPassword(finalKey);
    setIsUnlocked(true);
    setAnswer(finalKey);

    if (onSubmit) {
      await onSubmit(finalKey);
    }
  };

  const handleCopy = () => {
    if (masterPassword || assembledRaw) {
      navigator.clipboard.writeText((masterPassword || assembledRaw).toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 text-slate-100 font-sans">
      {/* ── Outer Glassmorphic Terminal Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_12px_48px_0_rgba(0,0,0,0.5)] transition-all duration-300">
        
        {/* Ambient Top Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

        {/* ── Top Header & Round Badge ── */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-950/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              {isUnlocked ? (
                <Unlock className="h-6 w-6 text-emerald-400 animate-pulse" />
              ) : (
                <Lock className="h-6 w-6 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30 tracking-wider">
                  ROUND 5
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                  Vault Security Protocol
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Crack Final Password
                <Sparkles className="h-5 w-5 text-amber-400" />
              </h2>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-400">
              <span>STEP {currentStep} OF 10</span>
              <span className="text-cyan-400 font-bold">{currentStep * 10}%</span>
            </div>
            <div className="h-2 w-36 sm:w-48 overflow-hidden rounded-full bg-slate-800/80 border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${currentStep * 10}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* ── 10-Step Interactive Breadcrumb Nav ── */}
        <div className="relative z-10 my-6 flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
          {Array.from({ length: 10 }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep || isUnlocked;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => {
                  if (stepNum <= currentStep || isUnlocked) {
                    setStepError("");
                    setCurrentStep(stepNum);
                  }
                }}
                disabled={stepNum > currentStep && !isUnlocked}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-mono transition-all duration-200 ${
                  isCurrent
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold scale-105"
                    : isCompleted
                    ? "bg-slate-800/60 text-slate-300 border border-white/5 hover:border-cyan-500/30 cursor-pointer"
                    : "bg-slate-900/30 text-slate-600 border border-transparent opacity-60 cursor-not-allowed"
                }`}
                title={`Jump to Step ${stepNum}`}
              >
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <span>{stepNum}</span>
                )}
                <span className="hidden md:inline">
                  {stepNum === 1 && "Base"}
                  {stepNum === 2 && "Number"}
                  {stepNum === 3 && "Math"}
                  {stepNum === 4 && "Brand"}
                  {stepNum === 5 && "Color"}
                  {stepNum === 6 && "Tag"}
                  {stepNum === 7 && "Symbol"}
                  {stepNum === 8 && "Verify"}
                  {stepNum === 9 && "Assembly"}
                  {stepNum === 10 && "Master"}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Step Body with Smooth Animation ── */}
        <div className="relative z-10 min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════════
                STEP 1: BASE NAME
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 1: Enter Base Name</h3>
                    <p className="text-xs text-slate-400">
                      Input your codename or base string seed to initiate the master key construction.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono text-slate-300">
                    BASE IDENTIFIER STRING:
                  </label>
                  <input
                    type="text"
                    value={baseName}
                    onChange={(e) => {
                      setBaseName(e.target.value);
                      if (stepError) setStepError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && nextStep()}
                    placeholder="e.g. CIPHER, APEX, TITAN, MATRIX"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-sm sm:text-base font-mono text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    autoFocus
                  />

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500 font-mono">Quick Suggestions:</span>
                    {["CIPHER", "SHADOW", "TITAN", "NEXUS", "KINETIC"].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setBaseName(suggestion)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-mono transition ${
                          baseName === suggestion
                            ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/50"
                            : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5"
                        }`}
                      >
                        +{suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 2: NUMBER ADDITION
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 2: Number Addition</h3>
                    <p className="text-xs text-slate-400">
                      Append a numeric entropy value or pick a signature suggestion button.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono text-slate-300">
                    NUMERIC ENTROPY VALUE:
                  </label>
                  <input
                    type="number"
                    value={numAddition}
                    onChange={(e) => {
                      setNumAddition(e.target.value);
                      if (stepError) setStepError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && nextStep()}
                    placeholder="e.g. 42, 101, 777"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-sm sm:text-base font-mono text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    autoFocus
                  />

                  {/* Suggestion Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500 font-mono">Suggested Values:</span>
                    {["42", "101", "777", "2026", "99"].map((numVal) => (
                      <button
                        key={numVal}
                        type="button"
                        onClick={() => setNumAddition(numVal)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition ${
                          numAddition === numVal
                            ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/50"
                            : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5"
                        }`}
                      >
                        +{numVal}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 3: MATH CHALLENGE
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 3: Math Challenge</h3>
                    <p className="text-xs text-slate-400">
                      Solve the arithmetic puzzle to verify authorization and capture the calculation segment.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-300 font-semibold tracking-wide">
                      SECURITY CALCULATION QUESTION:
                    </span>
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-400 border border-amber-500/20">
                      Arithmetic Lock
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-mono font-black text-white text-center py-2 tracking-wider">
                    {mathProblem.num1} {mathProblem.op} {mathProblem.num2} = <span className="text-amber-400">?</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={mathAnswer}
                      onChange={(e) => {
                        setMathAnswer(e.target.value.trim());
                        if (stepError) setStepError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && nextStep()}
                      placeholder="Type correct answer (e.g. 98)..."
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3.5 text-center text-lg font-mono font-bold text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      autoFocus
                    />
                    {mathAnswer === mathProblem.answer && (
                      <p className="text-xs font-mono text-emerald-400 text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct calculation confirmed!
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 4: BRAND LOGO SELECTION
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 4: Brand Logo Selection</h3>
                    <p className="text-xs text-slate-400">
                      Select one of the three brand cards below. Its brand name will be captured into the key.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {BRAND_OPTIONS.map((brand) => {
                    const isSelected = selectedBrand === brand.name;
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(brand.name);
                          if (stepError) setStepError("");
                        }}
                        className={`group relative flex flex-col items-center justify-between rounded-2xl border p-5 text-center transition-all duration-200 ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_24px_rgba(6,182,212,0.3)] scale-[1.02]"
                            : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900/90"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 text-cyan-400">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        )}
                        <div
                          className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${brand.color} text-2xl font-black text-white shadow-lg`}
                        >
                          {brand.icon}
                        </div>
                        <div>
                          <div className="font-mono text-base font-bold text-white tracking-wider">
                            {brand.name}
                          </div>
                          <div className="text-[11px] font-mono text-cyan-400 mb-1">
                            {brand.tag}
                          </div>
                          <div className="text-xs text-slate-400">
                            {brand.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 5: COLOR CHOICE
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/30">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 5: Color Choice</h3>
                    <p className="text-xs text-slate-400">
                      Pick one of the three color spectrum buttons to encode its color designation string.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = selectedColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c.id);
                          if (stepError) setStepError("");
                        }}
                        style={{
                          borderColor: isSelected ? c.hex : "rgba(255,255,255,0.1)",
                          boxShadow: isSelected ? `0 0 20px ${c.borderGlow}` : "none",
                        }}
                        className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                          isSelected
                            ? "bg-slate-900/90 scale-[1.02]"
                            : "bg-slate-900/50 hover:bg-slate-900/80 hover:border-white/20"
                        }`}
                      >
                        <div
                          className="h-8 w-8 rounded-full shadow-md flex items-center justify-center text-slate-950 font-bold text-xs"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && "✓"}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-white font-mono">{c.name}</div>
                          <div className="text-xs text-slate-400 font-mono">[{c.id}]</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 6: TECH TAG
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 6: Programming Language Tag</h3>
                    <p className="text-xs text-slate-400">
                      Select your system architecture tech tag abbreviation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TECH_TAGS.map((t) => {
                    const isSelected = techTag === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTechTag(t.id);
                          if (stepError) setStepError("");
                        }}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-950/40 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.03]"
                            : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:bg-slate-900/90"
                        }`}
                      >
                        <div className="text-xl font-black font-mono tracking-wider">{t.id}</div>
                        <div className="text-xs font-semibold text-white mt-1">{t.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 7: SPECIAL SYMBOL
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 7: Special Symbol Selection</h3>
                    <p className="text-xs text-slate-400">
                      Choose a required special character symbol for punctuation entropy.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SPECIAL_SYMBOLS.map((sym) => {
                    const isSelected = specialSymbol === sym.char;
                    return (
                      <button
                        key={sym.char}
                        type="button"
                        onClick={() => {
                          setSpecialSymbol(sym.char);
                          if (stepError) setStepError("");
                        }}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 ${
                          isSelected
                            ? "border-rose-400 bg-rose-950/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-[1.03]"
                            : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:bg-slate-900/90"
                        }`}
                      >
                        <div className="text-3xl font-black font-mono text-rose-400">{sym.char}</div>
                        <div className="text-xs font-bold text-white mt-1">{sym.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sym.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 8: VERIFICATION DIGIT
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 8: Verification Digit</h3>
                    <p className="text-xs text-slate-400">
                      Enter the helper security verification digit provided in the system badge hint.
                    </p>
                  </div>
                </div>

                {/* Helper Digit UI Hint Box */}
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Radio className="h-6 w-6 text-cyan-400 animate-pulse" />
                    <div>
                      <span className="text-xs font-mono uppercase text-cyan-300 font-bold tracking-wider">
                        Security Beacon Hint:
                      </span>
                      <p className="text-xs text-slate-300">
                        The designated security verification parity digit is:
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 font-mono text-2xl font-black text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    {expectedVerifyDigit}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-300">
                    TYPE VERIFICATION DIGIT:
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={verifyDigit}
                    onChange={(e) => {
                      setVerifyDigit(e.target.value.trim());
                      if (stepError) setStepError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && nextStep()}
                    placeholder={`Enter helper digit ${expectedVerifyDigit}...`}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3.5 text-center text-xl font-mono font-bold text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    autoFocus
                  />
                  {verifyDigit === expectedVerifyDigit && (
                    <p className="text-xs font-mono text-emerald-400 text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verification checksum matched!
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 9: STRING ASSEMBLY PREVIEW
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 9 && (
              <motion.div
                key="step9"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 9: String Assembly Inspection</h3>
                    <p className="text-xs text-slate-400">
                      Review all 8 accumulated password components sequentially linked together.
                    </p>
                  </div>
                </div>

                {/* Segmented Token Chips */}
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Accumulated Segment Breakdown:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300">
                      1. Base: {baseName || "CIPHER"}
                    </span>
                    <span className="text-slate-600 font-mono">_</span>
                    <span className="rounded-lg bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 font-mono text-xs font-bold text-indigo-300">
                      2. Num: {numAddition || "42"}
                    </span>
                    <span className="text-slate-600 font-mono">_</span>
                    <span className="rounded-lg bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 font-mono text-xs font-bold text-amber-300">
                      3. Math: {mathAnswer || "98"}
                    </span>
                    <span className="text-slate-600 font-mono">_</span>
                    <span className="rounded-lg bg-purple-950/60 border border-purple-500/30 px-3 py-1.5 font-mono text-xs font-bold text-purple-300">
                      4. Brand: {selectedBrand || "NEXUS"}
                    </span>
                    <span className="text-slate-600 font-mono">_</span>
                    <span className="rounded-lg bg-pink-950/60 border border-pink-500/30 px-3 py-1.5 font-mono text-xs font-bold text-pink-300">
                      5. Color: {selectedColor || "CYAN"}
                    </span>
                    <span className="text-slate-600 font-mono">_</span>
                    <span className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300">
                      6. Tag: {techTag || "TS"}
                    </span>
                    <span className="text-slate-600 font-mono">_</span>
                    <span className="rounded-lg bg-rose-950/60 border border-rose-500/30 px-3 py-1.5 font-mono text-xs font-bold text-rose-300">
                      7. Sym: {specialSymbol || "#"}
                    </span>
                    <span className="text-slate-600 font-mono">_</span>
                    <span className="rounded-lg bg-teal-950/60 border border-teal-500/30 px-3 py-1.5 font-mono text-xs font-bold text-teal-300">
                      8. Verify: {verifyDigit || "7"}
                    </span>
                  </div>
                </div>

                {/* Raw Sequential Preview Container */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-cyan-400" />
                      <span className="font-mono text-xs text-slate-400 uppercase">
                        SEQUENTIAL BUFFER STREAM
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied" : "Copy Buffer"}</span>
                    </button>
                  </div>
                  <div className="font-mono text-sm sm:text-base text-cyan-300 font-semibold break-all bg-black/40 p-3 rounded-xl border border-white/5">
                    {assembledRaw}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 10: FINAL MASTER PASSWORD
            ══════════════════════════════════════════════════════════ */}
            {currentStep === 10 && (
              <motion.div
                key="step10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-center py-2"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  {isUnlocked ? (
                    <Unlock className="h-8 w-8 text-emerald-200 animate-bounce" />
                  ) : (
                    <Key className="h-8 w-8 text-white" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Step 10: Final Master Password
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1">
                    Execute the final uppercase transformation protocol to synthesize the Master Vault Key and unlock the challenge dashboard!
                  </p>
                </div>

                {/* Master Transformed Password Box */}
                <div className="rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-5 shadow-[0_0_24px_rgba(6,182,212,0.2)] max-w-2xl mx-auto">
                  <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-widest font-semibold mb-2">
                    MASTER VAULT KEY (UPPERCASE ENCODING)
                  </div>
                  <div className="font-mono text-base sm:text-lg font-black text-white tracking-wider break-all bg-black/60 p-4 rounded-xl border border-cyan-500/20 select-all">
                    {assembledRaw.toUpperCase()}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleFinalUnlock}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 px-8 py-4 font-mono text-sm sm:text-base font-bold text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition hover:opacity-95 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Unlocking Master Vault...</span>
                      </>
                    ) : isUnlocked ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                        <span>Vault Unlocked! Submitted!</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-5 w-5" />
                        <span>TRANSFORM TO UPPERCASE & UNLOCK DASHBOARD</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-4 font-mono text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Key Copied!" : "Copy Key"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error Banner if any ── */}
          {stepError && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-mono text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{stepError}</span>
            </motion.div>
          )}

          {/* ── Bottom Step Navigation Buttons (Steps 1 to 9) ── */}
          {currentStep < 10 && (
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2 text-xs font-mono text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-mono font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
