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
  gradient: string;
  icon: string;
}

const BRAND_OPTIONS: BrandOption[] = [
  {
    id: "nexus",
    name: "NEXUS",
    tag: "Next-Gen Engine",
    desc: "Cloud Hyperstructure Matrix",
    gradient: "linear-gradient(135deg, #06b6d4, #2563eb)",
    icon: "▲",
  },
  {
    id: "octocat",
    name: "OCTOCAT",
    tag: "Open Source Core",
    desc: "Distributed Version Control",
    gradient: "linear-gradient(135deg, #a855f7, #4f46e5)",
    icon: "⬡",
  },
  {
    id: "cyber",
    name: "CYBER",
    tag: "Defense Protocol",
    desc: "Zero-Trust Kernel Shield",
    gradient: "linear-gradient(135deg, #10b981, #0d9488)",
    icon: "❖",
  },
];

// ── Step 5 Color Data ──────────────────────────────────────────────
interface ColorOption {
  id: string;
  name: string;
  hex: string;
  borderGlow: string;
  bgRgba: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  {
    id: "CYAN",
    name: "Neon Cyan",
    hex: "#06b6d4",
    borderGlow: "rgba(6, 182, 212, 0.5)",
    bgRgba: "rgba(6, 182, 212, 0.12)",
  },
  {
    id: "VIOLET",
    name: "Cyber Violet",
    hex: "#a855f7",
    borderGlow: "rgba(168, 85, 247, 0.5)",
    bgRgba: "rgba(168, 85, 247, 0.12)",
  },
  {
    id: "EMERALD",
    name: "Matrix Emerald",
    hex: "#10b981",
    borderGlow: "rgba(16, 185, 129, 0.5)",
    bgRgba: "rgba(16, 185, 129, 0.12)",
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
    <div className="w-full text-slate-100 font-sans" style={{ minWidth: 0 }}>
      {/* ── Top Step Progress HUD (Clean, no duplicate outer header) ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingBottom: "14px",
          marginBottom: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: "rgba(6, 182, 212, 0.15)",
              color: "#22d3ee",
              border: "1px solid rgba(6, 182, 212, 0.35)",
              borderRadius: "8px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            VAULT PROTOCOL
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", fontFamily: "var(--font-mono, monospace)" }}>
            10-Step Interactive Wizard
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontFamily: "var(--font-mono, monospace)", color: "#cbd5e1" }}>
            STEP <span style={{ color: "#22d3ee", fontWeight: 800 }}>{currentStep}</span>/10
          </div>
          <div
            style={{
              width: "120px",
              height: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "999px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #06b6d4, #6366f1, #10b981)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${currentStep * 10}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#22d3ee", fontFamily: "var(--font-mono, monospace)" }}>
            {currentStep * 10}%
          </span>
        </div>
      </div>

      {/* ── 10-Step Interactive Breadcrumb Nav (No white scrollbar!) ── */}
      <div
        className="no-scrollbar scrollbar-none"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "10px",
          marginBottom: "18px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
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
              style={{
                background: isCurrent
                  ? "rgba(6, 182, 212, 0.22)"
                  : isCompleted
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(255, 255, 255, 0.02)",
                color: isCurrent
                  ? "#22d3ee"
                  : isCompleted
                  ? "#cbd5e1"
                  : "rgba(255, 255, 255, 0.25)",
                border: isCurrent
                  ? "1px solid rgba(6, 182, 212, 0.6)"
                  : isCompleted
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid transparent",
                boxShadow: isCurrent ? "0 0 12px rgba(6, 182, 212, 0.35)" : "none",
                borderRadius: "10px",
                padding: "6px 10px",
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: isCurrent ? 800 : 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                cursor: stepNum <= currentStep || isUnlocked ? "pointer" : "not-allowed",
                transition: "all 0.15s ease",
              }}
            >
              {isCompleted && !isCurrent ? (
                <CheckCircle2 style={{ width: 13, height: 13, color: "#34d399" }} />
              ) : (
                <span>{stepNum}</span>
              )}
              <span>
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

      {/* ── Active Step Body ── */}
      <div style={{ minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════════════════
              STEP 1: BASE NAME
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(6, 182, 212, 0.12)", border: "1px solid rgba(6, 182, 212, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22d3ee" }}>
                  <Key style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 1: Enter Base Name</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Type your codename or alias string to initiate the password seed.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#a5b4fc", fontWeight: 700, letterSpacing: "0.5px" }}>
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
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontFamily: "var(--font-mono, monospace)",
                    outline: "none",
                  }}
                  autoFocus
                />

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", paddingTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-mono, monospace)" }}>
                    Suggestions:
                  </span>
                  {["CIPHER", "SHADOW", "TITAN", "NEXUS", "KINETIC"].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setBaseName(suggestion)}
                      style={{
                        background: baseName === suggestion ? "rgba(6, 182, 212, 0.25)" : "rgba(255, 255, 255, 0.05)",
                        color: baseName === suggestion ? "#22d3ee" : "rgba(255, 255, 255, 0.7)",
                        border: baseName === suggestion ? "1px solid rgba(6, 182, 212, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono, monospace)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc" }}>
                  <Hash style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 2: Number Addition</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Append a numeric entropy value or pick a suggestion chip.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#a5b4fc", fontWeight: 700, letterSpacing: "0.5px" }}>
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
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontFamily: "var(--font-mono, monospace)",
                    outline: "none",
                  }}
                  autoFocus
                />

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", paddingTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-mono, monospace)" }}>
                    Suggestions:
                  </span>
                  {["42", "101", "777", "2026", "99"].map((numVal) => (
                    <button
                      key={numVal}
                      type="button"
                      onClick={() => setNumAddition(numVal)}
                      style={{
                        background: numAddition === numVal ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.05)",
                        color: numAddition === numVal ? "#a5b4fc" : "rgba(255, 255, 255, 0.7)",
                        border: numAddition === numVal ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono, monospace)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(251, 191, 36, 0.12)", border: "1px solid rgba(251, 191, 36, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
                  <Calculator style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 3: Math Challenge</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Solve the arithmetic calculation to capture the calculation segment.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(251, 191, 36, 0.06)",
                  border: "1px solid rgba(251, 191, 36, 0.25)",
                  borderRadius: "14px",
                  padding: "18px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "var(--font-mono, monospace)" }}>
                  ARITHMETIC LOCK
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-mono, monospace)", marginBottom: "14px" }}>
                  {mathProblem.num1} {mathProblem.op} {mathProblem.num2} = <span style={{ color: "#fbbf24" }}>?</span>
                </div>
                <input
                  type="text"
                  value={mathAnswer}
                  onChange={(e) => {
                    setMathAnswer(e.target.value.trim());
                    if (stepError) setStepError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && nextStep()}
                  placeholder="Type answer (e.g. 98)..."
                  style={{
                    width: "100%",
                    maxWidth: "280px",
                    margin: "0 auto",
                    display: "block",
                    padding: "12px",
                    textAlign: "center",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1px solid rgba(251, 191, 36, 0.35)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "18px",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono, monospace)",
                    outline: "none",
                  }}
                  autoFocus
                />
                {mathAnswer === mathProblem.answer && (
                  <p style={{ fontSize: "12px", color: "#34d399", marginTop: "8px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} /> Correct calculation confirmed!
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 4: BRAND LOGO SELECTION
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
                  <Globe style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 4: Brand Logo Selection</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Select one brand logo card to encode its identity into the key.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
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
                      style={{
                        background: isSelected ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.04)",
                        border: isSelected ? "1px solid #22d3ee" : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: isSelected ? "0 0 20px rgba(6, 182, 212, 0.3)" : "none",
                        borderRadius: "14px",
                        padding: "16px",
                        textAlign: "center",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        position: "relative",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isSelected && (
                        <span style={{ position: "absolute", top: 10, right: 10, color: "#22d3ee" }}>
                          <CheckCircle2 style={{ width: 16, height: 16 }} />
                        </span>
                      )}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "12px",
                          background: brand.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "20px",
                          fontWeight: 900,
                          marginBottom: "10px",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                        }}
                      >
                        {brand.icon}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
                        {brand.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#22d3ee", marginTop: "2px" }}>
                        {brand.tag}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(244, 114, 182, 0.12)", border: "1px solid rgba(244, 114, 182, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f472b6" }}>
                  <Palette style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 5: Color Choice</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Choose one spectrum button to capture its color designation.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
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
                        background: isSelected ? c.bgRgba : "rgba(255, 255, 255, 0.04)",
                        border: isSelected ? `1px solid ${c.hex}` : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: isSelected ? `0 0 20px ${c.borderGlow}` : "none",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: c.hex,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0f172a",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        {isSelected && "✓"}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>{c.name}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", fontFamily: "var(--font-mono, monospace)" }}>[{c.id}]</div>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                  <Cpu style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 6: Programming Language Tag</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Select your architecture tech tag abbreviation.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
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
                      style={{
                        background: isSelected ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.04)",
                        border: isSelected ? "1px solid #34d399" : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: isSelected ? "0 0 16px rgba(52, 211, 153, 0.3)" : "none",
                        borderRadius: "12px",
                        padding: "14px 10px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "var(--font-mono, monospace)", color: isSelected ? "#34d399" : "#ffffff" }}>
                        {t.id}
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#ffffff", marginTop: "3px" }}>
                        {t.label}
                      </div>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fb7185" }}>
                  <Flame style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 7: Special Symbol Selection</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Choose a special punctuation character for required entropy.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
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
                      style={{
                        background: isSelected ? "rgba(244, 63, 94, 0.15)" : "rgba(255, 255, 255, 0.04)",
                        border: isSelected ? "1px solid #fb7185" : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: isSelected ? "0 0 16px rgba(244, 63, 94, 0.3)" : "none",
                        borderRadius: "12px",
                        padding: "14px 10px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontSize: "26px", fontWeight: 900, fontFamily: "var(--font-mono, monospace)", color: "#fb7185" }}>
                        {sym.char}
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#ffffff", marginTop: "3px" }}>
                        {sym.name}
                      </div>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(6, 182, 212, 0.12)", border: "1px solid rgba(6, 182, 212, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22d3ee" }}>
                  <ShieldCheck style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 8: Verification Digit</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Enter the helper parity digit indicated in the security beacon hint.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(6, 182, 212, 0.08)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Radio style={{ width: 20, height: 20, color: "#22d3ee" }} />
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#22d3ee", fontFamily: "var(--font-mono, monospace)" }}>
                      SECURITY BEACON HINT:
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>
                      Designated system parity digit is:
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(6, 182, 212, 0.25)",
                    border: "1px solid rgba(6, 182, 212, 0.5)",
                    borderRadius: "10px",
                    padding: "6px 16px",
                    fontSize: "22px",
                    fontWeight: 900,
                    color: "#22d3ee",
                    fontFamily: "var(--font-mono, monospace)",
                    boxShadow: "0 0 16px rgba(6, 182, 212, 0.3)",
                  }}
                >
                  {expectedVerifyDigit}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                  style={{
                    width: "100%",
                    maxWidth: "240px",
                    margin: "0 auto",
                    display: "block",
                    padding: "12px",
                    textAlign: "center",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "20px",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono, monospace)",
                    outline: "none",
                  }}
                  autoFocus
                />
                {verifyDigit === expectedVerifyDigit && (
                  <p style={{ fontSize: "12px", color: "#34d399", textAlign: "center", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} /> Verification checksum matched!
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                  <Layers style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Step 9: String Assembly Inspection</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "2px 0 0" }}>
                    Review all 8 accumulated password components sequentially linked together.
                  </p>
                </div>
              </div>

              {/* Segment Breakdown */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                <span style={{ background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#22d3ee", fontWeight: 700 }}>
                  1. Base: {baseName || "CIPHER"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>_</span>
                <span style={{ background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#a5b4fc", fontWeight: 700 }}>
                  2. Num: {numAddition || "42"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>_</span>
                <span style={{ background: "rgba(251, 191, 36, 0.15)", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#fbbf24", fontWeight: 700 }}>
                  3. Math: {mathAnswer || "98"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>_</span>
                <span style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#c084fc", fontWeight: 700 }}>
                  4. Brand: {selectedBrand || "NEXUS"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>_</span>
                <span style={{ background: "rgba(244, 114, 182, 0.15)", border: "1px solid rgba(244, 114, 182, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#f472b6", fontWeight: 700 }}>
                  5. Color: {selectedColor || "CYAN"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>_</span>
                <span style={{ background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#34d399", fontWeight: 700 }}>
                  6. Tag: {techTag || "TS"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>_</span>
                <span style={{ background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#fb7185", fontWeight: 700 }}>
                  7. Sym: {specialSymbol || "#"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>_</span>
                <span style={{ background: "rgba(20, 184, 166, 0.15)", border: "1px solid rgba(20, 184, 166, 0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#2dd4bf", fontWeight: 700 }}>
                  8. Verify: {verifyDigit || "7"}
                </span>
              </div>

              {/* Raw Stream Buffer */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", fontFamily: "var(--font-mono, monospace)" }}>
                    <Terminal style={{ width: 14, height: 14, color: "#22d3ee" }} />
                    <span>SEQUENTIAL BUFFER STREAM</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#22d3ee",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono, monospace)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#22d3ee",
                    wordBreak: "break-all",
                  }}
                >
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "center", padding: "10px 0" }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: "0 auto",
                  borderRadius: "18px",
                  background: isUnlocked
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : "linear-gradient(135deg, #06b6d4, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 0 30px rgba(6, 182, 212, 0.4)",
                }}
              >
                {isUnlocked ? (
                  <Unlock style={{ width: 28, height: 28 }} />
                ) : (
                  <Key style={{ width: 28, height: 28 }} />
                )}
              </div>

              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
                  Step 10: Final Master Password
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", margin: "4px auto 0", maxWidth: "480px" }}>
                  Execute the uppercase transformation protocol to synthesize the Master Vault Key and unlock the challenge dashboard!
                </p>
              </div>

              {/* Master Key Card */}
              <div
                style={{
                  background: "rgba(6, 182, 212, 0.08)",
                  border: "1px solid rgba(6, 182, 212, 0.35)",
                  borderRadius: "16px",
                  padding: "18px",
                  maxWidth: "580px",
                  margin: "0 auto",
                  width: "100%",
                  boxShadow: "0 0 25px rgba(6, 182, 212, 0.15)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#22d3ee", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "var(--font-mono, monospace)" }}>
                  MASTER VAULT KEY (UPPERCASE ENCODING)
                </div>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.65)",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(6, 182, 212, 0.25)",
                    color: "#ffffff",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "17px",
                    fontWeight: 900,
                    letterSpacing: "1px",
                    wordBreak: "break-all",
                    userSelect: "all",
                  }}
                >
                  {assembledRaw.toUpperCase()}
                </div>
              </div>

              {/* Action Buttons (High contrast, vibrant, no buttonface leakage) */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "12px", paddingTop: "6px" }}>
                <button
                  type="button"
                  onClick={handleFinalUnlock}
                  disabled={isSubmitting}
                  style={{
                    background: isUnlocked
                      ? "linear-gradient(135deg, #059669, #10b981)"
                      : "linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #10b981 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "15px 26px",
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    fontFamily: "var(--font-mono, monospace)",
                    boxShadow: isUnlocked
                      ? "0 0 25px rgba(16, 185, 129, 0.5)"
                      : "0 0 30px rgba(6, 182, 212, 0.5)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{ width: 14, height: 14, border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      <span>Unlocking Master Vault...</span>
                    </>
                  ) : isUnlocked ? (
                    <>
                      <CheckCircle2 style={{ width: 18, height: 18, color: "#a7f3d0" }} />
                      <span>Vault Unlocked! Submitted!</span>
                    </>
                  ) : (
                    <>
                      <Unlock style={{ width: 16, height: 16 }} />
                      <span>TRANSFORM TO UPPERCASE & UNLOCK DASHBOARD</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "#f1f5f9",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    borderRadius: "14px",
                    padding: "15px 22px",
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono, monospace)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {copied ? <Check style={{ width: 15, height: 15, color: "#34d399" }} /> : <Copy style={{ width: 15, height: 15 }} />}
                  <span>{copied ? "Copied!" : "Copy Key"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error Banner ── */}
        {stepError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.35)",
              color: "#fca5a5",
              fontSize: "12px",
              fontFamily: "var(--font-mono, monospace)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0 }} />
            <span>{stepError}</span>
          </motion.div>
        )}

        {/* ── Bottom Step Navigation Buttons (Steps 1 to 9) ── */}
        {currentStep < 10 && (
          <div
            style={{
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: currentStep === 1 ? "rgba(255, 255, 255, 0.3)" : "#e2e8f0",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                cursor: currentStep === 1 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={nextStep}
              style={{
                background: "linear-gradient(135deg, #06b6d4, #6366f1)",
                border: "none",
                color: "#ffffff",
                padding: "9px 20px",
                borderRadius: "10px",
                fontSize: "12px",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.35)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
